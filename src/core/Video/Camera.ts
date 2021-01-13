import Vec from "../Math/Vec";
import { $, on } from "../utils";
import Trans from "./Trans";

class Camera extends Trans {

    canvas: HTMLCanvasElement = $("#game") as HTMLCanvasElement;
    gl: WebGLRenderingContext = this.canvas.getContext("webgl");
    width = this.canvas.width;
    height = this.canvas.height;

    constructor() {
        super();
        this.resize();
        on(window, "resize", () => this.resize());
    }

    resize() {
        const canvas = this.canvas;
        const {width, height} = this;
        const s = Math.ceil(canvas.clientWidth / width);
        canvas.width = width * s;
        canvas.height = height * s;
        this.gl.viewport(0, 0, canvas.width, canvas.height);
        this.set({s});
    }

    compute() {
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
