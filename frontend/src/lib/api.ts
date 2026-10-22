const RAW_API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://my-agent-backend-09t6.onrender.com";

// Strictly remove any trailing slashes to avoid '//api/v1/...' 404 errors
export const API_BASE_URL = RAW_API_URL.trim().replace(/\/+$/, "");

export interface StreamEvent {
  type: "text" | "card" | "question" | "done" | "error";
  content?: string;
  card_type?: string;
  data?: Record<string, unknown> | Array<Record<string, unknown>> | unknown;
  session_id?: string;
  message?: string;
}

export async function* streamChatMessage(
  message: string,
  sessionId: string | null,
  visitorName: string | null
): AsyncGenerator<StreamEvent, void, unknown> {
  const response = await fetch(`${API_BASE_URL}/api/v1/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      session_id: sessionId,
      visitor_name: visitorName,
    }),
  });

  if (!response.ok) {
    throw new Error(`Chat API error: ${response.status} ${response.statusText}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("Failed to get readable stream from response");
  }

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith("data: ")) continue;

      try {
        const jsonStr = trimmed.slice(6);
        const event: StreamEvent = JSON.parse(jsonStr);
        yield event;
      } catch (err) {
        console.warn("Failed to parse SSE line:", trimmed, err);
      }
    }
  }

  if (buffer.trim().startsWith("data: ")) {
    try {
      const event: StreamEvent = JSON.parse(buffer.trim().slice(6));
      yield event;
    } catch {}
  }
}

export async function fetchChatHistory(sessionId: string) {
  const res = await fetch(`${API_BASE_URL}/api/v1/chat/history/${sessionId}`);
  if (!res.ok) return null;
  return res.json();
}
