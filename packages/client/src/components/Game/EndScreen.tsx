import type { PlayerScore } from '@dash/shared';

interface EndScreenProps {
    winner: PlayerScore;
    scores: PlayerScore[];
    playerId: string;
    onPlayAgain: () => void;
    onLeave: () => void;
}

export function EndScreen({ winner, scores, playerId, onPlayAgain, onLeave }: EndScreenProps) {
    const isWinner = winner.id === playerId;

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="glass rounded-2xl p-8 w-full max-w-md text-center glow-primary">
                {/* Trophy */}
                <div className="text-6xl mb-4">
                    {isWinner ? '🏆' : '🎮'}
                </div>

                {/* Title */}
                <h2 className={`text-3xl font-bold mb-2 ${isWinner ? 'text-yellow-400' : 'text-white'
                    }`}>
                    {isWinner ? 'Você Venceu!' : 'Fim de Jogo!'}
                </h2>

                {/* Winner */}
                <p className="text-gray-400 mb-6">
                    {isWinner ? (
                        'Parabéns! Você escapou mais tempo que todos!'
                    ) : (
                        <>Vencedor: <span className="text-game-secondary font-bold">{winner.name}</span></>
                    )}
                </p>

                {/* Leaderboard */}
                <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-400 mb-3">
                        Placar Final
                    </h3>
                    <div className="space-y-2">
                        {scores.map((player, index) => (
                            <div
                                key={player.id}
                                className={`flex items-center justify-between p-3 rounded-xl ${player.id === playerId
                                    ? 'bg-game-primary/20 border border-game-primary/30'
                                    : 'bg-white/5'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    {/* Medal */}
                                    <span className="text-xl">
                                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}°`}
                                    </span>

                                    {/* Name */}
                                    <span className={`font-medium ${player.id === playerId ? 'text-white' : 'text-gray-300'
                                        }`}>
                                        {player.name}
                                        {player.id === playerId && ' (você)'}
                                    </span>
                                </div>

                                {/* Score */}
                                <span className="text-game-success font-bold">
                                    {player.score} pts
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                    <button
                        onClick={onPlayAgain}
                        className="w-full py-4 bg-gradient-to-r from-game-primary to-game-secondary text-white font-bold rounded-xl hover:opacity-90 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                        🔄 Jogar Novamente
                    </button>

                    <button
                        onClick={onLeave}
                        className="w-full py-3 bg-white/5 border border-white/10 text-gray-400 font-medium rounded-xl hover:bg-game-accent/20 hover:border-game-accent/30 hover:text-game-accent transition-all"
                    >
                        Sair
                    </button>
                </div>
            </div>
        </div>
    );
}
