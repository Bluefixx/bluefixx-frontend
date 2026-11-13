import { io, Socket } from "socket.io-client";
import { getAccessToken } from "@/lib/api/client";

const rawBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const SOCKET_ORIGIN = rawBaseUrl.replace(/\/+$/, "").replace(/\/api\/v1$/, "");

let socketInstance: Socket | null = null;
let socketToken: string | null = null;

export function getSocket(): Socket | null {
  const token = getAccessToken();
  if (!token) {
    if (socketInstance) {
      socketInstance.disconnect();
      socketInstance = null;
      socketToken = null;
    }
    return null;
  }

  if (socketInstance && socketToken === token) {
    if (!socketInstance.connected) {
      socketInstance.connect();
    }
    return socketInstance;
  }

  if (socketInstance) {
    socketInstance.disconnect();
  }

  socketToken = token;
  socketInstance = io(SOCKET_ORIGIN, {
    auth: { accessToken: token },
    withCredentials: true,
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });

  return socketInstance;
}

export function disconnectSocket(): void {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
    socketToken = null;
  }
}

export interface SocketAck<T = unknown> {
  data?: T;
  error?: { code?: string; message?: string };
}

export function emitWithAck<T = unknown>(
  socket: Socket,
  event: string,
  payload: unknown
): Promise<T> {
  return new Promise((resolve, reject) => {
    socket.emit(event, payload, (res: SocketAck<T>) => {
      if (res?.error) {
        reject(new Error(res.error.message || res.error.code || "Socket event failed"));
      } else {
        resolve((res?.data ?? res) as T);
      }
    });
  });
}
