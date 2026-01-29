import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { setupSocketHandlers } from "./socket/handlers.js";
import type { ClientToServerEvents, ServerToClientEvents } from "@dash/shared";

const PORT = parseInt(process.env.PORT || "5000");
const HOST = process.env.HOST || "0.0.0.0";
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// Parse CLIENT_URL to support multiple origins (comma-separated)
const allowedOrigins = CLIENT_URL.split(",").map((url) => url.trim());

const app = express();
const httpServer = createServer(app);

// Configure CORS
app.use(
    cors({
        origin: allowedOrigins,
        credentials: true,
    }),
);

app.use(express.json());

// Socket.io setup with typed events
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: {
        origin: allowedOrigins,
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
