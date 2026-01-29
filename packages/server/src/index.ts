import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { setupSocketHandlers } from "./socket/handlers.js";
import type { ClientToServerEvents, ServerToClientEvents } from "@dash/shared";

const PORT = 5000;
const HOST = "192.168.1.14";

const app = express();
const httpServer = createServer(app);

// Configure CORS
app.use(
    cors({
        origin: [`http://${HOST}:5173`, "http://localhost:5173"],
        credentials: true,
    }),
);

app.use(express.json());

// Socket.io setup with typed events
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: {
        origin: [`http://${HOST}:5173`, "http://localhost:5173"],
        methods: ["GET", "POST"],
        credentials: true,
    },
});

// Health check endpoint
app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Setup socket handlers
setupSocketHandlers(io);

httpServer.listen(PORT, HOST, () => {
    console.log(`🎮 dash Server running at http://${HOST}:${PORT}`);
    console.log(`📡 WebSocket ready for connections`);
});
