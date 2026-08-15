import { io } from "socket.io-client";

const TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmOTM5NWFkYS00ZTBmLTRkYjUtODIyYS0xNWUxZGQyYWI3NmQiLCJpYXQiOjE3ODY2ODIwMzYsImV4cCI6MTc4NzI4NjgzNn0.19XfqMFfm1ZCajP9rnrUgFQqQxB5yvKuUpS2VNaKtf8";const ROOM_ID = "1fa58c3c-a16b-49dc-9701-201a93b63d7b";

const socket = io("http://localhost:4000", { auth: { token: TOKEN } });

socket.on("connect", () => {
  socket.emit("room:join", ROOM_ID, (response: any) => {
    console.log("joined. current code:", response.code);

    // simulate typing after a short delay
    setTimeout(() => {
      socket.emit("code:change", { roomId: ROOM_ID, content: "console.log('hello from client A')" });
    }, 1000);
  });
});

socket.on("code:update", (data) => {
  console.log("received code update:", data.content);
});