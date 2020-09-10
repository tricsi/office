import Object2D from "../core/Engine/Object2D";
import Context from "../core/Video/Context";
import Txt from "../core/Video/Txt";
import Config from "./Config";
import { Task } from "../core/Engine/Scheduler";
import Tile from "./Tile";

export default class Score extends Object2D
{

    scoreTxt = new Txt({...Config.tiny, c: "fff", ha: 1, va: 1, l: 3});
    scoreAnim = new Task<Tile>(async (task: Task<Tile>) => {
        const {x, y} = task.data.sprite.param;
        this.scoreTxt.set({x, y, a: 0});
        await task.wait(0.2, a => this.scoreTxt.set({a}));
        await task.wait(0.3);
        this.scoreTxt.set({a: 0});
    });

    render(ctx: Context)
    {
        ctx.add(this.scoreTxt);
    }

    score(tile: Tile, coin: number)
    {
        this.scoreTxt.text("$" + coin);
        this.scoreAnim.start(tile);
    }

}
