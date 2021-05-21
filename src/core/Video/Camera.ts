import {$} from "../utils";
import Object2D from "../Engine/Object2D";
import {on} from "../Engine/Dispatcher";
import {
    mat3project,
    mat3rotate,
    mat3scale,
    mat3translate,
    vec2add,
    vec2rotate,
    vec2scale,
    vec2sub,
    Vector
} from "../Math/Math2D";

class Camera extends Object2D {

    canvas = $("#game") as HTMLCanvasElement;
    gl = this.canvas.getContext("webgl");
    width = this.canvas.width;
    height = this.canvas.height;
    scale = 1;

    constructor() {
        super();
        this.resize();
        on("resize", () => this.resize(), window);
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
        const {x, y, r, s} = this.param;
        const {width, height} = this.canvas;
        const mat = this.mat;
        mat3project(mat, width, height);
        mat3translate(mat, width / 2, height / 2);
        mat3scale(mat, this.scale);
        mat3translate(mat, -x, -y);
        mat3rotate(mat, -r)
        mat3scale(mat, s);
    }

    raycast(pos: Vector) {
        const {x, y, r, s} = this.param;
        const {clientWidth, clientHeight} = document.body;
        vec2sub(pos, {x: clientWidth / 2, y: clientHeight / 2})
        vec2scale(pos, 1 / this.scale);
        vec2add(pos, {x, y});
        vec2rotate(pos, r);
        vec2scale(pos, 1 / s);
    }

}

export default new Camera();
