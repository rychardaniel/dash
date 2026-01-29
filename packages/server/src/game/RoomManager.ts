import { GameRoom } from "./GameRoom.js";

export class RoomManager {
    private rooms: Map<string, GameRoom> = new Map();
    private playerToRoom: Map<string, string> = new Map();

    generateRoomCode(): string {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let code: string;
        do {
            code = "";
            for (let i = 0; i < 6; i++) {
                code += chars.charAt(Math.floor(Math.random() * chars.length));
            }
        } while (this.rooms.has(code));
        return code;
    }

    joinRoom(playerId: string, playerName: string, roomCode: string): GameRoom {
        let room = this.rooms.get(roomCode);

        if (!room) {
            // Create new room
            room = new GameRoom(roomCode);
            this.rooms.set(roomCode, room);
            console.log(`🏠 Created room: ${roomCode}`);
        }

        room.addPlayer(playerId, playerName);
        this.playerToRoom.set(playerId, roomCode);

        return room;
    }

    removePlayer(playerId: string): void {
        const roomCode = this.playerToRoom.get(playerId);
        if (!roomCode) return;

        const room = this.rooms.get(roomCode);
        if (!room) return;

        room.removePlayer(playerId);
        this.playerToRoom.delete(playerId);

        // Delete room if empty
        if (room.players.length === 0) {
            room.cleanup();
            this.rooms.delete(roomCode);
            console.log(`🏠 Deleted empty room: ${roomCode}`);
        }
    }

    getRoom(code: string): GameRoom | undefined {
        return this.rooms.get(code);
    }

    getPlayerRoom(playerId: string): GameRoom | undefined {
        const roomCode = this.playerToRoom.get(playerId);
        if (!roomCode) return undefined;
        return this.rooms.get(roomCode);
    }
}
