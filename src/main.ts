import "./core/Engine/Input";
import "./core/Engine/Pointer"
import sheet from "./asset/texture.json";
import texture from "./asset/texture.png";
import vertShader from "./shader/tiny.vert";
import fragShader from "./shader/tiny.frag";
import Shader from "./core/Video/Shader";
import Camera from "./core/Video/Camera";
import {fs, mobile} from "./core/utils";
import LoadScene from "./game/LoadScene";
import state from "./game/State";
import {schedule, update} from "./core/Engine/Scheduler";
import {emit, on} from "./core/Engine/Dispatcher";
import {createCtx, flushLayers, getLayers} from "./core/Video/Context";

const gl = Camera.gl;
const ctx = createCtx();
const shader = new Shader(gl, vertShader, fragShader);
const image = new Image();
const scenes = state.scenes;

schedule(() => {
    getLayers(scenes);
    flushLayers(ctx, <any>sheet);
    gl.clear(gl.COLOR_BUFFER_BIT);
    shader.uni("uProj", Camera.mat)
        .attr("aUv", 2, ctx.uv)
        .attr("aPos", 2, ctx.pos)
        .attr("aColor", 4, ctx.color);
    gl.drawElements(gl.TRIANGLES, ctx.count * 6, gl.UNSIGNED_SHORT, 0);
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
    doc.monetization && on(doc.monetization, "monetizationstart", () => emit({name: "coil"}));
}, image);

image.src = texture;
