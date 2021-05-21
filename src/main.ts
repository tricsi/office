import "./core/Engine/Input";
import "./core/Engine/Pointer";
import vertShader from "./shader/tiny.vert";
import fragShader from "./shader/tiny.frag";
import texture from "./asset/texture.png";
import Context from "./core/Video/Context";
import Shader from "./core/Video/Shader";
import Camera from "./core/Video/Camera";
import { fs, mobile } from "./core/utils";
import LoadScene from "./game/LoadScene";
import state from "./game/State";
import { schedule, update } from "./core/Engine/Scheduler";
import { emit, on } from "./core/Engine/Dispatcher";

const gl = Camera.gl;
const ctx = new Context();
const shader = new Shader(gl, vertShader, fragShader);
const image = new Image();
const scenes = state.scenes;

schedule(() => {
    const {uv, pos, color, count} = ctx.add(...scenes).flush();
    gl.clear(gl.COLOR_BUFFER_BIT);
    shader.uni("uProj", Camera.mat)
        .attr("aUv", 2, uv.slice(0, count * 8))
        .attr("aPos", 2, pos.slice(0, count * 8))
        .attr("aColor", 4, color.slice(0, count * 16));
    gl.drawElements(gl.TRIANGLES, count * 6, gl.UNSIGNED_SHORT, 0);
}, 9);

on("load", () => {
    const doc = document;
    scenes[0] = new LoadScene();
    gl.enable(gl.BLEND);
    gl.clearColor(0, 0, 0, 1);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(shader.program);
    shader.buff("indices", ctx.idx)
        .txt("sprite", image);
    update();
    on("click", () => mobile && fs(), doc);
    //@ts-ignore
    doc.monetization && on(doc.monetization, "monetizationstart", () => emit({ name: "coil" }));
}, image);

image.src = texture;
