import Sprite, { SpriteParam } from "../core/Sprite";
import Object2D from "../core/Object2D";

export interface IContext {
    uv: Float32Array;
    pos: Float32Array;
    idx: Uint16Array;
    color: Float32Array;
    count: number;
    size: number;
}

export interface ISpriteSheet {
    size: [number, number];
    margin: number;
    frames: { [name: string]: [number, number] };
}

export function createCtx(size = 4096): IContext {
    const idx = new Uint16Array(size * 6);
    const index = [0, 1, 2, 2, 1, 3];
    for (let i = 0; i < idx.length; i++) {
        idx[i] = Math.floor(i / 6) * 4 + index[i % 6];
    }
    return {
        idx,
        uv: new Float32Array(size * 8),
        pos: new Float32Array(size * 8),
        color: new Float32Array(size * 16),
        count: 0,
        size
    };
}

export function flush(
    ctx: IContext,
    sheet: ISpriteSheet,
    objects: Object2D[],
    reset = true
) {
    if (reset) {
        ctx.count = 0;
    }
    for (let i = objects.length - 1; i >= 0; i--) {
        const obj = objects[i];
        flush(ctx, sheet, obj.children, false);
        if (obj instanceof Sprite) {
            addSprite(ctx, obj, sheet);
        }
    }
}

function addSprite(ctx: IContext, sprite: Sprite, sheet: ISpriteSheet) {
    const { param, tint, mesh } = sprite;
    const { pos, color, count, size } = ctx;
    if (param.n in sheet.frames && count < size) {
        addUvs(ctx, param, sheet);
        pos.set(mesh, count * 8);
        let i = count * 16;
        for (let j = 0; j < 4; j++) {
            color.set(tint, j * 4 + i);
        }
        ctx.count++;
    }
}

function addUvs(ctx: IContext, param: SpriteParam, sheet: ISpriteSheet) {
    let { n, f, w, h } = param;
    const [sw, sh] = sheet.size;
    const p = sheet.margin / sw;
    let [x, y] = sheet.frames[n];
    x /= sw;
    y /= sh;
    w /= sw;
    h /= sh;
    x += (w + p) * Math.floor(f);
    ctx.uv.set([x, y, x + w, y, x, y + h, x + w, y + h], ctx.count * 8);
}
