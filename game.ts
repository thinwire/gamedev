//
// Game Engine
//

enum Keys {
    LEFT = 37,
    RIGHT =  39,
    UP = 38,
    DOWN = 40,
    SPACE = 32
}

class Sprite {

    public x: number;
    public y: number;
    public w: number;
    public h: number;
    public scale: number;
    public image: HTMLImageElement;

    constructor(imageName: string) {
        this.image = <HTMLImageElement>document.getElementById(imageName);
        this.x = 0;
        this.y = 0;
        this.w = this.image.width;
        this.h = this.image.height;
        this.scale = 1;
    }

    public move(dx: number, dy: number): void {
        this.x += dx;
        this.y += dy;
    }

    public setPosition(x: number, y: number): void {
        this.x = x;
        this.y = y;
    }

    public setScale(s: number): void {
        this.scale = s;
    }

}

class Scene {
    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;
    private sprites: Sprite[];

    private keys: boolean[];
    private mousex: number;
    private mousey: number;
    private mouseb: boolean;

    public constructor(doc:HTMLElement) {
        this.keys = [];
        this.sprites = [];
        this.canvas = doc.getElementsByTagName('canvas')[0];
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
        this.context = this.canvas.getContext('2d');

        //
        // Input system
        //

        window.onkeydown = (e) => {
            this.keys[e.keyCode] = true;
            e.stopPropagation();
            e.preventDefault();
        };

        window.onkeyup = (e) => {
            this.keys[e.keyCode] = false;
            e.stopPropagation();
            e.preventDefault();
        };

        var updateMouseXY = (e: MouseEvent) => {
            this.mousex = e.offsetX;
            this.mousey = e.offsetY;
        };

        this.canvas.onmousedown = (e) => {
            this.mouseb = true;
            updateMouseXY(e);
            e.stopPropagation();
            e.preventDefault();
        };

        this.canvas.onmouseup = (e) => {
            this.mouseb = false;
            updateMouseXY(e);
            e.stopPropagation();
            e.preventDefault();
        };

        this.canvas.onmousemove = (e) => {
            updateMouseXY(e);
            e.stopPropagation();
            e.preventDefault();  
        };
    }

    public isKeyDown(key: number): boolean {
        return this.keys[key] === true;
    }

    public getMouseX(): number {
        return this.mousex;
    }

    public getMouseY(): number {
        return this.mousey;
    }

    public isMouseDown(): boolean {
        return this.mouseb;
    }
    
    public addSprite(sprite: Sprite): void {
        this.sprites.push(sprite);
    }

    public removeSprite(sprite: Sprite): void {
        var idx = this.sprites.indexOf(sprite);
        if(idx >= 0) {
            this.sprites.splice(idx);
        }
    }

    public update(): void {
        // Clear the canvas
        this.context.fillStyle = "rgba(0,0,0,1)";
        this.context.fillRect(0,0,this.canvas.width,this.canvas.height);

        // Draw all sprites
        for(var i = 0; i < this.sprites.length; ++i) {
            var s = this.sprites[i];
            this.context.drawImage(s.image,0,0,s.w,s.h,s.x,s.y,s.w * s.scale,s.h * s.scale);
        }
    }
}

//
// The actual game
//

class Game {

    private scene: Scene;       // Scene handles drawing sprites onto the canvas
    private tm_last: number;    // Value used for timing

    // "Dude", our hero character
    private dude: Sprite;
    private ddx: number = 0;
    private ddy: number = 0;

    constructor() {
        this.scene = new Scene(window.document.body);
        this.dude = new Sprite("dude");
        this.scene.addSprite(this.dude);
        this.tm_last = 0;
    }

    public update(tm: number): void {

        // Update timing
        var delta = (tm - this.tm_last) / 1000;
        if(delta >= 1) delta = 0;   // Ignore absurdly high delta times (delta should be below 0.2 in normal cases)
        this.tm_last = tm;
        
        //
        // Game logic
        //

        var dx: number = 0;
        var dy: number = 0;

        // Check input
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
        // TODO: query values instead of using hardcoded limits
        if(this.dude.x < 0) this.dude.x = 0;
        if(this.dude.y < 0) this.dude.y = 0;
        if(this.dude.x > 800 - 64) this.dude.x = 800 - 64;
        if(this.dude.y > 600 - 64) this.dude.y = 600 - 64;

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
requestAnimationFrame(loop);
