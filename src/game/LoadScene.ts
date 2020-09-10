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

    logo: Txt = new Txt({...Config.font, y: -88, s: 2, c: "eee", ha: 1}, "Office");
    num: Txt = new Txt({...Config.font, x: 34, y: -90, s: 1.7, r: 0.3, c:"900", ha: 1}, "404!");
    text: Txt = new Txt({...Config.tiny, ha: 1}, "Click to start!");

    onInput = async (e: GameEvent<string, InputState>) => {
        if (e.target === "Mouse0" && e.data[e.target])
        {
            dispatcher.off("input", this.onInput);
            this.text.text("Loading...");
            //document.fullscreenElement || await document.body.requestFullscreen();
            await Player.init();
            await Player.sound("place", ["sine", 0.3, [1, 0.1, 0], 0], [110, 15, 0]);
            await Player.sound("lock", ["triangle", 0.4, [0, 0.2], 0], [880, 220, 880]);
            await Player.music("clear", [[["square", 0.2, [0.2, 0], 0], "1a6,1c7,1e7", 0.05]]);
            await Player.music("coin", [[["sine", 0.2, [0.2, 0], 0], "2a4,2a5", 0.05]]);
            await Player.music("pinata", [
                [["sine", 0.2, [0.2, 0], 0], "2g4b4d5,1g4b4d5,1g4b4d5,4c5e5g5", 0.1],
                [["triangle", 0.3, [0.2, 0.1], 0], "2g6,1g6,1g6,4c7", 0.1],
                [["square", 0.2, [0.2, 0], 0], "2g2,1g2,1g2,4c3", 0.1]
            ]);
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
