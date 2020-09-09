import Txt from "../core/Video/Txt";
import Context from "../core/Video/Context";
import Player from "../core/Audio/Player";
import GameScene from "./GameScene";
import Config from "./Config";
import Object2D from "../core/Engine/Object2D";
import dispatcher, { GameEvent } from "../core/Engine/Dispatcher";
import { InputState } from "../core/Engine/Input";
import state from "./State";

export default class LoadScene extends Object2D
{

    logo: Txt = new Txt({...Config.font, y: -88, s: 2, c: "fff", ha: 1}, "Office");
    num: Txt = new Txt({...Config.font, x: 34, y: -90, s: 1.7, r: 0.3, c:"900", ha: 1}, "404!");
    text: Txt = new Txt({...Config.tiny, ha: 1}, "Click to start!");

    onInput = async (e: GameEvent<string, InputState>) => {
        if (e.target === "Mouse0" && e.data[e.target])
        {
            dispatcher.off("input", this.onInput);
            this.text.text("Loading...");
            //document.fullscreenElement || await document.body.requestFullscreen();
            await Player.init();
            await Player.sound("show", ["sine", 0.3, [1, 0.1, 0], 0], [110, 15, 0]);
            await Player.sound("merge", ["sine", 0.2, 0, [0.7, 0.1, 0]], 2800);
            this.text.text();
            state.scenes[1] = new GameScene();
        }
    };

    constructor()
    {
        super();
        dispatcher.on("input", this.onInput);
    }

    render(ctx: Context)
    {
        ctx.add(this.logo)
            .add(this.num)
            .add(this.text);
    }

}
