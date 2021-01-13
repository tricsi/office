import Object2D from "../core/Engine/Object2D";
import Context from "../core/Video/Context";
import Txt from "../core/Video/Txt";
import Config from "./Config";
import Scheduler from "../core/Engine/Scheduler";
import Tile from "./Tile";

export default class Score extends Object2D {

    scoreTxt = new Txt({ ...Config.tiny, c: "fff", ha: 1, va: 1, l: 3 });

    render(ctx: Context) {
        ctx.add(this.scoreTxt);
    }

    async score(tile: Tile, coin: number) {
        const { x, y } = tile.sprite.param;
        this.scoreTxt.text("$" + coin);
        this.scoreTxt.set({ x, y, a: 0 });
        await Scheduler.delay(0.2, a => this.scoreTxt.set({ a }));
        await Scheduler.delay(0.3);
        this.scoreTxt.set({ a: 0 });
    }

}
