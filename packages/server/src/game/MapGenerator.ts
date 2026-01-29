import type { MapData, Wall, SpawnPoint, GAME_CONSTANTS } from "@dash/shared";

// Simple seeded random number generator
class SeededRandom {
    private seed: number;

    constructor(seed: number) {
        this.seed = seed;
    }

    next(): number {
        this.seed = (this.seed * 1103515245 + 12345) & 0x7fffffff;
        return this.seed / 0x7fffffff;
    }

    nextInt(min: number, max: number): number {
        return Math.floor(this.next() * (max - min + 1)) + min;
    }
}

export class MapGenerator {
    static readonly WIDTH = 800;
    static readonly HEIGHT = 600;
    static readonly WALL_COUNT = 8;
    static readonly MARGIN = 50;

    static generate(seed: number): MapData {
        const rng = new SeededRandom(seed);
        const walls: Wall[] = [];

        // Add border walls
        const borderThickness = 10;

        // Top wall
        walls.push({ x: 0, y: 0, width: this.WIDTH, height: borderThickness });
        // Bottom wall
        walls.push({
            x: 0,
            y: this.HEIGHT - borderThickness,
            width: this.WIDTH,
            height: borderThickness,
        });
        // Left wall
        walls.push({ x: 0, y: 0, width: borderThickness, height: this.HEIGHT });
        // Right wall
        walls.push({
            x: this.WIDTH - borderThickness,
            y: 0,
            width: borderThickness,
            height: this.HEIGHT,
        });

        // Generate random interior walls
        for (let i = 0; i < this.WALL_COUNT; i++) {
            const isHorizontal = rng.next() > 0.5;

            let wall: Wall;
            if (isHorizontal) {
                wall = {
                    x: rng.nextInt(this.MARGIN, this.WIDTH - 150),
                    y: rng.nextInt(this.MARGIN, this.HEIGHT - this.MARGIN),
                    width: rng.nextInt(80, 150),
                    height: rng.nextInt(15, 25),
                };
            } else {
                wall = {
                    x: rng.nextInt(this.MARGIN, this.WIDTH - this.MARGIN),
                    y: rng.nextInt(this.MARGIN, this.HEIGHT - 150),
                    width: rng.nextInt(15, 25),
                    height: rng.nextInt(80, 150),
                };
            }

            // Make sure wall doesn't overlap with center spawn area
            const centerX = this.WIDTH / 2;
            const centerY = this.HEIGHT / 2;
            const safeRadius = 100;

            if (
                wall.x + wall.width > centerX - safeRadius &&
                wall.x < centerX + safeRadius &&
                wall.y + wall.height > centerY - safeRadius &&
                wall.y < centerY + safeRadius
            ) {
                // Skip this wall, it's too close to center
                continue;
            }

            walls.push(wall);
        }

        // Generate spawn points in corners and center
        const spawnPoints: SpawnPoint[] = [
            { x: this.MARGIN + 30, y: this.MARGIN + 30 },
            { x: this.WIDTH - this.MARGIN - 30, y: this.MARGIN + 30 },
            { x: this.MARGIN + 30, y: this.HEIGHT - this.MARGIN - 30 },
            {
                x: this.WIDTH - this.MARGIN - 30,
                y: this.HEIGHT - this.MARGIN - 30,
            },
            { x: this.WIDTH / 2, y: this.HEIGHT / 2 },
        ];

        return {
            width: this.WIDTH,
            height: this.HEIGHT,
            walls,
            spawnPoints,
            seed,
        };
    }
}
