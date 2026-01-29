import { useRef, useEffect } from 'react';
import type { GameState, MapData, Player } from '@dash/shared';

interface GameCanvasProps {
    gameState: GameState;
    mapData: MapData;
    playerId: string;
}

const PLAYER_RADIUS = 15;
const VISION_RADIUS = 150;

export function GameCanvas({ gameState, mapData, playerId }: GameCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Get current player
        const currentPlayer = gameState.players.find(p => p.id === playerId);
        if (!currentPlayer) return;

        // Clear canvas
        ctx.fillStyle = '#0f0f23';
        ctx.fillRect(0, 0, mapData.width, mapData.height);

        // Save context for fog of war clipping
        ctx.save();

        // Create fog of war (circular vision)
        ctx.beginPath();
        ctx.arc(currentPlayer.x, currentPlayer.y, VISION_RADIUS, 0, Math.PI * 2);
        ctx.clip();

        // Draw visible area background
        ctx.fillStyle = '#1a1a3e';
        ctx.fillRect(0, 0, mapData.width, mapData.height);

        // Draw grid pattern
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.1)';
        ctx.lineWidth = 1;
        const gridSize = 50;
        for (let x = 0; x < mapData.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, mapData.height);
            ctx.stroke();
        }
        for (let y = 0; y < mapData.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(mapData.width, y);
            ctx.stroke();
        }

        // Draw walls
        ctx.fillStyle = '#374151';
        ctx.strokeStyle = '#4b5563';
        ctx.lineWidth = 2;
        for (const wall of mapData.walls) {
            ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
            ctx.strokeRect(wall.x, wall.y, wall.width, wall.height);
        }

        // Draw traps (only visible to the player who placed them or if triggered)
        for (const trap of gameState.traps) {
            if (trap.placedBy === playerId || !trap.active) {
                ctx.beginPath();
                ctx.arc(trap.x, trap.y, trap.radius, 0, Math.PI * 2);
                ctx.fillStyle = trap.active ? 'rgba(244, 63, 94, 0.3)' : 'rgba(244, 63, 94, 0.1)';
                ctx.fill();
                ctx.strokeStyle = trap.active ? '#f43f5e' : '#991b1b';
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        }

        // Draw other players
        for (const player of gameState.players) {
            if (player.id === playerId) continue;

            const distance = Math.sqrt(
                (player.x - currentPlayer.x) ** 2 + (player.y - currentPlayer.y) ** 2
            );

            // Only draw if within vision
            if (distance <= VISION_RADIUS + PLAYER_RADIUS) {
                drawPlayer(ctx, player, false, currentPlayer.isCatcher);
            }
        }

        // Restore context (remove clipping)
        ctx.restore();

        // Draw fog of war overlay
        ctx.fillStyle = 'rgba(15, 15, 35, 0.85)';
        ctx.beginPath();
        ctx.rect(0, 0, mapData.width, mapData.height);
        ctx.arc(currentPlayer.x, currentPlayer.y, VISION_RADIUS, 0, Math.PI * 2, true);
        ctx.fill();

        // Draw vision edge glow
        const gradient = ctx.createRadialGradient(
            currentPlayer.x, currentPlayer.y, VISION_RADIUS - 20,
            currentPlayer.x, currentPlayer.y, VISION_RADIUS
        );
        gradient.addColorStop(0, 'transparent');
        gradient.addColorStop(1, 'rgba(99, 102, 241, 0.3)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(currentPlayer.x, currentPlayer.y, VISION_RADIUS, 0, Math.PI * 2);
        ctx.fill();

        // Draw current player (always visible)
        drawPlayer(ctx, currentPlayer, true, currentPlayer.isCatcher);

        // Draw stun indicator if current player is stunned
        if (currentPlayer.stunned) {
            ctx.fillStyle = 'rgba(245, 158, 11, 0.3)';
            ctx.beginPath();
            ctx.arc(currentPlayer.x, currentPlayer.y, PLAYER_RADIUS + 10, 0, Math.PI * 2);
            ctx.fill();

            // Draw stun stars
            ctx.fillStyle = '#f59e0b';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('⭐', currentPlayer.x - 15, currentPlayer.y - 25);
            ctx.fillText('⭐', currentPlayer.x + 15, currentPlayer.y - 25);
        }

    }, [gameState, mapData, playerId]);

    return (
        <canvas
            ref={canvasRef}
            width={mapData.width}
            height={mapData.height}
            className="rounded-xl border-2 border-white/10"
            style={{ maxWidth: '100%', height: 'auto' }}
        />
    );
}

function drawPlayer(
    ctx: CanvasRenderingContext2D,
    player: Player,
    isCurrentPlayer: boolean,
    isCatcher: boolean
) {
    const { x, y, dashing, stunned, name } = player;

    // Glow effect
    if (isCurrentPlayer || isCatcher) {
        const glowColor = isCatcher ? 'rgba(244, 63, 94, 0.5)' : 'rgba(34, 211, 238, 0.5)';
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 20;
    }

    // Main circle
    ctx.beginPath();
    ctx.arc(x, y, PLAYER_RADIUS, 0, Math.PI * 2);

    if (isCatcher) {
        // Catcher is red
        ctx.fillStyle = dashing ? '#ff6b6b' : '#f43f5e';
    } else if (isCurrentPlayer) {
        // Current player is cyan
        ctx.fillStyle = dashing ? '#67e8f9' : '#22d3ee';
    } else {
        // Other players
        ctx.fillStyle = '#6366f1';
    }

    ctx.fill();

    // Reset shadow
    ctx.shadowBlur = 0;

    // Border
    ctx.strokeStyle = stunned ? '#f59e0b' : 'white';
    ctx.lineWidth = stunned ? 3 : 2;
    ctx.stroke();

    // Dash effect
    if (dashing) {
        ctx.beginPath();
        ctx.arc(x, y, PLAYER_RADIUS + 5, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    // Name label
    ctx.fillStyle = 'white';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(name, x, y - PLAYER_RADIUS - 5);

    // Role indicator
    if (isCatcher) {
        ctx.fillStyle = '#f43f5e';
        ctx.font = '14px Arial';
        ctx.fillText('👹', x, y + 5);
    }
}
