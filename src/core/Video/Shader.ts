export default class Shader {

    program: WebGLProgram;
    buffers: { [key: string]: WebGLBuffer } = {};
    textures: { [key: string]: WebGLTexture } = {};
    locations: { [key: string]: any } = {};

    constructor(
        public gl: WebGLRenderingContext,
        vertexShader: string,
        fragmentShader: string
    ) {
        const program = gl.createProgram();
        gl.attachShader(program, this.compile(gl.VERTEX_SHADER, vertexShader));
        gl.attachShader(program, this.compile(gl.FRAGMENT_SHADER, fragmentShader));
        gl.linkProgram(program);
        this.program = program;
    }

    protected compile(type: number, source: string): WebGLShader {
        const gl = this.gl;
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        return shader;
    }

    buff(id: string, data: Float32Array | Uint16Array): Shader {
        const gl = this.gl;
        const buffers = this.buffers;
        const type = data instanceof Float32Array ? gl.ARRAY_BUFFER : gl.ELEMENT_ARRAY_BUFFER;
        if (!(id in buffers)) {
            buffers[id] = gl.createBuffer();
        }
        gl.bindBuffer(type, buffers[id]);
        gl.bufferData(type, data, gl.STATIC_DRAW);
        return this;
    }

    txt(id: string, image?: HTMLImageElement, pixelate = true): Shader {
        const gl = this.gl;
        const textures = this.textures;
        if (image) {
            const texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, pixelate ? gl.NEAREST : gl.LINEAR);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            textures[id] = texture;
        } else if (id in textures) {
            gl.bindTexture(gl.TEXTURE_2D, textures[id]);
        }
        return this;
    }

    attr(name: string, size: number, data: Float32Array | Uint16Array): Shader {
        const gl = this.gl;
        const locations = this.locations;
        this.buff(name, data);
        if (!(name in locations)) {
            locations[name] = gl.getAttribLocation(this.program, name);
            gl.enableVertexAttribArray(locations[name]);
            gl.vertexAttribPointer(locations[name], size, gl.FLOAT, false, 0, 0);
        }
        return this;
    }

    uni(name: string, value: number | Float32Array, size?: number): Shader {
        const gl = this.gl;
        const locations = this.locations;
        if (!(name in locations)) {
            locations[name] = gl.getUniformLocation(this.program, name);
        }
        const location = locations[name];
        if (typeof value == 'number') {
            gl.uniform1f(location, value);
        } else {
            switch (size || value.length) {
                case 2: gl.uniform2fv(location, value); break;
                case 3: gl.uniform3fv(location, value); break;
                case 4: gl.uniform4fv(location, value); break;
                case 9: gl.uniformMatrix3fv(location, false, value); break;
                case 16: gl.uniformMatrix4fv(location, false, value); break;
            }
        }
        return this;
    }

}
