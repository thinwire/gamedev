//
// The actual game
//

/// <reference path="engine.ts" />
/// <reference path="math.ts" />
/// <reference path="ringbuffer.ts" />
/// <reference path="actor.ts" />

class Player extends Actor {

    private inertia: Vec2;

    private laserBuffer: Ringbuffer<Bullet>;
    private laserTimer: number;

    constructor() {
        super("dude");
        this.inertia = new Vec2();
        this.laserTimer = 0;
        this.laserBuffer = new Ringbuffer(16,() => {
            var laser = new Bullet();
            laser.setPosition(9000,9000);
            return laser;
        })
        this.setAlive(true);

        // XXX: get rid of hardcoded position value, calculate proper position
        // in future spawn() method
        this.setPosition(15,300 - 32);
    }

    public update(delta: number): void {

        // Define speed constants
        const maxspeed: number = 15;
        const friction: number = 70;

        // Check input
        var dx: number = 0;
        var dy: number = 0;
        var scene = this.getScene();
        if(scene.isKeyDown(Keys.LEFT)) dx -= 100;
        if(scene.isKeyDown(Keys.RIGHT)) dx += 100;
        if(scene.isKeyDown(Keys.UP)) dy -= 100;
        if(scene.isKeyDown(Keys.DOWN)) dy += 100;

        // Update dude's speed delta components
        if(dx == 0) {
            this.inertia.x = toZero(this.inertia.x, friction * delta);
        } else {
            this.inertia.x += dx * delta;
        }

        if(dy == 0) {
            this.inertia.y = toZero(this.inertia.y, friction * delta);
        } else {
            this.inertia.y += dy * delta;
        }

        // Clamp inertia to maximum speed
        if(this.inertia.length() > maxspeed) {
            this.inertia.normalize().multiplyXY(maxspeed);
        }

        // Move according to inertia vector
        this.move(this.inertia.x,this.inertia.y);

        // Limit dude to scene.
        var sceneBounds = scene.getBounds();
        var myBounds = this.getBounds();
        if(sceneBounds.confineX(myBounds)) {
            this.inertia.x = 0;
        }
        if(sceneBounds.confineY(myBounds)) {
            this.inertia.y = 0;
        }
        this.setPosition(myBounds.position.x,myBounds.position.y);

        // Make dude shoot laser when space is pressed
        if(scene.isKeyDown(Keys.SPACE)) {
            if(this.laserTimer < 0) {
                /*
                var laser = this.laserBuffer.getNext();
                laser.placeAt(this.dude);
                */
                console.log("fire!");
                this.laserTimer = 0.5;
            }
        }
        this.laserTimer -= delta;
    }
}

class Enemy extends Actor {
    constructor() {
        super("enemy");
    }

    public update(delta: number): void {
        var scene = this.getScene();
        this.move(-300 * delta, 0);
        if(!this.getBounds().intersectsRect(scene.getBounds())) {
            var p = scene.getBounds().getRandomPoint();
            this.setPosition(800 + 60, p.y);
        }
    }
}

class Bullet extends Actor {
    constructor() {
        super("laser");
    }

    public update(delta: number): void {
        this.move(700 * delta, 0);
    }
}

class Game {

    // Scene and main timing
    private scene: Scene;    // Scene handles drawing sprites onto the canvas
    private timer: Timer;    // No longer a raw timing value; Timer can be found in engine.ts

    private actors: Actor[];
    private player: Player;
    private enemies: Ringbuffer<Enemy>;

    constructor() {
        this.scene = new Scene(window.document.body);
        this.timer = new Timer();

        this.actors = [];
        this.player = new Player();
        this.enemies = new Ringbuffer(8, () => {
            var e = new Enemy();
            var p = this.scene.getBounds().getRandomPoint();
            e.setPosition(p.x,p.y);
            return e;
        });
        
        this.addActor(this.player);
    }

    private addActor(a: Actor) {
        this.actors.push(a);
        a.addTo(this.scene);
    } 

    public update(tm: number): void {

        // Update timing
        this.timer.update(tm);
        var delta = this.timer.getDelta();

        // Update all actors
        for(var a in this.actors) {
            this.actors[a].update(delta);
        }

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
