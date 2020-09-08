import Box from "../Math/Box";
import Mat from "../Math/Mat";
import { RGBA } from "./Context";

export interface SpriteParam
{
    /** Name */
    n?: string;
    /** Frame number */
    f?: number;
    /** Translate X */
    x?: number;
    /** Translate Y */
    y?: number;
    /** Width */
    w?: number;
    /** Height */
    h?: number;
    /** Rotate */
    r?: number;
    /** Scale */
    s?: number;
    /** Scale X */
    sx?: number;
    /** Scale Y */
    sy?: number;
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
    /** Parent */
    p?: Sprite;
}

export default class Sprite
{

    param: SpriteParam;
    mesh: Float32Array = new Float32Array(8);
    tint: RGBA = [1, 1, 1, 1];
    box: Box = new Box();
    mat: Mat = new Mat();
    children: Sprite[] = [];

    constructor(param: SpriteParam = {})
    {
        this.param = {n: "", f: 0, x: 0, y: 0, w: 0, h: 0, r: 0, s: 1, px: 0, py: 0, mh: 0, mv: 0, l: 0, c: "", a: 1, p: null, ...param};
        param.p?.addChild(this);
        this.compute();
        let {w, h, mh, mv} = this.param;
        const params = {...this.param, x: w, y: h, r: 0, px: w, py: h, mh: 0, mv: 0, p: this};
        mh && new Sprite({...params, x: mh, sx: -1, sy: 1});
        mv && new Sprite({...params, y: mv, sx: 1, sy: -1});
        mh && mv && new Sprite({...params, x: mh, y: mv, sx: -1, sy: -1});
    }

    set(param: SpriteParam, childParam: SpriteParam = {})
    {
        if (param.p !== undefined)
        {
            this.param.p?.removeChild(this);
        }
        param.p?.addChild(this);
        this.param = {...this.param, ...param};
        this.compute();
        if (childParam)
        {
            this.children.forEach(child => {
                child.set(childParam, childParam);
                this.box.add(child.box);
            });
        }
    }

    protected addChild(child: Sprite)
    {
        if (this.children.indexOf(child) < 0)
        {
            this.children.push(child);
            child.param.p = this;
        }
    }

    protected removeChild(child: Sprite)
    {
        const index = this.children.indexOf(child);
        if (index >= 0)
        {
            this.children.splice(index, 1);
            child.param.p = null;
        }
    }

    protected compute()
    {
        const box = this.box;
        const mesh = this.mesh;
        const {x, y, w, h, r, s, sx, sy, px, py, c, a, p} = this.param;
        p ? p.tint.forEach((v, i) => this.tint[i] = v) : this.tint.fill(1);
        c.split("").forEach((v, i) => this.tint[i] *= parseInt(v, 16) / 15);
        this.tint[3] *= a;
        const data = this.mat.reset(p?.mat)
            .translate(x, y)
            .rotate(r)
            .scale(sx || s, sy || s)
            .translate(-px, -py)
            .data;
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
        box.x = Math.min(mesh[0], mesh[2], mesh[4], mesh[6]);
        box.y = Math.min(mesh[1], mesh[3], mesh[5], mesh[7]);
        box.w = Math.max(mesh[0], mesh[2], mesh[4], mesh[6]) - box.x;
        box.h = Math.max(mesh[1], mesh[3], mesh[5], mesh[7]) - box.y;
    }

}
