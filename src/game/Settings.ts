import Sprite from "../core/Sprite";
import Config from "./Config";
import { emit, IEvent, on } from "../modules/events";
import { pointer } from "../modules/pointer";
import Object2D, { ObjectParam } from "../core/Object2D";
import { delay } from "../modules/scheduler";
import { box2vec2 } from "../modules/math";

export default class Settings extends Object2D {

    sound = 1;
    twtIcon = new Sprite({ ...Config.icon, x: -40, y: 84, f: 3, a: 0, p: this });
    sndIcon = new Sprite({ ...Config.icon, x: 40, y: 84, f: 1, a: 0, p: this });

    constructor(param: ObjectParam) {
        super(param);
        on("down", this.onInput);
    }

    onInput = async (e: IEvent<string>) => {
        if (e.target !== "Mouse0") {
            return;
        }
        if (box2vec2(this.sndIcon.box, pointer)) {
            if (++this.sound > 2) {
                this.sound = 0;
            }
            this.sndIcon.set({ f: this.sound });
            emit("sound", this.sound);
        }
        if (box2vec2(this.twtIcon.box, pointer)) {
            const params = new URLSearchParams();
            params.set("url", location.href);
            params.set("text", "Check out OFFICE 404!");
            params.set("hashtags", "js13k,office404");
            window.open(`http://www.twitter.com/share?${params}`, '_blank');
        }
    };

    async show() {
        await delay(0.5, t => {
            const a = t * t;
            this.twtIcon.set({ a });
            this.sndIcon.set({ a });
        });
    }

}
