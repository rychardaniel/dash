// ==========================================
// Tipos Compartilhados - dash Game
// ==========================================

// ===== Player Types =====
export interface Player {
    id: string;
    name: string;
    x: number;
    y: number;
    velocityX: number;
    velocityY: number;
    isCatcher: boolean;
    score: number;
    cooldowns: Cooldowns;
    stunned: boolean;
    stunnedUntil: number;
    dashing: boolean;
    dashEndTime: number;
}

export interface Cooldowns {
    dash: number;
    stun: number;
    trap: number;
}

export type AbilityType = "dash" | "stun" | "trap";

// ===== Map Types =====
export interface Wall {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface SpawnPoint {
    x: number;
    y: number;
}

export interface MapData {
    width: number;
    height: number;
    walls: Wall[];
    spawnPoints: SpawnPoint[];
    seed: number;
}

// ===== Trap Types =====
export interface Trap {
    id: string;
    x: number;
    y: number;
    placedBy: string;
    active: boolean;
    radius: number;
}

// ===== Game State Types =====
export interface GameState {
    players: Player[];
    traps: Trap[];
    timeRemaining: number;
    roundNumber: number;
    status: "waiting" | "countdown" | "playing" | "roundEnd" | "gameEnd";
}

export interface RoomPlayer {
    id: string;
    name: string;
    isHost: boolean;
}

export interface RoomState {
    code: string;
    players: RoomPlayer[];
    status: "waiting" | "playing" | "ended";
    hostId: string;
}

export interface PlayerScore {
    id: string;
    name: string;
    score: number;
}

// ===== Input Types =====
export interface PlayerInput {
    direction: {
        x: number; // -1 to 1
        y: number; // -1 to 1
    };
}

// ===== Socket Events: Client → Server =====
export interface ClientToServerEvents {
    join_room: (data: { playerName: string; roomCode: string }) => void;
    leave_room: () => void;
    start_game: () => void;
    player_input: (data: PlayerInput) => void;
    use_ability: (data: { ability: AbilityType }) => void;
}

// ===== Socket Events: Server → Client =====
export interface ServerToClientEvents {
    room_state: (data: RoomState) => void;
    room_error: (data: { message: string }) => void;
    game_started: (data: { map: MapData }) => void;
    game_state: (data: GameState) => void;
    player_caught: (data: { catcherId: string; caughtId: string }) => void;
    round_end: (data: { scores: PlayerScore[]; newCatcherId: string }) => void;
    game_end: (data: { winner: PlayerScore; scores: PlayerScore[] }) => void;
    countdown: (data: { seconds: number }) => void;
}

// ===== Game Constants =====
export const GAME_CONSTANTS = {
    // Timing
    TICK_RATE: 60,
    ROUND_DURATION: 120, // 2 minutes in seconds
    COUNTDOWN_SECONDS: 3,

    // Map
    MAP_WIDTH: 800,
    MAP_HEIGHT: 600,

    // Player
    PLAYER_RADIUS: 15,
    PLAYER_SPEED: 200, // pixels per second

    // Vision
    VISION_RADIUS: 150,

    // Abilities
    DASH_SPEED_MULTIPLIER: 3,
    DASH_DURATION: 200, // ms
    DASH_COOLDOWN: 5000, // ms

    STUN_DURATION: 1000, // ms
    STUN_RADIUS: 60,
    STUN_COOLDOWN: 10000, // ms

    TRAP_STUN_DURATION: 1500, // ms
    TRAP_RADIUS: 25,
    TRAP_COOLDOWN: 15000, // ms

    // Catching
    CATCH_DISTANCE: 30,
    CATCH_IMMUNITY_DURATION: 2000, // ms after being caught
} as const;
