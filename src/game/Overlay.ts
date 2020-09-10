import Object2D from "../core/Engine/Object2D";
import Config from "./Config";
import Txt from "../core/Video/Txt";
import Context from "../core/Video/Context";
import Sprite from "../core/Video/Sprite";
import { Task } from "../core/Engine/Scheduler";
import Emitter from "../core/Video/Emitter";
import rnd from "../core/Math/Rnd";

export default class Overlay extends Object2D
{

    back = new Sprite({...Config.ptc, s: 24, f: 3, c: "000a", l: 4});
    txt1 = new Txt({...Config.font, y: -12, ha: 1, l: 4}, "You are");
    txt2 = new Txt({...Config.font, ha: 1, l: 4});
    color = ["f00", "0c0", "00f", "fc0", "0ff", "f0f"];
    emitter = new Emitter({...Config.ptc, y: 4, f: 1, l: 4}, {c: 40, a: 0.5, v: -100, y: 150, w: 90, h: 90, s: rnd(), t: 0.7, ou: (param, time, loop) => {
        let c = this.color;
        param.a = 1 - time ** 4;
        param.l = rnd(1, loop, true) + 4;
        param.r = rnd(3, loop) + time * 3;
        param.c = c[rnd(c.length -1, loop, true)];
    }});

    showAnim = new Task(async task => {
        const {back, txt1, txt2} = this;
        await task.wait(0.3, t => {
            back.set({a: t});
            txt1.set({a: t, s: t > 0.2 ? 3 - t * 2 : 0});
            txt2.set({a: t, s: t > 0.6 ? 5 - t * 4 : 0});
        });
        txt1.set({a: 1, s: 1});
        txt2.set({a: 1, s: 1});
    });

    hideAnim = new Task(async task => {
        await task.wait(0.3, t => {
            const a = 1 - t * t;
            this.back.set({a});
            this.txt1.set({a}, null);
            this.txt2.set({a}, null);
        });
    });

    constructor()
    {
        super();
        this.hide(false);
    }

    async show(text: string, emit: boolean)
    {
        if (emit) {
            this.emitter.start();
        }
        this.txt2.text(text + "!");
        await this.showAnim.start();
    }

    async hide(anim: boolean = true)
    {
        if (this.emitter.active)
        {
            this.emitter.stop();
        }
        if (anim)
        {
            await this.hideAnim.start();
        }
        this.back.set({a: 0});
        this.txt1.set({a: 0});
        this.txt2.set({a: 0});
    }

    emit(length?: number)
    {
        this.emitter.start(length);
    }

    render(ctx: Context)
    {
        ctx.add(this.back)
            .add(this.emitter.particles)
            .add(this.txt1)
            .add(this.txt2);
    }

    update(delta: number)
    {
        this.emitter.update(delta);
    }

}
