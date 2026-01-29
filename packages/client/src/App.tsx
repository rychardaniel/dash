import { GameProvider, useGame } from './contexts/GameContext';
import { JoinRoom } from './components/Lobby/JoinRoom';
import { Lobby } from './components/Lobby/Lobby';
import { Game } from './components/Game/Game';
import { EndScreen } from './components/Game/EndScreen';

function GameContent() {
    const { roomState, gameState, gameResult, playerId, leaveRoom, startGame } = useGame();

    // Show end screen
    if (gameResult && playerId) {
        return (
            <EndScreen
                winner={gameResult.winner}
                scores={gameResult.scores}
                playerId={playerId}
                onPlayAgain={startGame}
                onLeave={leaveRoom}
            />
        );
    }

    // Show game
    if (gameState) {
        return <Game />;
    }

    // Show lobby
    if (roomState) {
        return <Lobby />;
    }

    // Show join room
    return <JoinRoom />;
}

function App() {
    return (
        <GameProvider>
            <GameContent />
        </GameProvider>
    );
}

export default App;
