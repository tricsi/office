import Object2D, {ObjectParam} from "./Object2D";
import {box2add, box2create, mat3translate} from "../modules/math";

export interface SpriteParam extends ObjectParam {
    /** Name */
    n?: string;
    /** Frame number */
    f?: number;
    /** Width */
    w?: number;
    /** Height */
    h?: number;
    /** Pivot X */
    px?: number;
    /** Pivot Y */
    py?: number;
    /** Horizontal Mirror distance (< 0 left; > 0 right;) */
    mh?: number;
    /** Vertical Mirror distance (< 0 top; > 0 bottom;) */
    mv?: number;
    /** Tint Color */
    c?: string;
    /** Alpha */
    a?: number;
}

export default class Sprite extends Object2D {

    children: Sprite[];
    param: SpriteParam;
    mesh = new Float32Array(8);
    tint = new Float32Array(4);
    box = box2create();

    constructor(param: SpriteParam = {}) {
        super({n: "", f: 0, w: 0, h: 0, px: 0, py: 0, mh: 0, mv: 0, c: "", a: 1, ...param});
        this.compute();
        let {w, h, mh, mv} = this.param;
        const params = {...this.param, x: w, y: h, r: 0, px: w, py: h, mh: 0, mv: 0, p: this};
        mh && new Sprite({...params, x: mh, sx: -1, sy: 1});
        mv && new Sprite({...params, y: mv, sx: 1, sy: -1});
        mh && mv && new Sprite({...params, x: mh, y: mv, sx: -1, sy: -1});
    }

    set(param: SpriteParam, childParam: SpriteParam = {}) {
        super.set(param, childParam);
        this.children.forEach(child => child instanceof Sprite && box2add(this.box, child.box));
    }

    protected compute() {
        super.compute();
        const {w, h, px, py, c, a, p} = this.param;
        const mat = this.mat;
        mat3translate(mat, -px, -py);

        p instanceof Sprite ? this.tint.set(p.tint) : this.tint.fill(1);
        c.split("").forEach((v, i) => this.tint[i] *= parseInt(v, 16) / 15);
        this.tint[3] *= a;

        const mesh = this.mesh;
        mesh.set([
            mat[6],
            mat[7],
            mat[0] * w + mat[6],
            mat[1] * w + mat[7],
            mat[3] * h + mat[6],
            mat[4] * h + mat[7],
            mat[0] * w + mat[3] * h + mat[6],
            mat[1] * w + mat[4] * h + mat[7]
        ]);

        const box = this.box;
        box.x = Math.min(mesh[0], mesh[2], mesh[4], mesh[6]);
        box.y = Math.min(mesh[1], mesh[3], mesh[5], mesh[7]);
        box.w = Math.max(mesh[0], mesh[2], mesh[4], mesh[6]) - box.x;
        box.h = Math.max(mesh[1], mesh[3], mesh[5], mesh[7]) - box.y;
    }

}
