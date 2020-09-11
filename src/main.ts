import "./core/Engine/Input";
import "./core/Engine/Pointer";
import vertShader from "./shader/tiny.vert";
import fragShader from "./shader/tiny.frag";
import texture from "./asset/texture.png";
import Context from "./core/Video/Context";
import Shader from "./core/Video/Shader";
import scheduler from "./core/Engine/Scheduler";
import Camera from "./core/Video/Camera";
import { fs, on } from "./core/utils";
import LoadScene from "./game/LoadScene";
import state from "./game/State";

const gl = Camera.gl;
const ctx = new Context();
const shader = new Shader(gl, vertShader, fragShader);
const image = new Image();
const scenes = state.scenes;

function update()
{
    requestAnimationFrame(update);
    scheduler.update();
    scenes.forEach(s => s.update(scheduler.delta));
    scenes.forEach(s => s.render(ctx));
    ctx.flush();
    gl.clear(gl.COLOR_BUFFER_BIT);
    shader.uniform("uProj", Camera.mat.data)
        .attrib("aUv", 2, ctx.uv)
        .attrib("aPos", 2, ctx.pos)
        .attrib("aColor", 4, ctx.color);
    gl.drawElements(gl.TRIANGLES, ctx.count * 6, gl.UNSIGNED_SHORT, 0);
}

on(image, "load", () => {
    scenes[0] = new LoadScene();
    gl.enable(gl.BLEND);
    gl.clearColor(0, 0, 0, 0);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(shader.program);
    shader.buffer("indices", ctx.idx)
        .texture("sprite", image);
    update();
    on(document, "click", fs);
});

image.src = texture;
