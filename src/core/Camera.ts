import { $ } from "../modules/utils";
import Object2D, { ObjectParam } from "./Object2D";
import { on } from "../modules/events";
import {
    mat3multiply,
    mat3project,
    mat3reset,
    mat3rotate,
    mat3scale,
    mat3translate,
    vec2add,
    vec2rotate,
    vec2scale,
    vec2sub,
    Vector
} from "../modules/math";

export interface CameraParam extends ObjectParam
{
    w?: number;
    h?: number;
    z?: number;
}

class Camera extends Object2D {

    canvas = $("#game") as HTMLCanvasElement;
    gl = this.canvas.getContext("webgl");
    param: CameraParam;

    constructor() {
        super();
        this.param = { w: this.canvas.width, h: this.canvas.height, z: 1, ...this.param };
        this.resize();
        on("resize", () => this.resize(), window);
    }

    resize() {
        const canvas = this.canvas;
        const { w, h } = this.param;
        const z = Math.ceil(canvas.clientWidth / w);
        canvas.width = w * z;
        canvas.height = h * z;
        this.gl.viewport(0, 0, canvas.width, canvas.height);
        this.param.z = z;
        this.compute();
    }

    compute() {
        const { x, y, z, r, s, p } = this.param;
        const { width, height } = this.canvas;
        
        const mat = mat3project(this.mat, width, height);
        p && mat3multiply(mat, p.mat);
        mat3translate(mat, width / 2, height / 2);
        mat3scale(mat, z);
        mat3translate(mat, -x, -y);
        mat3rotate(mat, -r)
        mat3scale(mat, s);
    }

    raycast(pos: Vector) {
        const { x, y, z, r, s } = this.param;
        const { clientWidth, clientHeight } = document.body;
        vec2sub(pos, { x: clientWidth / 2, y: clientHeight / 2 })
        vec2scale(pos, 1 / z);
        vec2add(pos, { x, y });
        vec2rotate(pos, r);
        vec2scale(pos, 1 / s);
    }

}

export default new Camera();
