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