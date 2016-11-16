//
// Math routines
//

class Vec2 {

    public x: number;
    public y: number;

    constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }

    public length(): number {
        var dx = this.x * this.x;
        var dy = this.y * this.y;
        return Math.sqrt(dx + dy);
    }

    public normalize(): Vec2 {
        var l = 1.0 / this.length();
        this.x *= l;
        this.y *= l;
        return this;
    }

    public set(v: Vec2): Vec2 {
        this.x = v.x;
        this.y = v.y;
        return this;
    }

    public setXY(x: number, y: number): Vec2 {
        this.x = x;
        this.y = y;
        return this;
    }

    public clamp(min: Vec2, max: Vec2): Vec2 {
        return this.clampXY(min.x,max.x,min.y,max.y);
    }

    public clampX(xmin: number, xmax: number): Vec2 {
        if(this.x < xmin) this.x = xmin;
        if(this.x > xmax) this.x = xmax;
        return this;
    }

    public clampY(ymin: number, ymax: number): Vec2 {
        if(this.y < ymin) this.y = ymin;
        if(this.y > ymax) this.y = ymax;
        return this;
    }

    public clampXY(xmin: number, xmax: number, ymin: number, ymax: number): Vec2 {
        this.clampX(xmin,xmax);
        this.clampY(ymin,ymax);
        return this;
    }

    public add(v: Vec2): Vec2 {
        this.x += v.x;
        this.y += v.y;
        return this;
    }

    public addXY(x: number, y: number): Vec2 {
        this.x += x;
        this.y += y;
        return this;
    }

    public multiply(v: Vec2): Vec2 {
        this.x *= v.x;
        this.y *= v.y;
        return this;
    }

    public multiplyXY(x: number, y: number = x): Vec2 {
        this.x *= x;
        this.y *= y;
        return this;
    }
}

class Circle {
    public position: Vec2;
    public radius: number;

    constructor(x: number = 0, y: number = 0, radius: number = 0) {
        this.position = new Vec2(x,y);
        this.radius = radius;
    }

    public isPointInside(v: Vec2): boolean {
        return this.isPointInsideXY(v.x,v.y);
    }

    public isPointInsideXY(x: number, y: number): boolean {
        var dx = this.position.x - x;
        var dy = this.position.y - y;
        return Math.sqrt(dx * dx + dy * dy) < this.radius;
    }

    public intersects(c: Circle): boolean {
        var dx = this.position.x - c.position.x;
        var dy = this.position.y - c.position.y;
        var ddx = dx * dx;
        var ddy = dy * dy;
        
        return Math.sqrt(ddx + ddy) < (this.radius + c.radius);
    }
}

class Rect {
    public position: Vec2;
    public size: Vec2;

    constructor(x: number = 0, y: number = 0, w: number = 0, h: number = 0) {
        this.position = new Vec2(x,y);
        this.size = new Vec2(w,h);
    }

    /**
     * Test if a point is inside this rectangle
     */
    public isPointInside(v: Vec2): boolean {
        return this.isPointInsideXY(v.x,v.y);
    }

    public isPointInsideXY(x: number, y: number): boolean {
        var x0 = this.position.x;
        var x1 = x0 + this.size.x;
        var y0 = this.position.y;
        var y1 = y0 + this.size.y;
        if(x0 > x1) { var t = x0; x0 = x1; x1 = t; }
        if(y0 > y1) { var t = y0; y0 = y1; y1 = t; }

        return x >= x0 && x < x1 && y >= y0 && y < y1;
    }

    /**
     * Test if this rectangle intersects another rectangle
     */
    public intersectsRect(r: Rect): boolean {
        var x0 = this.position.x;
        var x1 = x0 + this.size.x;
        var y0 = this.position.y;
        var y1 = y0 + this.size.y;
        if(x0 > x1) { var t = x0; x0 = x1; x1 = t; }
        if(y0 > y1) { var t = y0; y0 = y1; y1 = t; }

        var x2 = r.position.x;
        var y2 = r.position.y;
        var x3 = x2 + r.size.x;
        var y3 = y2 + r.size.y;
        if(x2 > x3) { var t = x2; x2 = x3; x3 = t; }
        if(y2 > y3) { var t = y2; y2 = y3; y3 = t; }

        var xtest: boolean = !(x0 > x3 || x1 < x2);
        var ytest: boolean = !(y0 > y3 || y1 < y2);

        return xtest && ytest;
    }

    public getRandomPoint(): Vec2 {
        var v = new Vec2();
        v.x = this.position.x + Math.random() * this.size.x;
        v.y = this.position.y + Math.random() * this.size.y;
        return v;
    }

    public intersectsCircle(c: Circle): boolean {
        // TODO: implement
        return false;
    }

}
