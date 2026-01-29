import type { Server, Socket } from "socket.io";
import type { ClientToServerEvents, ServerToClientEvents } from "@dash/shared";
import { RoomManager } from "../game/RoomManager.js";

const roomManager = new RoomManager();

type GameSocket = Socket<ClientToServerEvents, ServerToClientEvents>;
type GameServer = Server<ClientToServerEvents, ServerToClientEvents>;

export function setupSocketHandlers(io: GameServer): void {
    io.on("connection", (socket: GameSocket) => {
        console.log(`🔌 Player connected: ${socket.id}`);

        // Join or create room
        socket.on("join_room", ({ playerName, roomCode }) => {
            const upperCode = roomCode.toUpperCase();

            // Leave any existing room first
            const existingRoom = roomManager.getPlayerRoom(socket.id);
            if (existingRoom) {
                roomManager.removePlayer(socket.id);
                socket.leave(existingRoom.code);
            }

            // Join or create room
            const room = roomManager.joinRoom(socket.id, playerName, upperCode);
            socket.join(room.code);

            console.log(`👤 ${playerName} joined room ${room.code}`);

            // Broadcast updated room state to all players in room
            io.to(room.code).emit("room_state", room.getState());
        });

        // Leave room
        socket.on("leave_room", () => {
            const room = roomManager.getPlayerRoom(socket.id);
            if (room) {
                const code = room.code;
                roomManager.removePlayer(socket.id);
                socket.leave(code);

                // Broadcast updated state to remaining players
                const updatedRoom = roomManager.getRoom(code);
                if (updatedRoom) {
                    io.to(code).emit("room_state", updatedRoom.getState());
                }
            }
        });

        // Start game (host only)
        socket.on("start_game", () => {
            const room = roomManager.getPlayerRoom(socket.id);
            if (!room) {
                socket.emit("room_error", {
                    message: "Você não está em uma sala",
                });
                return;
            }

            if (room.hostId !== socket.id) {
                socket.emit("room_error", {
                    message: "Apenas o host pode iniciar o jogo",
                });
                return;
            }

            if (room.players.length < 2) {
                socket.emit("room_error", {
                    message: "Mínimo 2 jogadores para iniciar",
                });
                return;
            }

            // Start countdown
            room.startCountdown(io);
        });

        // Player input
        socket.on("player_input", (input) => {
            const room = roomManager.getPlayerRoom(socket.id);
            if (room && room.gameLoop) {
                room.gameLoop.handleInput(socket.id, input);
            }
        });

        // Use ability
        socket.on("use_ability", ({ ability }) => {
            const room = roomManager.getPlayerRoom(socket.id);
            if (room && room.gameLoop) {
                room.gameLoop.useAbility(socket.id, ability);
            }
        });

        // Disconnect
        socket.on("disconnect", () => {
            console.log(`🔌 Player disconnected: ${socket.id}`);

            const room = roomManager.getPlayerRoom(socket.id);
            if (room) {
                const code = room.code;
                roomManager.removePlayer(socket.id);

                // Broadcast updated state
                const updatedRoom = roomManager.getRoom(code);
                if (updatedRoom) {
                    io.to(code).emit("room_state", updatedRoom.getState());
                }
            }
        });
    });
}
