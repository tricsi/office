export interface Vector {
    x: number;
    y: number;
}

export interface Circle extends Vector {
    r: number;
}

export interface Box extends Vector {
    w: number;
    h: number;
}

export type Object2D = Vector | Circle | Box;

export const ZERO: Vector = { x: 0, y: 0 };

export function vec2create(x = 0, y = 0): Vector {
    return { x, y };
}

export function vec2copy(out: Vector, vec: Vector): Vector {
    out.x = vec.x;
    out.y = vec.y;
    return out;
}

export function vec2add(out: Vector, vec: Vector): Vector {
    out.x += vec.x;
    out.y += vec.y;
    return out;
}

export function vec2sub(out: Vector, vec: Object2D): Vector {
    out.x -= vec.x;
    out.y -= vec.y;
    return out;
}

export function vec2scale(out: Vector, scale: number): Vector {
    out.x *= scale;
    out.y *= scale;
    return out;
}

export function vec2scale2(out: Vector, scale: Vector): Vector {
    out.x *= scale.x;
    out.y *= scale.y;
    return out;
}

export function vec2rotate(out: Vector, angle: number): Vector {
    const { x, y } = out;
    const s = Math.sin(angle);
    const c = Math.cos(angle);
    out.x = x * c - y * s;
    out.y = x * s + y * c;
    return out;
}

export function vec2prep(out: Vector): Vector {
    const { x, y } = out;
    out.x = y;
    out.y = -x;
    return out;
}

export function vec2reverse(out: Vector): Vector {
    out.x = -out.x;
    out.y = -out.y;
    return out;
}

export function vec2dot(vec1: Vector, vec2: Vector): number {
    return vec1.x * vec2.x + vec1.y * vec2.y;
}

export function vec2len2(vec: Vector): number {
    return vec2dot(vec, vec);
}

export function vec2len(vec: Vector): number {
    return Math.sqrt(vec2len2(vec));
}

export function vec2norm(out: Vector): Vector {
    const d = vec2len(out);
    if (d > 0) {
        out.x /= d;
        out.y /= d;
    }
    return out;
}

export function vec2project(out: Vector, vec: Vector): Vector {
    const amt = vec2dot(out, vec) / vec2len2(vec);
    out.x = amt * vec.x;
    out.y = amt * vec.y;
    return out;
}

export function vec2projectN(out: Vector, vec: Vector): Vector {
    const amt = vec2dot(out, vec);
    out.x = amt * vec.x;
    out.y = amt * vec.y;
    return out;
}

export function vec2reflect(out: Vector, axis: Vector): Vector {
    const { x, y } = out;
    vec2scale(vec2project(out, axis), 2);
    out.x -= x;
    out.y -= y;
    return out;
}

export function vec2reflectN(out: Vector, axis: Vector): Vector {
    const { x, y } = out;
    vec2scale(vec2projectN(out, axis), 2);
    out.x -= x;
    out.y -= y;
    return out;
}

export function obj2transform(out: Object2D, mat: Float32Array): Object2D {
    const { x, y } = out;
    out.x = mat[0] * x + mat[3] * y + mat[6];
    out.y = mat[1] * x + mat[4] * y + mat[7];
    return out;
}

export function box2create(x = 0, y = 0, w = 1, h = 1): Box {
    return { x, y, w, h };
}

export function box2add(out: Box, box: Box): Box {
    const { x, y, w, h } = out;
    out.x = Math.min(x, box.x);
    out.y = Math.min(y, box.y);
    out.w = Math.max(x + w, box.x + box.w) - out.x;
    out.h = Math.max(y + h, box.y + box.h) - out.y;
    return out;
}

export function box2vec2(box: Box, vec: Vector): boolean {
    return box.x <= vec.x && box.x + box.w >= vec.x && box.y <= vec.y && box.y + box.h >= vec.y;
}

export function box2box2(box1: Box, box2: Box): boolean {
    return box1.x < box2.x + box2.w && box1.x + box1.w > box2.x && box1.y < box2.y + box2.h && box1.y + box1.h > box2.y;
}

export function box2contains(box1: Box, box2: Box): boolean {
    return box1.x <= box2.x && box1.x + box1.w >= box2.x + box2.y && box1.y <= box2.y && box1.y + box1.h >= box2.y + box2.h;
}

export function box2intersect(box1: Box, box2: Box, out: Box): Box {
    let Ax = box1.x,
        Ay = box1.y,
        AX = Ax + box1.w,
        AY = Ay + box1.h,
        Bx = box2.x,
        By = box2.y,
        BX = Bx + box2.w,
        BY = By + box2.h;
    out.x = Ax < Bx ? Bx : Ax;
    out.y = Ay < By ? By : Ay;
    out.w = (AX < BX ? AX : BX) - out.x;
    out.h = (AY < BY ? AY : BY) - out.y;
    return out;
}

export function mat3create(): Float32Array {
    return new Float32Array([
        1, 0, 0,
        0, 1, 0,
        0, 0, 1
    ]);
}

export function mat3reset(out: Float32Array, mat?: Float32Array): Float32Array {
    if (mat) {
        out.set(mat);
    } else {
        out.fill(0);
        out[0] = 1;
        out[4] = 1;
        out[8] = 1;
    }
    return out;
}

export function mat3project(out: Float32Array, width: number, height: number): Float32Array {
    out[0] = 2 / width;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = -2 / height;
    out[5] = 0;
    out[6] = -1;
    out[7] = 1;
    out[8] = 1;
    return out;
}

export function mat3translate(out: Float32Array, x: number, y: number): Float32Array {
    if (x || y) {
        const [a00, a01, a02, a10, a11, a12, a20, a21, a22] = out;
        out[6] = x * a00 + y * a10 + a20;
        out[7] = x * a01 + y * a11 + a21;
        out[8] = x * a02 + y * a12 + a22;
    }
    return out;
}

export function mat3scale(out: Float32Array, x: number, y = x): Float32Array {
    if (x !== 1 || y !== 1) {
        out[0] *= x;
        out[1] *= x;
        out[2] *= x;
        out[3] *= y;
        out[4] *= y;
        out[5] *= y;
    }
    return out;
}

export function mat3rotate(out: Float32Array, rad: number): Float32Array {
    if (rad) {
        const s = Math.sin(rad);
        const c = Math.cos(rad);
        const [a00, a01, a02, a10, a11, a12] = out;
        out[0] = c * a00 + s * a10;
        out[1] = c * a01 + s * a11;
        out[2] = c * a02 + s * a12;
        out[3] = c * a10 - s * a00;
        out[4] = c * a11 - s * a01;
        out[5] = c * a12 - s * a02;
    }
    return out;
}

export function mat3multiply(out: Float32Array, mat: Float32Array): Float32Array {
    const [a00, a01, a02, a10, a11, a12, a20, a21, a22] = out;
    const [b00, b01, b02, b10, b11, b12, b20, b21, b22] = mat;
    out[0] = b00 * a00 + b01 * a10 + b02 * a20;
    out[1] = b00 * a01 + b01 * a11 + b02 * a21;
    out[2] = b00 * a02 + b01 * a12 + b02 * a22;
    out[3] = b10 * a00 + b11 * a10 + b12 * a20;
    out[4] = b10 * a01 + b11 * a11 + b12 * a21;
    out[5] = b10 * a02 + b11 * a12 + b12 * a22;
    out[6] = b20 * a00 + b21 * a10 + b22 * a20;
    out[7] = b20 * a01 + b21 * a11 + b22 * a21;
    out[8] = b20 * a02 + b21 * a12 + b22 * a22;
    return out;
}
