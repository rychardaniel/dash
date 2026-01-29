import type { Server } from "socket.io";
import type {
    Player,
    Trap,
    MapData,
    GameState,
    PlayerInput,
    AbilityType,
    ClientToServerEvents,
    ServerToClientEvents,
    GAME_CONSTANTS,
    PlayerScore,
    Wall,
} from "@dash/shared";

type GameServer = Server<ClientToServerEvents, ServerToClientEvents>;

interface PlayerData {
    id: string;
    name: string;
}

// Game constants
const TICK_RATE = 60;
const TICK_INTERVAL = 1000 / TICK_RATE;
const ROUND_DURATION = 120; // 2 minutes
const PLAYER_RADIUS = 15;
const PLAYER_SPEED = 200;
const VISION_RADIUS = 150;

// Ability constants
const DASH_SPEED_MULTIPLIER = 3;
const DASH_DURATION = 200;
const DASH_COOLDOWN = 5000;

const STUN_DURATION = 1000;
const STUN_RADIUS = 60;
const STUN_COOLDOWN = 10000;

const TRAP_STUN_DURATION = 1500;
const TRAP_RADIUS = 25;
const TRAP_COOLDOWN = 15000;

const CATCH_DISTANCE = 30;
const CATCH_IMMUNITY_DURATION = 2000;

export class GameLoop {
    private roomCode: string;
    private players: Map<string, Player> = new Map();
    private traps: Map<string, Trap> = new Map();
    private map: MapData;
    private io: GameServer;
    private interval: ReturnType<typeof setInterval> | null = null;
    private timeRemaining: number = ROUND_DURATION;
    private roundNumber: number = 1;
    private lastTick: number = Date.now();
    private inputs: Map<string, PlayerInput> = new Map();
    private catchImmunity: Map<string, number> = new Map();

    constructor(
        roomCode: string,
        playerData: PlayerData[],
        map: MapData,
        io: GameServer,
    ) {
        this.roomCode = roomCode;
        this.map = map;
        this.io = io;

        // Initialize players
        playerData.forEach((data, index) => {
            const spawnPoint = map.spawnPoints[index % map.spawnPoints.length];
            const player: Player = {
                id: data.id,
                name: data.name,
                x: spawnPoint.x,
                y: spawnPoint.y,
                velocityX: 0,
                velocityY: 0,
                isCatcher: index === 0, // First player is catcher
                score: 0,
                cooldowns: {
                    dash: 0,
                    stun: 0,
                    trap: 0,
                },
                stunned: false,
                stunnedUntil: 0,
                dashing: false,
                dashEndTime: 0,
            };
            this.players.set(data.id, player);
        });
    }

    start(): void {
        this.lastTick = Date.now();
        this.interval = setInterval(() => this.tick(), TICK_INTERVAL);
        console.log(`🎮 Game started in room ${this.roomCode}`);
    }

    stop(): void {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        console.log(`🛑 Game stopped in room ${this.roomCode}`);
    }

    handleInput(playerId: string, input: PlayerInput): void {
        this.inputs.set(playerId, input);
    }

    useAbility(playerId: string, ability: AbilityType): void {
        const player = this.players.get(playerId);
        if (!player) return;

        // Catcher can't use abilities
        if (player.isCatcher) return;

        // Can't use abilities while stunned
        if (player.stunned) return;

        const now = Date.now();

        switch (ability) {
            case "dash":
                if (player.cooldowns.dash <= now) {
                    this.activateDash(player);
                }
                break;
            case "stun":
                if (player.cooldowns.stun <= now) {
                    this.activateStun(player);
                }
                break;
            case "trap":
                if (player.cooldowns.trap <= now) {
                    this.activateTrap(player);
                }
                break;
        }
    }

    private activateDash(player: Player): void {
        const now = Date.now();
        player.dashing = true;
        player.dashEndTime = now + DASH_DURATION;
        player.cooldowns.dash = now + DASH_COOLDOWN;
    }

    private activateStun(player: Player): void {
        const now = Date.now();
        player.cooldowns.stun = now + STUN_COOLDOWN;

        // Find and stun the catcher if in range
        for (const [_, other] of this.players) {
            if (other.isCatcher) {
                const distance = this.getDistance(player, other);
                if (distance <= STUN_RADIUS) {
                    other.stunned = true;
                    other.stunnedUntil = now + STUN_DURATION;
                }
                break;
            }
        }
    }

    private activateTrap(player: Player): void {
        const now = Date.now();
        player.cooldowns.trap = now + TRAP_COOLDOWN;

        const trap: Trap = {
            id: `trap_${now}_${player.id}`,
            x: player.x,
            y: player.y,
            placedBy: player.id,
            active: true,
            radius: TRAP_RADIUS,
        };

        this.traps.set(trap.id, trap);
    }

