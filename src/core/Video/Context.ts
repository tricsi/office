import texture from "../../asset/texture";
import Sprite, { SpriteParam } from "./Sprite";

export type RGBA = [number, number, number, number];

const MAX_SPRITE = 16384;

export default class Context
{

    uv: Float32Array;
    pos: Float32Array;
    idx: Uint16Array;
    color: Float32Array;
    count: number = 0;
    layers = new Map<number, Sprite[]>();

    constructor(public margin: number = 1)
    {
        const index = [0, 1, 2, 2, 1, 3];
        const length = index.length;
        this.uv = new Float32Array(MAX_SPRITE * 8);
        this.pos = new Float32Array(MAX_SPRITE * 8);
        this.idx = new Uint16Array(MAX_SPRITE * length);
        this.color = new Float32Array(MAX_SPRITE * 16);
        for (let i = 0; i < this.idx.length; i++)
        {
            const offset = Math.floor(i / length) * 4;
            this.idx[i] = index[i % length] + offset;
        }
    }

    flush(
        sort?: (a: Sprite, b: Sprite) => number,
        layers: number[] | IterableIterator<number> = this.layers.keys()
    ): Context
    {
        this.count = 0;
        for (const layer of layers)
        {
            const sprites = this.layers.get(layer);
            if (sprites)
            {
                (sort ? sprites.sort(sort) : sprites).forEach(sprite => this.addSprite(sprite));
                sprites.length = 0;
            }
        }
        return this;
    }

    add(sprite: Sprite | Sprite[]): Context
    {
        if (sprite instanceof Array)
        {
            sprite.forEach(s => this.add(s));
            return this;
        }
        const {n, l} = sprite.param;
        if (n)
        {
            if (!this.layers.has(l))
            {
                this.layers.set(l, []);
            }
            this.layers.get(l).push(sprite);
        }
        this.add(sprite.children);
        return this;
    }

    protected addSprite(sprite: Sprite)
    {
        const param = sprite.param;
        if (param.n in texture.frames && this.count < MAX_SPRITE)
        {
            this.addUv(param);
            this.pos.set(sprite.mesh, this.count * 8);
            let i = 16 * this.count++;
            for (let j = 0; j < 4; j++)
            {
                this.color.set(sprite.tint, j * 4 + i);
            }
        }
    }

    protected addUv({n, f, w, h}: SpriteParam)
    {
        const [sw, sh] = texture.size;
        const p = this.margin / sw;
        let [x, y] = (texture.frames as any)[n];
        x /= sw;
        y /= sh;
        w /= sw;
        h /= sh;
        x += (w + p) * Math.floor(f);
        this.uv.set([x, y, x + w, y, x, y + h, x + w, y + h], this.count * 8);
    }

}
