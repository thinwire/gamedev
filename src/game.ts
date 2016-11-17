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

class Actor {
    private _actor_sprite: Sprite;
    private _actor_bounds: Rect;
    private _actor_alive: boolean;
    private _actor_scene: Scene;

    constructor(spriteName: string) {
        this._actor_sprite = new Sprite(spriteName);
        this._actor_bounds = new Rect(0,0,this._actor_sprite.getWidth(),this._actor_sprite.getHeight());
        this._actor_alive = false;
    }

    public isAlive(): boolean {
        return this._actor_alive;
    }

    public setAlive(b: boolean): void {
        this._actor_alive = b;
    }

    public addTo(scene: Scene): void {
        this._actor_scene = scene;
        scene.addSprite(this._actor_sprite);
    }

    public getScene(): Scene {
        return this._actor_scene;
    }

    public getSprite(): Sprite {
        return this._actor_sprite;
    }

    public getBounds(): Rect {
        return this._actor_bounds;
    }

    public getWidth(): number {
        return this._actor_sprite.getWidth();
    }

    public getHeight(): number {
        return this._actor_sprite.getHeight();
    }

    public getPosition(): Vec2 {
        return this._actor_sprite.getPosition();
    }

    public setPosition(x:number, y:number):void {
        this._actor_sprite.setPosition(x,y);
        this._actor_bounds.position.setXY(x,y);
    }

    public move(dx:number, dy:number):void {
        this._actor_sprite.move(dx,dy);
        var p = this._actor_bounds.position;
        this._actor_bounds.position.setXY(p.x + dx, p.y + dy);
    }

    public update(delta: number): void {
    }

}

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
