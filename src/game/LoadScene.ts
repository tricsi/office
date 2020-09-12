import Txt from "../core/Video/Txt";
import Context from "../core/Video/Context";
import Player from "../core/Audio/Player";
import GameScene, { GameData } from "./GameScene";
import Config from "./Config";
import Object2D from "../core/Engine/Object2D";
import dispatcher, { GameEvent } from "../core/Engine/Dispatcher";
import { InputState } from "../core/Engine/Input";
import state from "./State";
import { Task } from "../core/Engine/Scheduler";
import { pointer } from "../core/Engine/Pointer";
import Vec from "../core/Math/Vec";
import Settings from "./Settings";
import { SoundParam } from "../core/Audio/Sound";

export default class LoadScene extends Object2D
{

    data: GameData;
    logo = new Txt({...Config.font, s: 2, c: "eee", va: 1, ha: 1});
    num = new Txt({...Config.font, y: -10, r: 0.3, c: "900", ha: 1});
    newTxt = new Txt({...Config.font, y: 0, ha: 1});
    loadTxt = new Txt({...Config.font, y: 12, ha: 1});
    clickTxt = new Txt({...Config.tiny, y: 12, ha: 1});
    settings = new Settings();

    introAnim = new Task(async task => {
        const text = "Office";
        await task.wait(0.5);
        await task.wait(1.5, t => this.logo.text(text.substr(0, Math.ceil(text.length * t))));
        this.num.text("404!");
        await task.wait(0.3, t => this.num.set({x: t * 34, s: 3.7 - 2 * t * t, a: t * t}));
        await task.wait(0.5);
        this.clickTxt.text("Click to start");
        dispatcher.on("input", this.onInit);
    });

    startAnim = new Task(async task => {
        this.clickTxt.text();
        await task.wait(0.5, t => {
            const tt = t ** 4;
            this.logo.set({y: -80 * tt});
            this.num.set({y: -80 * tt - 10});
        });
        this.newTxt.text("New game");
        if (this.data)
        {
            this.newTxt.set({y: -12});
            this.loadTxt.text("Continue");
        }
        await task.wait(0.3, t => {
            this.newTxt.set({a: t * t});
            this.loadTxt.set({a: t * t});
        });
        dispatcher
            .on("input", this.onInput)
            .on("pointer", this.onPointer);
        await this.settings.showAnim.start();
    });

    hideAnim = new Task(async task => {
        await task.wait(0.5, t => {
            const a = 1 - t * t;
            this.newTxt.set({a});
            this.loadTxt.set({a});
        });
    });

    get load(): boolean
    {
        return this.loadTxt.box.has(pointer)
    }

    get create(): boolean
    {
        return this.newTxt.box.has(pointer)
    }

    set sound(value: number)
    {
        Player.mixer("master", value > 0 ? 0.8 : 0);
        Player.mixer("music", value === 1 ? 0.2 : 0);
    }

    onInit = async (e: GameEvent<string, InputState>) => {
        if (e.target === "Mouse0" && e.data[e.target])
        {
            dispatcher.off("input", this.onInit);
            this.clickTxt.text("Loading...");
            const mid: SoundParam = ["sine", 0.2, [0.2, 0], 0];
            const solo: SoundParam = ["triangle", 0.3, [0.2, 0.1], 0];
            const cord: SoundParam = ["sawtooth", 0.3, [0.05, 0.07, 0.05], 0];
            const bass: SoundParam = ["square", 0.2, [0.2, 0], 0];
            const kick: SoundParam = ["sine", 0.3, [1, 0.1, 0], 0];
            const snare: SoundParam = ["sine", 0.2, 0, [1, 0]];
            await Player.init();
            await Player.sound("place", kick, [110, 15, 0]);
            await Player.sound("lock", ["triangle", 0.4, [0, 0.2], 0], [880, 220, 880]);
            await Player.music("clear", [[["square", 0.2, [0.2, 0], 0], "1a6,1c7,1e7", 0.05]]);
            await Player.music("coin", [[mid, "2a4,2a5", 0.05]]);
            await Player.music("buy", [[mid, "2a6,2e7,2a7", 0.05]]);
            await Player.sound("fired", ["triangle", 1, [0.3, 0], [0.2, 0]], [880, 110]);
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
            await this.startAnim.start();
        }
    };

    onInput = async (e: GameEvent<string, InputState>) => {
        const load = this.load;
        if (e.target === "Mouse0" && e.data[e.target] && (load || this.create))
        {
            this.hideAnim.start();
            dispatcher.off("input", this.onInput)
                .off("pointer", this.onPointer);
            Player.play("music", true, "music");
            dispatcher.on("sound", (e) => this.sound = e.data);
            state.scenes[1] = new GameScene(load ? this.data : null);
        }
    };

    onPointer = (e: GameEvent<Vec>) => {
        this.loadTxt.set({c: this.load ? "0ff" : "fff"});
        this.newTxt.set({c: this.create ? "0ff" : "fff"});
    };

    onCoil = (e: GameEvent) => {
        Config.price = Config.coil;
        this.logo.set({c: "c90"});
    };

    constructor()
    {
        super();
        this.data = GameScene.load();
        this.add(this.settings);
        this.introAnim.start();
        dispatcher.on("coil", this.onCoil);
    }

    render(ctx: Context)
    {
        super.render(ctx);
        ctx.add(this.logo)
            .add(this.num)
            .add(this.newTxt)
            .add(this.loadTxt)
            .add(this.clickTxt);
    }

}
