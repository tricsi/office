import typescript from "@rollup/plugin-typescript";
import image from "@rollup/plugin-image";
import glsl from "rollup-plugin-glsl";
import bundle from "rollup-plugin-html-bundle";
import { terser } from "rollup-plugin-terser";

const isDev = process.env.npm_lifecycle_event !== "build";

export default {
    input: "src/main.ts",
    output: {
        dir: "build",
        format: "iife",
        sourcemap: isDev
    },
    plugins: [
        typescript({
            noEmitOnError: false
        }),
        image(),
        glsl({
            include: /\.(frag|vert)$/
        }),
        terser({
            ecma: 9,
            module: true,
            toplevel: true,
            compress: isDev ? false : {
                keep_fargs: false,
                passes: 5,
                pure_funcs: ['assert', 'debug'],
                pure_getters: true,
                unsafe: true,
                unsafe_arrows: true,
                unsafe_comps: true,
                unsafe_math: true,
                unsafe_methods: true,
            },
            mangle: !isDev
        }),
        bundle({
            template: "src/index.html",
            target: "build/dev.html",
            inline: !isDev
        })
    ]
};
