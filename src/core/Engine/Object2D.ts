import Mat from "../Math/Mat";

export interface ObjectParam {
    /** X coordinate */
    x?: number;
    /** Y coordinate */
    y?: number;
    /** Rotate (rad) */
    r?: number;
    /** Scale */
    s?: number;
    /** Scale X */
    sx?: number;
    /** Scale Y */
    sy?: number;
    /** Parent */
    p?: Object2D;
}

export default class Object2D {

    mat = new Mat();
    param: ObjectParam = {};
    children: Object2D[] = [];

    constructor(param: ObjectParam = {}) {
        this.param = { x: 0, y: 0, r: 0, s: 1, p: null, ...param };
        param.p?.add(this);
    }

    each(callback: (item: Object2D, index?: number) => void, recursive = false) {
        for (let i = this.children.length - 1; i >= 0; i--) {
            const child = this.children[i];
            recursive && child.each(callback, recursive);
            callback(child, i);
        }
    }

    set(param: ObjectParam, childParam: ObjectParam = {}) {
        if (param.p !== undefined) {
            this.param.p?.remove(this);
        }
        param.p?.add(this);
        this.param = { ...this.param, ...param };
        this.compute();
        this.each(child => child.set(childParam));
    }

    protected add(child: Object2D) {
        if (this.children.indexOf(child) < 0) {
            this.children.push(child);
            child.param.p = this;
        }
    }

    protected remove(child: Object2D) {
        const index = this.children.indexOf(child);
        if (index >= 0) {
            this.children.splice(index, 1);
            child.param.p = null;
        }
    }

    protected compute() {
        const { x, y, r, s, sx, sy, p } = this.param;
        this.mat.reset(p?.mat)
            .translate(x, y)
            .rotate(r)
            .scale(sx || s, sy || s);
    }

}
