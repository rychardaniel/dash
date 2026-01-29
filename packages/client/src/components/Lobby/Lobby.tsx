import { useGame } from '../../contexts/GameContext';

export function Lobby() {
    const { roomState, playerId, startGame, leaveRoom, countdown } = useGame();

    if (!roomState) return null;

    const isHost = roomState.hostId === playerId;
    const canStart = roomState.players.length >= 2;

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="glass rounded-2xl p-8 w-full max-w-md glow-primary">
                {/* Header */}
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-white mb-1">
                        Sala: {roomState.code}
                    </h2>
                    <p className="text-gray-400 text-sm">
                        Aguardando jogadores...
                    </p>
                </div>

                {/* Players List */}
                <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-300 mb-3">
                        Jogadores ({roomState.players.length})
                    </h3>
                    <div className="space-y-2">
                        {roomState.players.map((player) => (
                            <div
                                key={player.id}
                                className={`flex items-center justify-between p-3 rounded-xl ${player.id === playerId
                                        ? 'bg-game-primary/20 border border-game-primary/30'
                                        : 'bg-white/5 border border-white/10'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${player.id === playerId ? 'bg-game-primary' : 'bg-game-secondary'
                                        }`} />
                                    <span className="text-white font-medium">
                                        {player.name}
                                        {player.id === playerId && ' (você)'}
                                    </span>
                                </div>
                                {player.isHost && (
                                    <span className="text-xs px-2 py-1 bg-game-warning/20 text-game-warning rounded-full">
                                        Host
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Countdown */}
                {countdown !== null && (
                    <div className="mb-6 text-center">
                        <div className="text-6xl font-bold text-game-secondary animate-pulse">
                            {countdown}
                        </div>
                        <p className="text-gray-400 mt-2">Iniciando...</p>
                    </div>
                )}

                {/* Actions */}
                {countdown === null && (
                    <div className="space-y-3">
                        {isHost ? (
                            <button
                                onClick={startGame}
                                disabled={!canStart}
                                className="w-full py-4 bg-gradient-to-r from-game-success to-game-secondary text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                            >
                                {canStart ? '🎮 Iniciar Jogo' : `Aguardando jogadores (${roomState.players.length}/2)`}
                            </button>
                        ) : (
                            <div className="text-center py-4 text-gray-400">
                                Aguardando o host iniciar o jogo...
                            </div>
                        )}

                        <button
                            onClick={leaveRoom}
                            className="w-full py-3 bg-white/5 border border-white/10 text-gray-400 font-medium rounded-xl hover:bg-game-accent/20 hover:border-game-accent/30 hover:text-game-accent transition-all"
                        >
                            Sair da Sala
                        </button>
                    </div>
                )}

                {/* Controls Info */}
                <div className="mt-6 p-4 bg-white/5 rounded-xl">
                    <h3 className="text-sm font-medium text-gray-300 mb-2">
                        Controles:
                    </h3>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                        <div>• WASD ou Setas: Mover</div>
                        <div>• 1 ou Q: Dash</div>
                        <div>• 2 ou E: Stun</div>
                        <div>• 3 ou R: Armadilha</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
