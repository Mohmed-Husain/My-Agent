import sys
from pathlib import Path
import traceback

# Ensure root backend dir is in sys.path
ROOT_DIR = Path(__file__).resolve().parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

try:
    from app.main import app
except Exception as exc:
    from fastapi import FastAPI
    from fastapi.responses import JSONResponse

    err_msg = str(exc)
    err_trace = traceback.format_exc()
    print("FATAL BACKEND STARTUP ERROR:\n", err_trace, flush=True)

    app = FastAPI(title="Diagnostics - Startup Failure")

    @app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"])
    async def diagnostic_error(path: str = ""):
        return JSONResponse(
            status_code=500,
            content={
                "status": "startup_error",
                "error": err_msg,
                "traceback": err_trace.splitlines(),
            },
        )
