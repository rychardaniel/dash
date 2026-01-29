import type { Cooldowns } from '@dash/shared';

interface AbilityBarProps {
    cooldowns: Cooldowns;
    isCatcher: boolean;
    onUseAbility: (ability: 'dash' | 'stun' | 'trap') => void;
}

const COOLDOWNS = {
    dash: 5000,
    stun: 10000,
    trap: 15000,
};

export function AbilityBar({ cooldowns, isCatcher, onUseAbility }: AbilityBarProps) {
    if (isCatcher) {
        return (
            <div className="flex items-center justify-center gap-4 p-4 glass rounded-xl">
                <div className="text-game-accent font-bold">
                    👹 Você é o PEGADOR!
                </div>
                <div className="text-gray-400 text-sm">
                    Pegue os outros jogadores!
                </div>
            </div>
        );
    }

    const now = Date.now();

    const abilities = [
        {
            key: 'dash' as const,
            name: 'Dash',
            icon: '💨',
            shortcut: '1/Q',
            color: 'from-blue-500 to-cyan-500',
            cooldown: COOLDOWNS.dash,
        },
        {
            key: 'stun' as const,
            name: 'Stun',
            icon: '⚡',
            shortcut: '2/E',
            color: 'from-yellow-500 to-orange-500',
            cooldown: COOLDOWNS.stun,
        },
        {
            key: 'trap' as const,
            name: 'Armadilha',
            icon: '🕳️',
            shortcut: '3/R',
            color: 'from-red-500 to-pink-500',
            cooldown: COOLDOWNS.trap,
        },
    ];

    return (
        <div className="flex items-center justify-center gap-4 p-4 glass rounded-xl">
            {abilities.map((ability) => {
                const cooldownEnd = cooldowns[ability.key];
                const remaining = Math.max(0, cooldownEnd - now);
                const isReady = remaining === 0;
                const progress = 1 - remaining / ability.cooldown;

                return (
                    <button
                        key={ability.key}
                        onClick={() => isReady && onUseAbility(ability.key)}
                        disabled={!isReady}
                        className={`relative w-20 h-20 rounded-xl transition-all ${isReady
                            ? 'hover:scale-110 cursor-pointer'
                            : 'opacity-50 cursor-not-allowed'
                            }`}
                    >
                        {/* Background */}
                        <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${ability.color} opacity-20`} />

                        {/* Progress overlay */}
                        {!isReady && (
                            <div
                                className="absolute inset-0 rounded-xl bg-black/60"
                                style={{
                                    clipPath: `polygon(0 ${(1 - progress) * 100}%, 100% ${(1 - progress) * 100}%, 100% 100%, 0 100%)`,
                                }}
                            />
                        )}

                        {/* Border */}
                        <div className={`absolute inset-0 rounded-xl border-2 ${isReady ? 'border-white/30' : 'border-white/10'
                            }`} />

                        {/* Content */}
                        <div className="relative z-10 flex flex-col items-center justify-center h-full">
                            <span className="text-2xl">{ability.icon}</span>
                            <span className="text-xs text-gray-300 mt-1">{ability.name}</span>
                            <span className="text-[10px] text-gray-500">{ability.shortcut}</span>
                        </div>

                        {/* Cooldown text */}
                        {!isReady && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-white font-bold text-lg">
                                    {Math.ceil(remaining / 1000)}s
                                </span>
                            </div>
                        )}

                        {/* Ready glow */}
                        {isReady && (
                            <div className={`absolute inset-0 rounded-xl animate-pulse bg-gradient-to-br ${ability.color} opacity-30`} />
                        )}
                    </button>
                );
            })}
        </div>
    );
}
