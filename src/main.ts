import "./core/Engine/Input";
import "./core/Engine/Pointer";
import vertShader from "./shader/tiny.vert";
import fragShader from "./shader/tiny.frag";
import texture from "./asset/texture.png";
import Context from "./core/Video/Context";
import Shader from "./core/Video/Shader";
import Scheduler from "./core/Engine/Scheduler";
import Camera from "./core/Video/Camera";
import { fs, on, mobile } from "./core/utils";
import LoadScene from "./game/LoadScene";
import state from "./game/State";
import Dispatcher from "./core/Engine/Dispatcher";

const gl = Camera.gl;
const ctx = new Context();
const shader = new Shader(gl, vertShader, fragShader);
const image = new Image();
const scenes = state.scenes;

function update() {
    requestAnimationFrame(update);
    Scheduler.update();
    scenes.forEach(s => s.update(Scheduler.delta));
    scenes.forEach(s => s.render(ctx));
    ctx.flush();
    gl.clear(gl.COLOR_BUFFER_BIT);
    const {uv, pos, color, count} = ctx;
    shader.uni("uProj", Camera.mat.data)
        .attr("aUv", 2, uv.slice(0, count * 8))
        .attr("aPos", 2, pos.slice(0, count * 8))
        .attr("aColor", 4, color.slice(0, count * 16));
    gl.drawElements(gl.TRIANGLES, count * 6, gl.UNSIGNED_SHORT, 0);
}

on(image, "load", () => {
    const doc = document;
    scenes[0] = new LoadScene();
    gl.enable(gl.BLEND);
    gl.clearColor(0, 0, 0, 1);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(shader.program);
    shader.buff("indices", ctx.idx)
        .txt("sprite", image);
    update();
    on(doc, "click", () => mobile() && fs());
    //@ts-ignore
    doc.monetization && on(doc.monetization, "monetizationstart", () => Dispatcher.emit({ name: "coil" }));
});

image.src = texture;
