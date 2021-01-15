import Sprite from "../core/Video/Sprite";
import Config from "./Config";
import Object2D from "../core/Engine/Object2D";
import Dispatcher, { GameEvent } from "../core/Engine/Dispatcher";
import { InputState } from "../core/Engine/Input";
import { pointer } from "../core/Engine/Pointer";
import Context from "../core/Video/Context";
import Scheduler from "../core/Engine/Scheduler";

export default class Settings extends Object2D {

    sound = 1;
    twtIcon = new Sprite({ ...Config.icon, x: -40, y: 84, f: 3, a: 0 });
    sndIcon = new Sprite({ ...Config.icon, x: 40, y: 84, f: 1, a: 0 });

    constructor() {
        super();
        Dispatcher.on("input", this.onInput);
    }

    onInput = async (e: GameEvent<string, InputState>) => {
        if (e.target !== "Mouse0" || !e.data[e.target]) {
            return;
        }
        if (this.sndIcon.box.has(pointer)) {
            if (++this.sound > 2) {
                this.sound = 0;
            }
            this.sndIcon.set({ f: this.sound });
            Dispatcher.emit({ name: "sound", data: this.sound });
        }
        if (this.twtIcon.box.has(pointer)) {
            const params = new URLSearchParams();
            params.set("url", location.href);
            params.set("text", "Check out OFFICE 404!");
            params.set("hashtags", "js13k,office404");
            window.open(`http://www.twitter.com/share?${params}`, '_blank');
        }
    };

    render(ctx: Context) {
        ctx.add(this.twtIcon, this.sndIcon);
    }

    async show() {
        await Scheduler.delay(0.5, t => {
            const a = t * t;
            this.twtIcon.set({ a });
            this.sndIcon.set({ a });
        });
    }

}
