import Mat from "../Math/Mat";
import Vec from "../Math/Vec";
import { $, on } from "../utils";

export interface CameraParam {
    /** X coordinate */
    x?: number;
    /** Y coordinate */
    y?: number;
    /** Rotate (rad) */
    r?: number;
    /** Scale (zoom) */
    s?: number;
}

class Camera {

    mat: Mat = new Mat();
    param: CameraParam = {};
    canvas: HTMLCanvasElement = $("#game") as HTMLCanvasElement;
    gl: WebGLRenderingContext = this.canvas.getContext("webgl");

    constructor() {
        const { width, height } = this.canvas;
        this.gl.viewport(0, 0, width, height);
        this.set({ x: 0, y: 0, r: 0, s: 1 });
    }

    set(param: CameraParam) {
        this.param = { ...this.param, ...param };
        const { x, y, r, s } = this.param;
        const { width, height } = this.canvas;
        this.mat.project(width, height)
            .translate(width / 2 - x, height / 2 - y)
            .rotate(-r)
            .scale(s);
    }

    raycast(pos: Vec) {
        const body = document.body;
        const { x, y, r, s } = this.param;
        const { width, clientWidth } = this.canvas;
        pos.sub(body.clientWidth / 2, body.clientHeight / 2)
            .scale(width / clientWidth)
            .add(x, y)
            .rotate(r)
            .scale(1 / s);
    }

}

export default new Camera();
