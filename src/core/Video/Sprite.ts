import Box from "../Math/Box";
import { RGBA } from "./Context";
import Trans, { TransParam } from "./Trans";

export interface SpriteParam extends TransParam {
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
    /** Render layer */
    l?: number;
    /** Tint Color */
    c?: string;
    /** Alpha */
    a?: number;
}

export default class Sprite extends Trans {

    param: SpriteParam;
    mesh: Float32Array = new Float32Array(8);
    tint: RGBA = [1, 1, 1, 1];
    box: Box = new Box();
    children: Sprite[];

    constructor(param: SpriteParam = {}) {
        super({ n: "", f: 0, w: 0, h: 0, px: 0, py: 0, mh: 0, mv: 0, l: 0, c: "", a: 1, ...param });
        this.compute();
        let { w, h, mh, mv } = this.param;
        const params = { ...this.param, x: w, y: h, r: 0, px: w, py: h, mh: 0, mv: 0, p: this };
        mh && new Sprite({ ...params, x: mh, sx: -1, sy: 1 });
        mv && new Sprite({ ...params, y: mv, sx: 1, sy: -1 });
        mh && mv && new Sprite({ ...params, x: mh, y: mv, sx: -1, sy: -1 });
    }

    set(param: SpriteParam, childParam: SpriteParam = {}) {
        super.set(param, childParam);
        this.children.forEach(child => child instanceof Sprite && this.box.add(child.box));
    }

    protected compute() {
        super.compute();
        const { w, h, px, py, c, a, p } = this.param;
        const data = this.mat.translate(-px, -py).data;

        p instanceof Sprite ? p.tint.forEach((v, i) => this.tint[i] = v) : this.tint.fill(1);
        c.split("").forEach((v, i) => this.tint[i] *= parseInt(v, 16) / 15);
        this.tint[3] *= a;

        const mesh = this.mesh;
        mesh.set([
            data[6],
            data[7],
            data[0] * w + data[6],
            data[1] * w + data[7],
            data[3] * h + data[6],
            data[4] * h + data[7],
            data[0] * w + data[3] * h + data[6],
            data[1] * w + data[4] * h + data[7]
        ]);

        const box = this.box;
        box.x = Math.min(mesh[0], mesh[2], mesh[4], mesh[6]);
        box.y = Math.min(mesh[1], mesh[3], mesh[5], mesh[7]);
        box.w = Math.max(mesh[0], mesh[2], mesh[4], mesh[6]) - box.x;
        box.h = Math.max(mesh[1], mesh[3], mesh[5], mesh[7]) - box.y;
    }

}
