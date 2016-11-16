//
// Game Engine
//

/// <reference path="math.ts" />

enum Keys {
    LEFT = 37,
    RIGHT =  39,
    UP = 38,
    DOWN = 40,
    SPACE = 32
}

class Sprite {

    protected position: Vec2;
    protected size: Vec2;
    protected scale: number;
    protected image: HTMLImageElement;

    constructor(imageName: string) {
        this.image = <HTMLImageElement>document.getElementById(imageName);
        this.position = new Vec2();
        this.size = new Vec2(this.image.width,this.image.height);
        this.scale = 1;
    }

    public getImage(): HTMLImageElement {
        return this.image;
    }

    public getX(): number {
        return this.position.x;
    }
    
    public getY(): number {
        return this.position.y;
    }

    public getWidth(): number {
        return this.size.x;
    }

    public getHeight(): number {
        return this.size.y;
    }

    public getSize(): Vec2 {
        return this.size;
    }

    public placeAt(sprite: Sprite): void {
        this.position.set(sprite.position);
    }

    public setPosition(x: number, y: number): void {
        this.position.setXY(x,y);
    }

    public getPosition(): Vec2 {
        return this.position;
    }

    public move(dx: number, dy: number): void {
        this.position.addXY(dx,dy);
    }

    public setScale(s: number): void {
        this.scale = s;
    }

    public getScale(): number {
        return this.scale;
    }

}

class Timer {
    private current: number;
    private last: number;
    private delta: number;

    constructor() {
        this.current = 0;
        this.last = 0;
        this.delta = 0;
    }

    public getCurrent(): number {
        return this.current;
    }

    public getLast(): number {
        return this.last;
    }

    public getDelta(): number {
        return this.delta;
    }

    public update(timestamp: number): void {
        this.delta = timestamp - this.current;
        this.last = this.current;
        this.current = timestamp;
        if(this.delta > 1000) {
            this.delta = 0;
        }
        this.delta *= 0.001;
    }
}

class Scene {
    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;
    private sprites: Sprite[];

    private bounds: Rect;
    private width: number;
    private height: number;

    private keys: boolean[];
    private mousex: number;
    private mousey: number;
    private mouseb: boolean;

    public constructor(doc: HTMLElement) {
        this.keys = [];
        this.sprites = [];
        this.canvas = doc.getElementsByTagName('canvas')[0];
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
        this.context = this.canvas.getContext('2d');

        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.bounds = new Rect(0,0,this.width,this.height);

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

    public getBounds(): Rect {
        return this.bounds;
    }

    public getWidth(): number {
        return this.width;
    }

    public getHeight(): number {
        return this.height;
    }

    public update(): void {
        // Clear the canvas
        this.context.fillStyle = "rgba(0,0,0,1)";
        this.context.fillRect(0,0,this.width,this.height);

        // Draw all sprites
        for(var i = 0; i < this.sprites.length; ++i) {
            var s = this.sprites[i];

            var image = s.getImage();
            var position = s.getPosition();
            var size = s.getSize();
            var scale = s.getScale();

            this.context.drawImage(image,0,0,size.x,size.y,position.x,position.y,size.x * scale,size.y * scale);
        }
    }
}
