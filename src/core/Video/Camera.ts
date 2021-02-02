import Vec from "../Math/Vec";
import { $, on } from "../utils";
import Object2D from "../Engine/Object2D";

class Camera extends Object2D {

    canvas = $("#game") as HTMLCanvasElement;
    gl = this.canvas.getContext("webgl");
    width = this.canvas.width;
    height = this.canvas.height;
    scale = 1;

    constructor() {
        super();
        this.resize();
        on(window, "resize", () => this.resize());
    }

    resize() {
        const canvas = this.canvas;
        const {width, height} = this;
        const scale = Math.ceil(canvas.clientWidth / width);
        canvas.width = width * scale;
        canvas.height = height * scale;
        this.gl.viewport(0, 0, canvas.width, canvas.height);
        this.scale = scale;
        this.compute();
    }

    compute() {
        const { x, y, r, s } = this.param;
        const { width, height } = this.canvas;
        this.mat.project(width, height)
            .translate(width / 2, height / 2)
            .scale(this.scale)
            .translate(-x, -y)
            .rotate(-r)
            .scale(s);
    }

    raycast(pos: Vec) {
        const { x, y, r, s } = this.param;
        const {clientWidth, clientHeight} = document.body;
        pos.sub(clientWidth / 2, clientHeight / 2)
            .scale(1 / this.scale)
            .add(x, y)
            .rotate(r)
            .scale(1 / s);
    }

}

export default new Camera();
