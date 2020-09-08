precision lowp float;

uniform sampler2D uImage;

varying vec2 vUv;
varying vec4 vColor;

void main() {
	gl_FragColor = texture2D(uImage, vUv) * vColor;
    gl_FragColor.rgb *= gl_FragColor.a;
}
