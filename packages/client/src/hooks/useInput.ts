import { useEffect, useRef, useCallback } from "react";
import type { Socket } from "socket.io-client";
import type {
    ClientToServerEvents,
    ServerToClientEvents,
    AbilityType,
} from "@dash/shared";

type GameSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

interface UseInputOptions {
    socket: GameSocket | null;
    enabled: boolean;
}

export function useInput({ socket, enabled }: UseInputOptions) {
    const keysPressed = useRef<Set<string>>(new Set());
    const inputInterval = useRef<ReturnType<typeof setInterval> | null>(null);

    const getDirection = useCallback(() => {
        const keys = keysPressed.current;
        let x = 0;
        let y = 0;

        if (keys.has("w") || keys.has("arrowup")) y -= 1;
        if (keys.has("s") || keys.has("arrowdown")) y += 1;
        if (keys.has("a") || keys.has("arrowleft")) x -= 1;
        if (keys.has("d") || keys.has("arrowright")) x += 1;

        return { x, y };
    }, []);

    const useAbility = useCallback(
        (ability: AbilityType) => {
            if (socket && enabled) {
                socket.emit("use_ability", { ability });
            }
        },
        [socket, enabled],
    );

    useEffect(() => {
        if (!enabled) {
            keysPressed.current.clear();
            if (inputInterval.current) {
                clearInterval(inputInterval.current);
                inputInterval.current = null;
            }
            return;
        }

        const handleKeyDown = (e: KeyboardEvent) => {
            const key = e.key.toLowerCase();

            // Movement keys
            if (
                [
                    "w",
                    "a",
                    "s",
                    "d",
                    "arrowup",
                    "arrowdown",
                    "arrowleft",
                    "arrowright",
                ].includes(key)
            ) {
                keysPressed.current.add(key);
            }

            // Ability keys
            if (key === "1" || key === "q") {
                useAbility("dash");
            } else if (key === "2" || key === "e") {
                useAbility("stun");
            } else if (key === "3" || key === "r") {
                useAbility("trap");
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            const key = e.key.toLowerCase();
            keysPressed.current.delete(key);
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        // Send input at regular intervals
        inputInterval.current = setInterval(() => {
            if (socket) {
                const direction = getDirection();
                socket.emit("player_input", { direction });
            }
        }, 1000 / 60); // 60 times per second

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
            if (inputInterval.current) {
                clearInterval(inputInterval.current);
            }
        };
    }, [socket, enabled, getDirection, useAbility]);

    return { useAbility };
}
