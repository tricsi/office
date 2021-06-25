import "./modules/input";
import "./modules/pointer";
import sheet from "./asset/texture.json";
import texture from "./asset/texture.png";
import vertShader from "./shader/tiny.vert";
import fragShader from "./shader/tiny.frag";
import Camera from "./core/Camera";
import LoadScene from "./game/LoadScene";
import state from "./game/State";
import { emit, on } from "./modules/events";
import { fs, mobile } from "./modules/utils";
import { createCtx, flush } from "./modules/render";
import { schedule, update } from "./modules/scheduler";
import { bindBuffer, compileShader, createProgram, createTexture, setAttribute, setUniform } from "./modules/webgl";

const gl = Camera.gl;
const ctx = createCtx();
const program = createProgram(gl, compileShader(gl, gl.VERTEX_SHADER, vertShader), compileShader(gl, gl.FRAGMENT_SHADER, fragShader));
const image = new Image();
const scenes = state.scenes;

schedule(() => {
    flush(ctx, <any>sheet, scenes);
    gl.clear(gl.COLOR_BUFFER_BIT);
    setUniform(gl, program, "uProj", Camera.mat);
    bindBuffer(gl, "aUv", ctx.uv);
    setAttribute(gl, program, "aUv", 2);
    bindBuffer(gl, "aPos", ctx.pos);
    setAttribute(gl, program, "aPos", 2);
    bindBuffer(gl, "aColor", ctx.color);
    setAttribute(gl, program, "aColor", 4);
    gl.drawElements(gl.TRIANGLES, ctx.count * 6, gl.UNSIGNED_SHORT, 0);
}, 9);

on("load", () => {
    const doc = document;
    scenes[0] = new LoadScene();
    gl.enable(gl.BLEND);
    gl.clearColor(0, 0, 0, 1);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(program);
    bindBuffer(gl, "idx", ctx.idx, gl.ELEMENT_ARRAY_BUFFER);
    gl.bindTexture(gl.TEXTURE_2D, createTexture(gl, image));
    update();
    on("click", () => mobile && fs(), doc);
    //@ts-ignore
    doc.monetization && on(doc.monetization, "monetizationstart", () => emit("coil"));
}, image);

image.src = texture;
