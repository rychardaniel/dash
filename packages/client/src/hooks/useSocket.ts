import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import type {
    ClientToServerEvents,
    ServerToClientEvents,
    RoomState,
    GameState,
    MapData,
    PlayerScore,
} from "@dash/shared";

const SOCKET_URL = "http://192.168.1.14:5000";

type GameSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

interface UseSocketReturn {
    socket: GameSocket | null;
    isConnected: boolean;
    roomState: RoomState | null;
    gameState: GameState | null;
    mapData: MapData | null;
    countdown: number | null;
    error: string | null;
    gameResult: { winner: PlayerScore; scores: PlayerScore[] } | null;
    joinRoom: (playerName: string, roomCode: string) => void;
    leaveRoom: () => void;
    startGame: () => void;
}

export function useSocket(): UseSocketReturn {
    const socketRef = useRef<GameSocket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [roomState, setRoomState] = useState<RoomState | null>(null);
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [mapData, setMapData] = useState<MapData | null>(null);
    const [countdown, setCountdown] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [gameResult, setGameResult] = useState<{
        winner: PlayerScore;
        scores: PlayerScore[];
    } | null>(null);

    useEffect(() => {
        const socket: GameSocket = io(SOCKET_URL, {
            transports: ["websocket"],
            autoConnect: true,
        });

        socketRef.current = socket;

        socket.on("connect", () => {
            console.log("Connected to server");
            setIsConnected(true);
            setError(null);
        });

        socket.on("disconnect", () => {
            console.log("Disconnected from server");
            setIsConnected(false);
        });

        socket.on("room_state", (data) => {
            setRoomState(data);
            setError(null);
        });

        socket.on("room_error", (data) => {
            setError(data.message);
        });

        socket.on("countdown", (data) => {
            setCountdown(data.seconds);
        });

        socket.on("game_started", (data) => {
            setMapData(data.map);
            setCountdown(null);
            setGameResult(null);
        });

        socket.on("game_state", (data) => {
            setGameState(data);
        });

        socket.on("game_end", (data) => {
            setGameResult(data);
            setGameState(null);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const joinRoom = useCallback((playerName: string, roomCode: string) => {
        if (socketRef.current) {
            socketRef.current.emit("join_room", { playerName, roomCode });
        }
    }, []);

    const leaveRoom = useCallback(() => {
        if (socketRef.current) {
            socketRef.current.emit("leave_room");
            setRoomState(null);
            setGameState(null);
            setMapData(null);
            setCountdown(null);
            setGameResult(null);
        }
    }, []);

    const startGame = useCallback(() => {
        if (socketRef.current) {
            socketRef.current.emit("start_game");
        }
    }, []);

    return {
        socket: socketRef.current,
        isConnected,
        roomState,
        gameState,
        mapData,
        countdown,
        error,
        gameResult,
        joinRoom,
        leaveRoom,
        startGame,
    };
}
