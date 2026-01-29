import { createContext, useContext, ReactNode } from 'react';
import { useSocket } from '../hooks/useSocket';
import type { Socket } from 'socket.io-client';
import type {
    ClientToServerEvents,
    ServerToClientEvents,
    RoomState,
    GameState,
    MapData,
    PlayerScore
} from '@dash/shared';

type GameSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

interface GameContextType {
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
    playerId: string | null;
}

const GameContext = createContext<GameContextType | null>(null);

interface GameProviderProps {
    children: ReactNode;
}

export function GameProvider({ children }: GameProviderProps) {
    const socketData = useSocket();

    const playerId = socketData.socket?.id || null;

    const value: GameContextType = {
        ...socketData,
        playerId,
    };

    return (
        <GameContext.Provider value={value}>
            {children}
        </GameContext.Provider>
    );
}

export function useGame(): GameContextType {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error('useGame must be used within a GameProvider');
    }
    return context;
}
