import Mat from "../Math/Mat";

export interface TransParam {
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
    p?: Trans;
}

export default class Trans {

    mat = new Mat();
    param: TransParam = {};
    children: Trans[] = [];

    constructor(param: TransParam = {}) {
        this.param = { x: 0, y: 0, r: 0, s: 1, p: null, ...param };
        param.p?.add(this);
    }

    add(...children: Trans[]) {
        for (const child of children) {
            if (this.children.indexOf(child) < 0) {
                this.children.push(child);
                child.param.p = this;
            }
        }
        return this;
    }

    remove(...children: Trans[]) {
        for (const child of children) {
            const index = this.children.indexOf(child);
            if (index >= 0) {
                this.children.splice(index, 1);
                child.param.p = null;
            }
        }
    }

    each(callback: (item: Trans, index?: number) => void) {
        for (let i = this.children.length - 1; i >= 0; i--) {
            callback(this.children[i], i);
        }
    }

    update(delta: number) {
        this.each(child => child.update(delta));
    }

    set(param: TransParam, childParam: TransParam = {}) {
        if (param.p !== undefined) {
            this.param.p?.remove(this);
        }
        param.p?.add(this);
        this.param = { ...this.param, ...param };
        this.compute();
        this.children.forEach(child => child.set(childParam, childParam));
    }

    protected compute() {
        const { x, y, r, s, sx, sy, p } = this.param;
        this.mat.reset(p?.mat)
            .translate(x, y)
            .rotate(r)
            .scale(sx || s, sy || s);
    }

}
