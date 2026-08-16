"use client";

import { useRef, useEffect } from "react";
import Editor, { OnMount, OnChange } from "@monaco-editor/react";
import { Socket } from "socket.io-client";

interface CodeEditorProps {
  roomId: string;
  socketRef: React.MutableRefObject<Socket | null>;
  initialCode: string;
  language: string;
}

const EMIT_DEBOUNCE_MS = 300;

export function CodeEditor({ roomId, socketRef, initialCode, language }: CodeEditorProps) {
  const editorRef = useRef<any>(null);
  const applyingRemoteChange = useRef(false);
  const emitTimer = useRef<NodeJS.Timeout | null>(null);

  const handleMount: OnMount = (editor) => {
    editorRef.current = editor;
  };

  const handleChange: OnChange = (value) => {
    if (applyingRemoteChange.current) return;
    if (value === undefined) return;

    const socket = socketRef.current;
    if (!socket) return;

    if (emitTimer.current) clearTimeout(emitTimer.current);

    emitTimer.current = setTimeout(() => {
      socket.emit("code:change", { roomId, content: value });
    }, EMIT_DEBOUNCE_MS);
  };

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    function handleRemoteUpdate(data: { content: string }) {
      const editor = editorRef.current;
      if (!editor) return;

      const currentValue = editor.getValue();
      if (currentValue === data.content) return;

      applyingRemoteChange.current = true;
      editor.setValue(data.content);
      applyingRemoteChange.current = false;
    }

    socket.on("code:update", handleRemoteUpdate);

    return () => {
      socket.off("code:update", handleRemoteUpdate);
    };
  }, [socketRef]);

  return (
    <Editor
      height="70vh"
      language={language}
      defaultValue={initialCode}
      onMount={handleMount}
      onChange={handleChange}
      theme="vs-dark"
      options={{
        fontSize: 14,
        minimap: { enabled: false },
      }}
    />
  );
}