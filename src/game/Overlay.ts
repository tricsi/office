import Config from "./Config";
import Txt from "../core/Video/Txt";
import Sprite from "../core/Video/Sprite";
import Emitter from "../core/Video/Emitter";
import {rnd} from "../core/utils";
import Object2D, {ObjectParam} from "../core/Engine/Object2D";
import {delay, schedule} from "../core/Engine/Scheduler";

export default class Overlay extends Object2D {

    back = new Sprite({...Config.ptc, s: 24, f: 3, c: "000a", l: 4, p: this});
    txt1 = new Txt({...Config.font, y: -12, ha: 1, l: 4, p: this}, "You are");
    txt2 = new Txt({...Config.font, ha: 1, l: 4, p: this});
    color = ["f00", "0c0", "00f", "fc0", "0ff", "f0f"];
    emitter = new Emitter({...Config.ptc, y: 4, f: 1, l: 4, p: this}, {
        c: 40, a: 0.5, v: -100, y: 150, w: 90, h: 90, s: rnd(), t: 0.7, ou: (param, time, loop) => {
            let c = this.color;
            param.a = 1 - time ** 4;
            param.l = rnd(1, loop, true) + 4;
            param.r = rnd(3, loop) + time * 3;
            param.c = c[rnd(c.length - 1, loop, true)];
        }
    });

    constructor(param: ObjectParam) {
        super(param);
        this.hide(false);
        schedule(this.emitter.update);
    }

    async show(text: string, emit: boolean) {
        if (emit) {
            this.emitter.start();
        }
        this.txt2.text(text + "!");
        await delay(0.3, t => {
            this.back.set({a: t});
            this.txt1.set({a: t, s: t > 0.2 ? 3 - t * 2 : 0});
            this.txt2.set({a: t, s: t > 0.6 ? 5 - t * 4 : 0});
        });
    }

    async hide(anim = true) {
        if (this.emitter.active) {
            this.emitter.stop();
        }
        if (anim) {
            await delay(0.3, t => {
                const a = 1 - t * t;
                this.back.set({a});
                this.txt1.set({a});
                this.txt2.set({a});
            });
        }
        this.back.set({a: 0});
        this.txt1.set({a: 0});
        this.txt2.set({a: 0});
    }

    emit(length?: number) {
        this.emitter.start(length);
    }

}
