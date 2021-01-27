import Txt from "../core/Video/Txt";
import Config from "./Config";
import Tile from "./Tile";
import Trans from "../core/Video/Trans";
import { delay } from "../core/Engine/Scheduler";

export default class Score extends Trans {

    scoreTxt = new Txt({ ...Config.tiny, c: "fff", ha: 1, va: 1, l: 3, p: this });

    async score(tile: Tile, coin: number) {
        const { x, y } = tile.sprite.param;
        this.scoreTxt.text("$" + coin);
        this.scoreTxt.set({ x, y, a: 0 });
        await delay(0.2, a => this.scoreTxt.set({ a }));
        await delay(0.3);
        this.scoreTxt.set({ a: 0 });
    }

}
