import type { Server } from "socket.io";
import type {
    RoomState,
    RoomPlayer,
    ClientToServerEvents,
    ServerToClientEvents,
    GAME_CONSTANTS,
} from "@dash/shared";
import { GameLoop } from "./GameLoop.js";
import { MapGenerator } from "./MapGenerator.js";

interface PlayerInfo {
    id: string;
    name: string;
    isHost: boolean;
}

type GameServer = Server<ClientToServerEvents, ServerToClientEvents>;

export class GameRoom {
    code: string;
    players: PlayerInfo[] = [];
    hostId: string = "";
    status: "waiting" | "playing" | "ended" = "waiting";
    gameLoop: GameLoop | null = null;
    private countdownTimer: ReturnType<typeof setTimeout> | null = null;

    constructor(code: string) {
        this.code = code;
    }

    addPlayer(id: string, name: string): void {
        // Check if player already exists
        if (this.players.find((p) => p.id === id)) return;

        const isHost = this.players.length === 0;
        this.players.push({ id, name, isHost });

        if (isHost) {
            this.hostId = id;
        }
    }

    removePlayer(id: string): void {
        const index = this.players.findIndex((p) => p.id === id);
        if (index === -1) return;

        const wasHost = this.players[index].isHost;
        this.players.splice(index, 1);

        // If host left and there are other players, assign new host
        if (wasHost && this.players.length > 0) {
            this.players[0].isHost = true;
            this.hostId = this.players[0].id;
        }

        // If game is playing and players < 2, end the game
        if (this.status === "playing" && this.players.length < 2) {
            this.endGame();
        }
    }

    getState(): RoomState {
        return {
            code: this.code,
            players: this.players.map((p) => ({
                id: p.id,
                name: p.name,
                isHost: p.isHost,
            })),
            status: this.status,
            hostId: this.hostId,
        };
    }

    startCountdown(io: GameServer): void {
        if (this.status !== "waiting") return;

        let countdown = 3;

        const tick = () => {
            io.to(this.code).emit("countdown", { seconds: countdown });

            if (countdown === 0) {
                this.startGame(io);
            } else {
                countdown--;
                this.countdownTimer = setTimeout(tick, 1000);
            }
        };

        tick();
    }

    startGame(io: GameServer): void {
        this.status = "playing";

        // Generate map with random seed
        const seed = Date.now();
        const map = MapGenerator.generate(seed);

        // Create game loop
        this.gameLoop = new GameLoop(
            this.code,
            this.players.map((p) => ({ id: p.id, name: p.name })),
            map,
            io,
        );

        // Send game started event with map data
        io.to(this.code).emit("game_started", { map });

        // Start the game loop
        this.gameLoop.start();
    }

    endGame(): void {
        this.status = "ended";
        if (this.gameLoop) {
            this.gameLoop.stop();
            this.gameLoop = null;
        }
    }

    cleanup(): void {
        if (this.countdownTimer) {
            clearTimeout(this.countdownTimer);
        }
        if (this.gameLoop) {
            this.gameLoop.stop();
        }
    }
}
