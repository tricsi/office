import Sprite, {SpriteParam} from "./Sprite";
import {rnd} from "../utils";
import Object2D from "../Engine/Object2D";
import {vec2create, vec2rotate, Vector} from "../Math/Math2D";

export interface EmitterProps {
    /** Gravity X */
    x?: number;
    /** Gravity Y */
    y?: number;
    /** Emitter width */
    w?: number;
    /** Emitter height */
    h?: number;
    /** Velocity */
    v?: number;
    /** Rotate */
    r?: number;
    /** Angle */
    a?: number;
    /** Count */
    c?: number;
    /** Random seed (0 = no random) */
    s?: number;
    /** Kill time */
    t?: number;
    /** On finished event */
    of?: (emitter: Emitter) => void;
    /** On update event */
    ou?: (param: SpriteParam, time: number, loop: number) => void;
}

export default class Emitter extends Object2D {

    protected static pos: Vector = vec2create();

    param: SpriteParam;
    props: EmitterProps;
    time = 0;
    loop = false;
    length = 0;
    active = false;
    finished = true;
    particles: Sprite[] = [];

    constructor(
        param: SpriteParam,
        props?: EmitterProps
    ) {
        super(param);
        this.props = {x: 0, y: 0, v: 0, r: 0, a: 0, c: 1, s: 0, t: 1, ...props};
        for (let i = 0; i < this.props.c; i++) {
            this.particles.push(new Sprite(param));
        }
    }

    start(length = -1, delay = 0, seed = this.props.s) {
        this.time = -delay;
        this.loop = length < 0;
        this.length = length + this.props.t;
        this.props.s = seed;
        this.active = true;
        this.finished = false;
    }

    stop(delay = 0) {
        this.length = this.time + this.props.t + delay;
        this.active = false;
        this.loop = false;
    }

    update = (delta: number) => {
        if (!this.loop && this.time > this.length) {
            if (this.finished) {
                return;
            }
            this.finished = true;
            this.props.of && this.props.of(this);
            return;
        }
        const props = this.props;
        const pos = Emitter.pos;
        const {v, c, w, h, s, t, ou} = props;
        let {a, r} = props;
        a = Math.abs(a);
        rnd.SEED = s;
        this.time += delta;
        this.active = this.loop || this.time < this.length - t;
        this.particles.forEach((sprite, i) => {
            const shift = s ? rnd(t) : t;
            const time = (shift + this.time) % t;
            const loop = Math.floor((this.time + t - time) / t);
            const diff = Math.min(delta, time);
            const prev = time - diff;
            let {x, y} = this.param;
            x += w ? rnd(w, loop) - w / 2 : 0;
            y += h ? rnd(h, loop) - h / 2 : 0;
            const param: SpriteParam = time > delta ? sprite.param : {...this.param, x, y};
            pos.x = 0;
            pos.y = v * diff;
            vec2rotate(pos, r - (s ? rnd(a, loop) : a / c * i) + (a / 2));
            pos.x += (props.x * time * time) - (props.x * prev * prev) + param.x;
            pos.y += (props.y * time * time) - (props.y * prev * prev) + param.y;
            const values: SpriteParam = {...param, ...pos};
            ou && ou(values, time / t, loop);
            if (this.time < 0 || this.time < time || (!this.loop && this.length < t * loop + t - shift)) {
                values.a = 0;
            }
            sprite.set(values, null);
        });
    }

}
