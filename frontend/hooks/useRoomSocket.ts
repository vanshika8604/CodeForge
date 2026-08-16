"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

interface PresentUser {
  userId: string;
  name: string;
}

interface UseRoomSocketResult {
  connected: boolean;
  initialCode: string;
  initialLanguage: string;
  presentUsers: PresentUser[];
  socketRef: React.MutableRefObject<Socket | null>;
}

export function useRoomSocket(roomId: string): UseRoomSocketResult {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [initialCode, setInitialCode] = useState("");
  const [initialLanguage, setInitialLanguage] = useState("javascript");
  const [presentUsers, setPresentUsers] = useState<PresentUser[]>([]);

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
          setPresentUsers(response.presentUsers || []);
          setConnected(true);
        } else {
          console.error("Failed to join room:", response.error);
        }
      });
    });

    socket.on("room:user-joined", (data: PresentUser) => {
      setPresentUsers((prev) => {
        if (prev.some((u) => u.userId === data.userId)) return prev;
        return [...prev, data];
      });
    });

    socket.on("room:user-left", (data: { userId: string }) => {
      setPresentUsers((prev) => prev.filter((u) => u.userId !== data.userId));
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId]);

  return { connected, initialCode, initialLanguage, presentUsers, socketRef };
}