
attribute vec2 aUv;
attribute vec2 aPos;
attribute vec4 aColor;

uniform mat3 uProj;

varying vec2 vUv;
varying vec4 vColor;

void main() {
    vUv = aUv;
    vColor = aColor;
    gl_Position = vec4(uProj * vec3(aPos, 1), 1);
}
