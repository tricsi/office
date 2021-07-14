import Txt from "../core/Txt";
import Config from "./Config";
import Tile from "./Tile";
import Object2D from "../core/Object2D";
import { delay } from "../modules/scheduler";

export default class Score extends Object2D {

    scoreTxt = new Txt({ ...Config.tiny, c: "fff", ha: 1, va: 1, p: this });

    async score(tile: Tile, coin: number) {
        const { x, y } = tile.sprite.param;
        this.scoreTxt.text("$" + coin);
        this.scoreTxt.set({ x, y, a: 0 });
        await delay(0.2, a => this.scoreTxt.set({ a }));
        await delay(0.3);
        this.scoreTxt.set({ a: 0 });
    }

}
