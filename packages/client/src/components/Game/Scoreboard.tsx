import type { GameState } from '@dash/shared';

interface ScoreboardProps {
    gameState: GameState;
    playerId: string;
}

export function Scoreboard({ gameState, playerId }: ScoreboardProps) {
    const sortedPlayers = [...gameState.players].sort((a, b) => b.score - a.score);
    const minutes = Math.floor(gameState.timeRemaining / 60);
    const seconds = Math.floor(gameState.timeRemaining % 60);

    return (
        <div className="glass rounded-xl p-4">
            {/* Timer */}
            <div className="text-center mb-4">
                <div className={`text-3xl font-bold ${gameState.timeRemaining <= 30 ? 'text-game-accent animate-pulse' : 'text-white'
                    }`}>
                    {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                    Tempo restante
                </div>
            </div>

            {/* Divider */}
            <div className="border-t border-white/10 my-3" />

            {/* Players */}
            <div className="space-y-2">
                {sortedPlayers.map((player, index) => (
                    <div
                        key={player.id}
                        className={`flex items-center justify-between p-2 rounded-lg ${player.id === playerId
                            ? 'bg-game-primary/20 border border-game-primary/30'
                            : 'bg-white/5'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            {/* Rank */}
                            <span className={`w-5 text-center font-bold ${index === 0 ? 'text-yellow-400' :
                                index === 1 ? 'text-gray-300' :
                                    index === 2 ? 'text-amber-600' :
                                        'text-gray-500'
                                }`}>
                                {index + 1}
                            </span>

                            {/* Role indicator */}
                            <span className="text-sm">
                                {player.isCatcher ? '👹' : '🏃'}
                            </span>

                            {/* Name */}
                            <span className={`text-sm font-medium ${player.id === playerId ? 'text-white' : 'text-gray-300'
                                }`}>
                                {player.name}
                            </span>
                        </div>

                        {/* Score */}
                        <span className={`font-bold ${player.isCatcher ? 'text-game-accent' : 'text-game-success'
                            }`}>
                            {Math.floor(player.score)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
