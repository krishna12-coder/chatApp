import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});

// Used to store online users and their socket IDs
const userSocketMap = {}; // { userId: socketId }

// Store group sockets (groupId -> array of socketIds)
const groupSocketMap = {}; // { groupId: [socketId1, socketId2, ...] }

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

export function getGroupSocketIds(groupId) {
  return groupSocketMap[groupId] || [];
}

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;

  // Notify all clients of online users
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Join a group chat room
  socket.on("joinGroup", (groupId) => {
    socket.join(groupId);
    if (!groupSocketMap[groupId]) {
      groupSocketMap[groupId] = [];
    }
    groupSocketMap[groupId].push(socket.id);
    console.log(`User ${userId} joined group ${groupId}`);
  });

  // Leave a group chat room
  socket.on("leaveGroup", (groupId) => {
    socket.leave(groupId);
    groupSocketMap[groupId] = groupSocketMap[groupId]?.filter(
      (id) => id !== socket.id
    );
    console.log(`User ${userId} left group ${groupId}`);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    // Remove user from all groups
    Object.keys(groupSocketMap).forEach((groupId) => {
      groupSocketMap[groupId] = groupSocketMap[groupId].filter(
        (id) => id !== socket.id
      );
    });
  });
});

export { io, app, server };
