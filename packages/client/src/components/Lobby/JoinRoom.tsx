import { useState } from 'react';
import { useGame } from '../../contexts/GameContext';

export function JoinRoom() {
    const { isConnected, joinRoom, error } = useGame();
    const [playerName, setPlayerName] = useState('');
    const [roomCode, setRoomCode] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (playerName.trim() && roomCode.trim()) {
            joinRoom(playerName.trim(), roomCode.trim().toUpperCase());
        }
    };

    const generateRoomCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setRoomCode(code);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="glass rounded-2xl p-8 w-full max-w-md glow-primary">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold text-white mb-2">
                        🏃 dash
                    </h1>
                    <p className="text-gray-400">
                        Jogo multiplayer de perseguição
                    </p>
                </div>

                {/* Connection Status */}
                <div className="flex items-center justify-center gap-2 mb-6">
                    <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-game-success' : 'bg-game-accent'} animate-pulse`} />
                    <span className="text-sm text-gray-400">
                        {isConnected ? 'Conectado ao servidor' : 'Conectando...'}
                    </span>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Player Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Seu Nome
                        </label>
                        <input
                            type="text"
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                            placeholder="Digite seu nome..."
                            maxLength={20}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-game-primary focus:ring-2 focus:ring-game-primary/30 transition-all"
                            disabled={!isConnected}
                        />
                    </div>

                    {/* Room Code */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Código da Sala
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={roomCode}
                                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                                placeholder="ABC123"
                                maxLength={6}
                                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-game-primary focus:ring-2 focus:ring-game-primary/30 transition-all uppercase tracking-widest text-center font-mono"
                                disabled={!isConnected}
                            />
                            <button
                                type="button"
                                onClick={generateRoomCode}
                                className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                                disabled={!isConnected}
                                title="Gerar código aleatório"
                            >
                                🎲
                            </button>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="p-3 bg-game-accent/20 border border-game-accent/30 rounded-xl text-game-accent text-sm">
                            {error}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={!isConnected || !playerName.trim() || !roomCode.trim()}
                        className="w-full py-4 bg-gradient-to-r from-game-primary to-game-secondary text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                        Entrar na Sala
                    </button>
                </form>

                {/* Instructions */}
                <div className="mt-8 p-4 bg-white/5 rounded-xl">
                    <h3 className="text-sm font-medium text-gray-300 mb-2">
                        Como jogar:
                    </h3>
                    <ul className="text-xs text-gray-400 space-y-1">
                        <li>• Digite um código para criar ou entrar em uma sala</li>
                        <li>• O primeiro jogador é o host e pode iniciar o jogo</li>
                        <li>• Mínimo 2 jogadores para começar</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
