import time
from datetime import datetime, timezone
from typing import Optional, Tuple
from fastapi import Request
from app.config import settings

class RateLimiter:
    """
    Production-grade 4-tier rate limiter:
    1. Per-session limit: Prevents chat message spamming within an active session.
    2. Per-IP abuse limit: Blocks automated scrapers / bot bursts per client IP.
    3. Global daily LLM budget: Hard daily ceiling on AI inferences to protect budget.
    4. HTTP 429 Retry-After calculation.
    """

    def __init__(self):
        # session_id -> list of timestamps
        self.session_windows: dict[str, list[float]] = {}
        # ip_address -> list of timestamps
        self.ip_windows: dict[str, list[float]] = {}
        # Global daily counter tracking
        self.daily_call_count: int = 0
        self.current_day: str = self._get_current_day()

    def _get_current_day(self) -> str:
        return datetime.now(timezone.utc).strftime("%Y-%m-%d")

    def _clean_window(self, timestamps: list[float], window_seconds: int, now: float) -> list[float]:
        threshold = now - window_seconds
        return [ts for ts in timestamps if ts > threshold]

    def _check_and_reset_daily_budget(self):
        today = self._get_current_day()
        if today != self.current_day:
            self.current_day = today
            self.daily_call_count = 0

    def extract_client_ip(self, request: Request) -> str:
        """Extracts client IP, respecting X-Forwarded-For from Cloudflare / Render / Vercel proxies."""
        x_forwarded_for = request.headers.get("x-forwarded-for")
        if x_forwarded_for:
            # First IP in the list is the original client
            return x_forwarded_for.split(",")[0].strip()
        cf_connecting_ip = request.headers.get("cf-connecting-ip")
        if cf_connecting_ip:
            return cf_connecting_ip.strip()
        if request.client and request.client.host:
            return request.client.host
        return "127.0.0.1"

    def check_rate_limits(
        self,
        request: Request,
        session_id: Optional[str] = None
    ) -> Tuple[bool, Optional[str], int]:
        """
        Evaluates the 4 tiers.
        Returns:
            (allowed: bool, reason: Optional[str], retry_after_seconds: int)
        """
        if not settings.RATE_LIMIT_ENABLED:
            return True, None, 0

        now = time.time()
        client_ip = self.extract_client_ip(request)

        # -------------------------------------------------------------
        # Tier 3: Global Daily LLM Budget
        # -------------------------------------------------------------
        self._check_and_reset_daily_budget()
        if self.daily_call_count >= settings.RATE_LIMIT_GLOBAL_DAILY_BUDGET:
            # Seconds until midnight UTC
            now_dt = datetime.now(timezone.utc)
            seconds_until_midnight = (
                (24 - now_dt.hour - 1) * 3600
                + (60 - now_dt.minute - 1) * 60
                + (60 - now_dt.second)
            )
            return (
                False,
                "Global daily AI interaction quota reached. Please check back tomorrow!",
                max(1, seconds_until_midnight)
            )

        # -------------------------------------------------------------
        # Tier 2: Per-IP Abuse Limit
        # -------------------------------------------------------------
        ip_ts = self.ip_windows.get(client_ip, [])
        ip_ts = self._clean_window(ip_ts, settings.RATE_LIMIT_IP_WINDOW, now)
        self.ip_windows[client_ip] = ip_ts

        if len(ip_ts) >= settings.RATE_LIMIT_IP_MAX:
            oldest = ip_ts[0]
            retry_after = int(settings.RATE_LIMIT_IP_WINDOW - (now - oldest)) + 1
            return (
                False,
                "Too many requests from your IP address. Please slow down.",
                max(1, retry_after)
            )

        # -------------------------------------------------------------
        # Tier 1: Per-Session Message Limit
        # -------------------------------------------------------------
        if session_id:
            sess_ts = self.session_windows.get(session_id, [])
            sess_ts = self._clean_window(sess_ts, settings.RATE_LIMIT_SESSION_WINDOW, now)
            self.session_windows[session_id] = sess_ts

            if len(sess_ts) >= settings.RATE_LIMIT_SESSION_MAX:
                oldest = sess_ts[0]
                retry_after = int(settings.RATE_LIMIT_SESSION_WINDOW - (now - oldest)) + 1
                return (
                    False,
                    "You are sending messages too quickly in this session. Please pause a moment.",
                    max(1, retry_after)
                )

        # If all checks pass, record the call
        self.ip_windows[client_ip].append(now)
        if session_id:
            self.session_windows[session_id].append(now)
        self.daily_call_count += 1

        return True, None, 0

rate_limiter = RateLimiter()
