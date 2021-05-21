import texture from "../../asset/texture";
import Sprite, {SpriteParam} from "./Sprite";
import Object2D from "../Engine/Object2D";

const MAX_SPRITE = 4096;

export default class Context {

    uv = new Float32Array(MAX_SPRITE * 8);
    pos = new Float32Array(MAX_SPRITE * 8);
    idx = new Uint16Array(MAX_SPRITE * 6);
    color = new Float32Array(MAX_SPRITE * 16);
    layers = new Map<number, Sprite[]>();
    count = 0;

    constructor(public margin: number = 1) {
        const index = [0, 1, 2, 2, 1, 3];
        const length = index.length;
        for (let i = 0; i < this.idx.length; i++) {
            const offset = Math.floor(i / length) * 4;
            this.idx[i] = index[i % length] + offset;
        }
    }

    add(...sprites: Object2D[]): Context {
        for (const sprite of sprites) {
            sprite.each(s => this.add(s), true);
            if (sprite instanceof Sprite) {
                const {n, l} = sprite.param;
                const layers = this.layers;
                if (n) {
                    if (!layers.has(l)) {
                        layers.set(l, []);
                    }
                    layers.get(l).push(sprite);
                }
            }
        }
        return this;
    }

    flush(layers: number[] | IterableIterator<number> = this.layers.keys()): Context {
        this.count = 0;
        for (const layer of layers) {
            const sprites = this.layers.get(layer);
            if (sprites) {
                sprites.forEach(s => this.addSprite(s));
                sprites.length = 0;
            }
        }
        return this;
    }

    protected addSprite(sprite: Sprite) {
        const param = sprite.param;
        if (param.n in texture.frames && this.count < MAX_SPRITE) {
            this.addUv(param);
            this.pos.set(sprite.mesh, this.count * 8);
            let i = 16 * this.count++;
            for (let j = 0; j < 4; j++) {
                this.color.set(sprite.tint, j * 4 + i);
            }
        }
    }

    protected addUv({n, f, w, h}: SpriteParam) {
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
