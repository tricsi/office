export default class Mat {

    data = new Float32Array(9);

    constructor() {
        this.reset();
    }

    reset(mat?: Mat): Mat {
        this.data.set(mat ? mat.data : [
            1, 0, 0,
            0, 1, 0,
            0, 0, 1
        ]);
        return this;
    }

    project(w: number, h: number): Mat {
        this.data.set([
            2 / w, 0, 0,
            0, -2 / h, 0,
            -1, 1, 1
        ]);
        return this;
    }

    translate(x: number, y: number): Mat {
        if (x || y) {
            const [a00, a01, a02, a10, a11, a12, a20, a21, a22] = this.data;
            this.data.set([
                x * a00 + y * a10 + a20,
                x * a01 + y * a11 + a21,
                x * a02 + y * a12 + a22
            ], 6);
        }
        return this;
    }

    rotate(rad: number): Mat {
        if (rad) {
            const s = Math.sin(rad);
            const c = Math.cos(rad);
            const [a00, a01, a02, a10, a11, a12] = this.data;
            this.data.set([
                c * a00 + s * a10,
                c * a01 + s * a11,
                c * a02 + s * a12,
                c * a10 - s * a00,
                c * a11 - s * a01,
                c * a12 - s * a02
            ]);
        }
        return this;
    }

    scale(x: number, y = x): Mat {
        if (x !== 1 || y !== 1) {
            const data = this.data;
            data[0] *= x;
            data[1] *= x;
            data[2] *= x;
            data[3] *= y;
            data[4] *= y;
            data[5] *= y;
        }
        return this;
    }

    multiply(mat: Mat) {
        const [a00, a01, a02, a10, a11, a12, a20, a21, a22] = this.data;
        const [b00, b01, b02, b10, b11, b12, b20, b21, b22] = mat.data;
        this.data.set([
            b00 * a00 + b01 * a10 + b02 * a20,
            b00 * a01 + b01 * a11 + b02 * a21,
            b00 * a02 + b01 * a12 + b02 * a22,
            b10 * a00 + b11 * a10 + b12 * a20,
            b10 * a01 + b11 * a11 + b12 * a21,
            b10 * a02 + b11 * a12 + b12 * a22,
            b20 * a00 + b21 * a10 + b22 * a20,
            b20 * a01 + b21 * a11 + b22 * a21,
            b20 * a02 + b21 * a12 + b22 * a22
        ]);
        return this;
    }

}
