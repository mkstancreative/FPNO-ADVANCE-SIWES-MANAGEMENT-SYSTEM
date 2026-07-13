import { TOKEN_KEY, REFRESH_KEY, storeTokens } from "./api";
import type { RefreshTokenResponse } from "../types/auth";
import type { Notification } from "../types/notifications";

type NotificationListener = (notification: Notification) => void;
type ConnectionListener = (connected: boolean) => void;

function extractNotification(raw: unknown): Notification | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;

  // Already a bare notification
  if (typeof obj._id === "string" && typeof obj.title === "string") {
    return obj as unknown as Notification;
  }

  // Wrapped: { type: "notification", data: {...} }  OR  { event: "notification", data: {...} }
  const isNotifEvent =
    obj.type === "notification" || obj.event === "notification";
  if (isNotifEvent && obj.data && typeof obj.data === "object") {
    const inner = obj.data as Record<string, unknown>;
    if (typeof inner._id === "string" && typeof inner.title === "string") {
      return inner as unknown as Notification;
    }
  }

  return null;
}

class NotificationWebSocket {
  private ws: WebSocket | null = null;
  private readonly baseUrl: string;
  private listeners: Set<NotificationListener> = new Set();
  private connectionListeners: Set<ConnectionListener> = new Set();
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 8;
  private readonly baseDelay = 2000;
  private isIntentionallyClosed = false;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    baseUrl: string = import.meta.env.VITE_WS_URL ?? "ws://localhost:5000",
  ) {
    this.baseUrl = baseUrl;
  }

  connect(): Promise<void> {
    // Always pull the freshest token from storage
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
      return Promise.reject(new Error("No access token — user not logged in"));
    }

    return new Promise((resolve, reject) => {
      // Already open
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      // Connecting — wait for it instead of creating a second socket
      if (this.ws?.readyState === WebSocket.CONNECTING) {
        resolve();
        return;
      }

      this.isIntentionallyClosed = false;
      let settled = false; // guard so we only resolve/reject once

      try {
        const wsUrl = `${this.baseUrl}?token=${token}`;
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log("[WS] Connected");
          this.reconnectAttempts = 0;
          this.notifyConnectionChange(true);
          if (!settled) {
            settled = true;
            resolve();
          }
        };

        this.ws.onmessage = (event: MessageEvent) => {
          try {
            const raw: unknown = JSON.parse(event.data as string);
            const notification = extractNotification(raw);
            if (notification) {
              this.notifyListeners(notification);
            } else {
              // Silently ignore pings / other messages
              console.debug("[WS] Non-notification message:", raw);
            }
          } catch {
            console.error("[WS] Failed to parse message:", event.data);
          }
        };

        this.ws.onerror = (error) => {
          console.error("[WS] Error:", error);
          // Only reject on initial connection failure
          if (!settled) {
            settled = true;
            reject(error);
          }
        };

        this.ws.onclose = (ev) => {
          console.log(`[WS] Closed (code=${ev.code})`);
          this.ws = null;
          this.notifyConnectionChange(false);
          // Resolve if we never got onopen (e.g. immediate close before error fires)
          if (!settled) {
            settled = true;
            reject(new Error(`WS closed early: code=${ev.code}`));
          }

          if (!this.isIntentionallyClosed) {
            this.scheduleReconnect();
          }
        };
      } catch (error) {
        if (!settled) {
          settled = true;
          reject(error);
        }
      }
    });
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.warn("[WS] Max reconnect attempts reached");
      return;
    }

    // Check token still exists before bothering
    if (!localStorage.getItem(TOKEN_KEY)) {
      console.log("[WS] No token — skipping reconnect");
      return;
    }

    const delay =
      Math.min(this.baseDelay * 2 ** this.reconnectAttempts, 30_000) +
      Math.random() * 1000;

    this.reconnectAttempts++;
    console.log(
      `[WS] Reconnecting in ${Math.round(delay)}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`,
    );

    this.reconnectTimer = setTimeout(() => {
      // Try refreshing the token first in case expiry caused the drop
      this.refreshTokenThenConnect();
    }, delay);
  }

  private async refreshTokenThenConnect() {
    const refreshToken = localStorage.getItem(REFRESH_KEY);
    if (refreshToken) {
      try {
        const apiUrl = import.meta.env.VITE_API_URL as string;
        const res = await fetch(`${apiUrl}/auth/refresh-token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });
        if (res.ok) {
          const json = (await res.json()) as RefreshTokenResponse & {
            data: { refreshToken?: string };
          };
          const newAccess = json.data.accessToken;
          const newRefresh = json.data.refreshToken ?? refreshToken;
          storeTokens(newAccess, newRefresh);
          console.log("[WS] Token refreshed before reconnect");
        }
      } catch {
        console.warn(
          "[WS] Token refresh before reconnect failed — using existing token",
        );
      }
    }
    this.connect().catch((err) => console.error("[WS] Reconnect failed:", err));
  }

  subscribe(listener: NotificationListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  subscribeToConnectionChanges(listener: ConnectionListener): () => void {
    this.connectionListeners.add(listener);
    return () => this.connectionListeners.delete(listener);
  }

  private notifyListeners(notification: Notification) {
    this.listeners.forEach((l) => {
      try {
        l(notification);
      } catch (err) {
        console.error("[WS] Listener error:", err);
      }
    });
  }

  private notifyConnectionChange(connected: boolean) {
    this.connectionListeners.forEach((l) => {
      try {
        l(connected);
      } catch (err) {
        console.error("[WS] Connection listener error:", err);
      }
    });
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  disconnect() {
    this.isIntentionallyClosed = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close(1000, "Client disconnect");
      this.ws = null;
    }
    this.notifyConnectionChange(false);
  }
}

// Singleton instance
export const notificationWS = new NotificationWebSocket();