    private tick(): void {
        const now = Date.now();
        const deltaTime = (now - this.lastTick) / 1000; // Convert to seconds
        this.lastTick = now;

        // Update time remaining
        this.timeRemaining -= deltaTime;
        if (this.timeRemaining <= 0) {
            this.endGame();
            return;
        }

        // Update players
        for (const [playerId, player] of this.players) {
            // Update stun status
            if (player.stunned && now >= player.stunnedUntil) {
                player.stunned = false;
            }

            // Update dash status
            if (player.dashing && now >= player.dashEndTime) {
                player.dashing = false;
            }

            // Skip movement if stunned
            if (player.stunned) continue;

            // Get input
            const input = this.inputs.get(playerId);
            if (input) {
                const speed = player.dashing
                    ? PLAYER_SPEED * DASH_SPEED_MULTIPLIER
                    : PLAYER_SPEED;

                // Normalize input
                const magnitude = Math.sqrt(
                    input.direction.x ** 2 + input.direction.y ** 2,
                );
                if (magnitude > 0) {
                    const normalizedX = input.direction.x / magnitude;
                    const normalizedY = input.direction.y / magnitude;

                    player.velocityX = normalizedX * speed;
                    player.velocityY = normalizedY * speed;
                } else {
                    player.velocityX = 0;
                    player.velocityY = 0;
                }
            }

            // Apply movement
            const newX = player.x + player.velocityX * deltaTime;
            const newY = player.y + player.velocityY * deltaTime;

            // Check wall collisions
            if (!this.checkWallCollision(newX, player.y, PLAYER_RADIUS)) {
                player.x = newX;
            }
            if (!this.checkWallCollision(player.x, newY, PLAYER_RADIUS)) {
                player.y = newY;
            }

            // Increment score for non-catchers
            if (!player.isCatcher) {
                player.score += deltaTime;
            }
        }

        // Check trap collisions (only catcher triggers traps)
        for (const [trapId, trap] of this.traps) {
            if (!trap.active) continue;

            for (const [_, player] of this.players) {
                if (player.isCatcher) {
                    const distance = Math.sqrt(
                        (player.x - trap.x) ** 2 + (player.y - trap.y) ** 2,
                    );
                    if (distance <= trap.radius + PLAYER_RADIUS) {
                        player.stunned = true;
                        player.stunnedUntil = now + TRAP_STUN_DURATION;
                        trap.active = false;
                        this.traps.delete(trapId);
                    }
                }
            }
        }

        // Check catching
        this.checkCatching(now);

        // Broadcast game state
        this.broadcastState();
    }

    private checkWallCollision(x: number, y: number, radius: number): boolean {
        for (const wall of this.map.walls) {
            // Check if circle collides with rectangle
            const closestX = Math.max(wall.x, Math.min(x, wall.x + wall.width));
            const closestY = Math.max(
                wall.y,
                Math.min(y, wall.y + wall.height),
            );

            const distanceX = x - closestX;
            const distanceY = y - closestY;
            const distanceSquared =
                distanceX * distanceX + distanceY * distanceY;

            if (distanceSquared < radius * radius) {
                return true;
            }
        }
        return false;
    }

    private getDistance(
        a: { x: number; y: number },
        b: { x: number; y: number },
    ): number {
        return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
    }

    private checkCatching(now: number): void {
        let catcher: Player | null = null;

        for (const [_, player] of this.players) {
            if (player.isCatcher) {
                catcher = player;
                break;
            }
        }

        if (!catcher || catcher.stunned) return;

        for (const [playerId, player] of this.players) {
            if (player.isCatcher) continue;

            // Check immunity
            const immuneUntil = this.catchImmunity.get(playerId);
            if (immuneUntil && now < immuneUntil) continue;

            const distance = this.getDistance(catcher, player);
            if (distance <= CATCH_DISTANCE) {
                // Caught!
                this.swapCatcher(catcher, player, now);

                this.io.to(this.roomCode).emit("player_caught", {
                    catcherId: catcher.id,
                    caughtId: player.id,
                });

                break;
            }
        }
    }

    private swapCatcher(
        oldCatcher: Player,
        newCatcher: Player,
        now: number,
    ): void {
        oldCatcher.isCatcher = false;
        newCatcher.isCatcher = true;

        // Give old catcher immunity
        this.catchImmunity.set(oldCatcher.id, now + CATCH_IMMUNITY_DURATION);

        // Reset new catcher's cooldowns (they can't use abilities anymore)
        newCatcher.cooldowns = { dash: 0, stun: 0, trap: 0 };
    }

    private broadcastState(): void {
        const gameState: GameState = {
            players: Array.from(this.players.values()),
            traps: Array.from(this.traps.values()),
            timeRemaining: Math.max(0, this.timeRemaining),
            roundNumber: this.roundNumber,
            status: "playing",
        };

        this.io.to(this.roomCode).emit("game_state", gameState);
    }

    private endGame(): void {
        this.stop();

        const scores: PlayerScore[] = Array.from(this.players.values())
            .map((p) => ({
                id: p.id,
                name: p.name,
                score: Math.floor(p.score),
            }))
            .sort((a, b) => b.score - a.score);

        const winner = scores[0];

        this.io.to(this.roomCode).emit("game_end", { winner, scores });
    }
}
