import Txt from "../core/Video/Txt";
import Context from "../core/Video/Context";
import Player from "../core/Audio/Player";
import GameScene, { GameData } from "./GameScene";
import Config from "./Config";
import Object2D from "../core/Engine/Object2D";
import Dispatcher, { GameEvent } from "../core/Engine/Dispatcher";
import { InputState } from "../core/Engine/Input";
import state from "./State";
import Scheduler from "../core/Engine/Scheduler";
import { pointer } from "../core/Engine/Pointer";
import Vec from "../core/Math/Vec";
import Settings from "./Settings";
import { WAVE_BASS, WAVE_CHIPTUNE, WAVE_ORGAN, SoundParam, WAVE_SINE, WAVE_TRIANGLE, WAVE_SQUARE } from "../core/Audio/Sound";

export default class LoadScene extends Object2D {

    data: GameData;
    logo = new Txt({ ...Config.font, s: 2, c: "eee", va: 1, ha: 1 });
    num = new Txt({ ...Config.font, y: -10, r: 0.3, c: "900", ha: 1 });
    newTxt = new Txt({ ...Config.font, y: 0, ha: 1 });
    loadTxt = new Txt({ ...Config.font, y: 12, ha: 1 });
    clickTxt = new Txt({ ...Config.tiny, y: 12, ha: 1 });
    settings = new Settings();
    clicked = false;

    get load(): boolean {
        return this.loadTxt.box.has(pointer)
    }

    get create(): boolean {
        return this.newTxt.box.has(pointer)
    }

    set sound(value: number) {
        Player.mixer("master", value > 0 ? 0.8 : 0);
        Player.mixer("music", value === 1 ? 0.2 : 0);
    }

    constructor() {
        super();
        this.data = GameScene.load();
        this.add(this.settings);
        this.intro();
        Dispatcher.on("coil", this.onCoil)
            .on("input", this.onInit);
    }

    onInit = async (e: GameEvent<string, InputState>) => {
        if (e.target === "Mouse0" && e.data[e.target]) {
            Dispatcher.off("input", this.onInit);
            this.clicked = true;
            this.clickTxt.text("Loading...");
            const mid: SoundParam = [WAVE_SINE, 0.2, [0.2, 0], 0];
            const solo: SoundParam = [WAVE_CHIPTUNE, 0.3, [0.5, 0.2], 0];
            const cord: SoundParam = [WAVE_ORGAN, 0.3, [0.1, 0.2, 0.1], 0];
            const bass: SoundParam = [WAVE_BASS, 0.2, [0.3, 0], 0];
            const kick: SoundParam = [WAVE_SINE, 0.3, [1, 0.1, 0], 0];
            const snare: SoundParam = [WAVE_SINE, 0.2, 0, [1, 0]];
            await Player.init();
            await Player.sound("place", kick, [110, 15, 0]);
            await Player.sound("lock", [WAVE_TRIANGLE, 0.4, [0, 0.2], 0], [880, 220, 880]);
            await Player.music("clear", [[[WAVE_SQUARE, 0.2, [0.2, 0], 0], "1a6,1c7,1e7", 0.05]]);
            await Player.music("coin", [[mid, "2a4,2a5", 0.05]]);
            await Player.music("buy", [[mid, "2a6,2e7,2a7", 0.05]]);
            await Player.sound("fired", [WAVE_TRIANGLE, 1, [0.3, 0], [0.2, 0]], [880, 110]);
            await Player.music("promoted", [
                [mid, "1f5a5c6,3f5a5c6,1f5a5c6,3g5b5d6,4a5c6e6", 0.1],
                [solo, "1f6,3f6,1f6,3g6,4a6", 0.1],
                [bass, "4f3,1f3,3g3,4a3", 0.1]
            ]);
            await Player.music("pinata", [
                [mid, "2g4b4d5,1g4b4d5,1g4b4d5,4c5e5g5", 0.1],
                [solo, "2g6,1g6,1g6,4c7", 0.1],
                [bass, "2g2,1g2,1g2,4c3", 0.1]
            ]);
            await Player.music("music", [
                [solo, "8|8|1a5,1,1a5,1,2d6,1e6,2f6,7,2e6,2,2e6,2c6,4g5,4,8f6,4e6,20,1a5,1,1a5,1,2d6,1e6,2f6,7,2e6,2,2e6,2c6,4g5,4,8d6,4c6,20|2", 0.125],
                [cord, "8a4d5f5,8a4c5e5,8g4c5e5,8g4b4d5|10", 0.125],
                [bass, "1a2,1a2,3f3,1d2,2,1a2,1a2,3e3,1c2,2,1g2,1g2,3e3,1c2,2,1g2,1g2,3d3,1b2,2|8", 0.125],
                [kick, "1a3,7,1a3,1,1a3,5|20", 0.125],
                [snare, "8|8|4,1a7,3|24", 0.125],
            ]);
            this.sound = this.settings.sound;
            await this.start();
        }
    };

    onInput = async (e: GameEvent<string, InputState>) => {
        const load = this.load;
        if (e.target === "Mouse0" && e.data[e.target] && (load || this.create)) {
            this.hide();
            Dispatcher.off("input", this.onInput)
                .off("pointer", this.onPointer);
            Player.play("music", true, "music");
            Dispatcher.on("sound", (e) => this.sound = e.data);
            state.scenes[1] = new GameScene(load ? this.data : null);
        }
    };

    onPointer = (e: GameEvent<Vec>) => {
        this.loadTxt.set({ c: this.load ? "0ff" : "fff" });
        this.newTxt.set({ c: this.create ? "0ff" : "fff" });
    };

    onCoil = (e: GameEvent) => {
        Config.price = Config.coil;
        this.logo.set({ c: "c90" });
    };

    async intro() {
        const text = "Office";
        const stop = () => this.clicked;
        await Scheduler.delay(0.5, undefined, stop);
        await Scheduler.delay(1.5, t => this.logo.text(text.substr(0, Math.ceil(text.length * t))), stop);
        this.num.text("404!");
        await Scheduler.delay(0.3, t => this.num.set({ x: t * 34, s: 3.7 - 2 * t * t, a: t * t }), stop);
        await Scheduler.delay(0.5, undefined, stop);
        !this.clicked && this.clickTxt.text("Click to start");
    }

    async start() {
        this.clickTxt.text();
        await Scheduler.delay(0.5, t => {
            const tt = t ** 4;
            this.logo.set({ y: -80 * tt });
            this.num.set({ y: -80 * tt - 10 });
        });
        this.newTxt.text("New game");
        if (this.data) {
            this.newTxt.set({ y: -12 });
            this.loadTxt.text("Continue");
        }
        await Scheduler.delay(0.3, t => {
            this.newTxt.set({ a: t * t });
            this.loadTxt.set({ a: t * t });
        });
        Dispatcher
            .on("input", this.onInput)
            .on("pointer", this.onPointer);
        await this.settings.show();
    }

    async hide() {
        await Scheduler.delay(0.5, t => {
            const a = 1 - t * t;
            this.newTxt.set({ a });
            this.loadTxt.set({ a });
        });
    }

    render(ctx: Context) {
        super.render(ctx);
        ctx.add(this.logo, this.num, this.newTxt, this.loadTxt, this.clickTxt);
    }

}
