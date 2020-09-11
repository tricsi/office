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
    num = new Txt({...Config.font, x: 34, y: -10, r: 0.3, c: "900", ha: 1});
    newTxt = new Txt({...Config.font, y: 0, ha: 1});
    loadTxt = new Txt({...Config.font, y: 12, ha: 1});
    settings = new Settings();
    introAnim = new Task(async task => {
        const text = "Office";
        await task.wait(0.5);
        await task.wait(1.5, t => this.logo.text(text.substr(0, Math.ceil(text.length * t))));
        this.num.text("404!");
        await task.wait(0.3, t => this.num.set({s: 3.7 - 2 * t * t, a: t * t}));
        await task.wait(0.5);
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

    get load(): boolean
    {
        return this.loadTxt.box.has(pointer)
    }

    get create(): boolean
    {
        return this.newTxt.box.has(pointer)
    }

    onInput = async (e: GameEvent<string, InputState>) => {
        const load = this.load;
        if (e.target === "Mouse0" && e.data[e.target] && (load || this.create))
        {
            dispatcher.off("input", this.onInput)
                .off("pointer", this.onPointer);
            const mid: SoundParam = ["sine", 0.2, [0.2, 0], 0];
            const solo: SoundParam = ["triangle", 0.3, [0.2, 0.1], 0];
            const bass: SoundParam = ["square", 0.2, [0.2, 0], 0];
            this.newTxt.text();
            this.loadTxt.text();
            await Player.init();
            await Player.sound("place", ["sine", 0.3, [1, 0.1, 0], 0], [110, 15, 0]);
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
            Player.mixer("master", this.settings.volume);
            dispatcher.on("volume", (e) => Player.mixer("master", e.data));
            state.scenes[1] = new GameScene(load ? this.data : null);
        }
    };

    onPointer = (e: GameEvent<Vec>) => {
        this.loadTxt.set({c: this.load ? "0ff" : "fff"});
        this.newTxt.set({c: this.create ? "0ff" : "fff"});
    };

    constructor()
    {
        super();
        this.data = GameScene.load();
        this.add(this.settings);
        this.introAnim.start();
    }

    render(ctx: Context)
    {
        super.render(ctx);
        ctx.add(this.logo)
            .add(this.num)
            .add(this.newTxt)
            .add(this.loadTxt);
    }

}
