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
        param.p?.addChild(this);
    }

    protected addChild(child: Trans) {
        if (this.children.indexOf(child) < 0) {
            this.children.push(child);
            child.param.p = this;
        }
    }

    protected removeChild(child: Trans) {
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

    set(param: TransParam, childParam: TransParam = {}) {
        if (param.p !== undefined) {
            this.param.p?.removeChild(this);
        }
        param.p?.addChild(this);
        this.param = { ...this.param, ...param };
        this.compute();
        this.children.forEach(child => child.set(childParam, childParam));
    }
}
