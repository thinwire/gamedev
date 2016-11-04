//
// The actual game
//

/// <reference path="engine.ts" />
/// <reference path="math.ts" />

class Ringbuffer<T> {
    private data: T[];
    private size: number;
    private pos: number;

    constructor(size: number, fn: () => T) {
        this.size = size;
        this.data = [];
        for(var i = 0; i < size; ++i) {
            this.data[i] = fn();
        }
        this.pos = 0;
    }

    public getNext(): T {
        var obj = this.data[this.pos];
        this.pos = (this.pos + 1) % this.size;
        return obj;
    }

    public update(fn: (obj: T) => void) {
        for(var i: number = 0; i < this.size; ++i) {
            fn( this.data[i] );
        }
    }
}

class Game {

    // Scene and main timing
    private scene: Scene;    // Scene handles drawing sprites onto the canvas
    private timer: Timer;    // No longer a raw timing value; Timer can be found in engine.ts

    // "Dude", our hero character
    private dude: Sprite;
    private ddx: number = 0;
    private ddy: number = 0;

    // Laser control objects
    private laserBuffer: Ringbuffer<Sprite>;
    private laserTimer: number; // Counts the amount of time between shots

    constructor() {
        this.scene = new Scene(window.document.body);
        this.timer = new Timer();

        // Create lasers in a buffer
        this.laserTimer = 0;
        this.laserBuffer = new Ringbuffer(16, () => {
            var laser = new Sprite("laser");
            laser.setPosition(9000,9000);
            this.scene.addSprite(laser);
            return laser;
        });
        
        // Create player sprite
        this.dude = new Sprite("dude");
        this.dude.setPosition(15, (this.scene.getHeight() - this.dude.getHeight()) * 0.5);
        this.scene.addSprite(this.dude);
    }

    public update(tm: number): void {

        // Update timing
        this.timer.update(tm);
        var delta = this.timer.getDelta();

        //
        // Laser Logic
        //

        this.laserBuffer.update((laser: Sprite) => {
            laser.move(700 * delta, 0);
        });

        //
        // Dude logic
        //

        // Check input
        var dx: number = 0;
        var dy: number = 0;

        if(this.scene.isKeyDown(Keys.LEFT)) dx -= 100;
        if(this.scene.isKeyDown(Keys.RIGHT)) dx += 100;
        if(this.scene.isKeyDown(Keys.UP)) dy -= 100;
        if(this.scene.isKeyDown(Keys.DOWN)) dy += 100;

        // Update dude's speed delta components
        this.ddx += dx * delta;
        this.ddy += dy * delta;

        if(dx == 0) this.ddx *= 0.70;       // TODO: use better linear reduction algorithm
        if(dy == 0) this.ddy *= 0.70;       // TODO: ditto

        this.dude.move(this.ddx,this.ddy);

        // Limit dude to scene.
        var minX = 0;
        var minY = 0;
        var maxX = this.scene.getWidth() - this.dude.getWidth();
        var maxY = this.scene.getHeight() - this.dude.getHeight();

        if(this.dude.getX() < minX) { this.dude.getPosition().x = minX; this.ddx = 0; }
        if(this.dude.getY() < minY) { this.dude.getPosition().y = minY; this.ddy = 0; }
        if(this.dude.getX() > maxX) { this.dude.getPosition().x = maxX; this.ddx = 0; }
        if(this.dude.getY() > maxY) { this.dude.getPosition().y = maxY; this.ddy = 0; }

        // Make dude shoot laser when space is pressed
        if(this.scene.isKeyDown(Keys.SPACE)) {
            if(this.laserTimer < 0) {
                var laser = this.laserBuffer.getNext();
                laser.placeAt(this.dude);
                this.laserTimer = 0.5;
            }
        }
        this.laserTimer -= delta;

        // Draw our scene
        this.scene.update();
    }
}

//
// Bootstrap - this starts up and keeps the game running
//

var g = new Game();
var loop = (tm) => {
    g.update(tm);
    requestAnimationFrame(loop);
};
loop(0);
