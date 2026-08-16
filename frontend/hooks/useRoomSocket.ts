"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { api } from "@/lib/api";

interface PresentUser {
  userId: string;
  name: string;
}

interface ChatMessage {
  id: string;
  content: string;
  createdAt: string;
  sender: { id: string; name: string };
}

interface UseRoomSocketResult {
  connected: boolean;
  initialCode: string;
  initialLanguage: string;
  presentUsers: PresentUser[];
  messages: ChatMessage[];
  sendMessage: (content: string) => void;
  socketRef: React.MutableRefObject<Socket | null>;
}

export function useRoomSocket(roomId: string): UseRoomSocketResult {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [initialCode, setInitialCode] = useState("");
  const [initialLanguage, setInitialLanguage] = useState("javascript");
  const [presentUsers, setPresentUsers] = useState<PresentUser[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
      auth: { token },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("room:join", roomId, async (response: any) => {
        if (!response.ok) {
          console.error("Failed to join room:", response.error);
          return;
        }

        setInitialCode(response.code || "");
        setInitialLanguage(response.language || "javascript");
        setPresentUsers(response.presentUsers || []);
        setConnected(true);

        try {
          const history = await api.rooms.getMessages(roomId);
          setMessages(history.messages);
        } catch (err) {
          console.error("Failed to load chat history:", err);
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

    socket.on("chat:message", (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId]);

  function sendMessage(content: string) {
    socketRef.current?.emit("chat:send", { roomId, content });
  }

  return {
    connected,
    initialCode,
    initialLanguage,
    presentUsers,
    messages,
    sendMessage,
    socketRef,
  };
}