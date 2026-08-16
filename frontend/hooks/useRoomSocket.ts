//reusable piece of react logic to handle socket connection and events for a specific room

"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

interface UseRoomSocketResult {
  connected: boolean;
  initialCode: string;
  initialLanguage: string;
  socketRef: React.MutableRefObject<Socket | null>;
}

export function useRoomSocket(roomId: string): UseRoomSocketResult {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [initialCode, setInitialCode] = useState("");
  const [initialLanguage, setInitialLanguage] = useState("javascript");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
      auth: { token },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("room:join", roomId, (response: any) => {
        if (response.ok) {
          setInitialCode(response.code || "");
          setInitialLanguage(response.language || "javascript");
          setConnected(true);
        } else {
          console.error("Failed to join room:", response.error);
        }
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId]);

  return { connected, initialCode, initialLanguage, socketRef };
}