/// <reference path="engine.ts" />
/// <reference path="math.ts" />

class Actor {
    private _actor_sprite: Sprite;
    private _actor_bounds: Rect;
    private _actor_alive: boolean;
    private _actor_scene: Scene;

    constructor(spriteName: string) {
        var s = this._actor_sprite = new Sprite(spriteName);
        this._actor_bounds = new Rect(0,0,s.getWidth(),s.getHeight());
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

    public setPosition(x:number, y:number): void {
        this._actor_sprite.setPosition(x,y);
        this._actor_bounds.position.setXY(x,y);
    }

    public move(dx:number, dy:number): void {
        this._actor_sprite.move(dx,dy);
        var p = this._actor_bounds.position;
        this._actor_bounds.position.setXY(p.x + dx, p.y + dy);
    }

    public update(delta: number): void {
    }

}
