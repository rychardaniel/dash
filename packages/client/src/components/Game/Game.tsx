import { useGame } from '../../contexts/GameContext';
import { useInput } from '../../hooks/useInput';
import { GameCanvas } from './GameCanvas';
import { AbilityBar } from './AbilityBar';
import { Scoreboard } from './Scoreboard';

export function Game() {
    const { socket, gameState, mapData, playerId } = useGame();

    const { useAbility } = useInput({
        socket,
        enabled: gameState !== null && playerId !== null,
    });

    if (!gameState || !mapData || !playerId) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-white">Carregando jogo...</div>
            </div>
        );
    }

    const currentPlayer = gameState.players.find(p => p.id === playerId);
    if (!currentPlayer) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-white">Reconectando...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 gap-4">
            {/* Header */}
            <div className="flex items-center gap-4 w-full max-w-4xl">
                <div className="flex-1">
                    <Scoreboard gameState={gameState} playerId={playerId} />
                </div>
            </div>

            {/* Game Canvas */}
            <div className="relative">
                <GameCanvas
                    gameState={gameState}
                    mapData={mapData}
                    playerId={playerId}
                />

                {/* Catcher indicator overlay */}
                {currentPlayer.isCatcher && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-game-accent/80 rounded-full text-white font-bold animate-pulse">
                        👹 VOCÊ É O PEGADOR!
                    </div>
                )}
            </div>

            {/* Ability Bar */}
            <AbilityBar
                cooldowns={currentPlayer.cooldowns}
                isCatcher={currentPlayer.isCatcher}
                onUseAbility={useAbility}
            />

            {/* Controls hint */}
            <div className="text-center text-gray-500 text-xs">
                Use WASD ou setas para mover • 1/Q: Dash • 2/E: Stun • 3/R: Armadilha
            </div>
        </div>
    );
}
