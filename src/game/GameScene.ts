import Grid from "./Grid";
import Hud, { HudData } from "./Hud";
import Tile, { Tileset } from "./Tile";
import { rnd } from "../modules/utils";
import Config from "./Config";
import Score from "./Score";
import Overlay from "./Overlay";
import Object2D from "../core/Object2D";
import { emit, IEvent, on } from "../modules/events";
import Tiles from "../core/Tiles";
import { store } from "./State";
import { play } from "../modules/audio";

export interface GameData {
    hud: HudData;
    grid: number[];
}

export default class GameScene extends Object2D {

    overlay = new Overlay({p: this});
    score = new Score({p: this});
    hud = new Hud({p: this});
    grid = new Grid({p: this}, 6, 6);
    back: Tiles = new Tiles({ ...Config.tile, x: 8, y: 8, p: this }, { w: 6, h: 6, m: "az" });
    active = true;
    ended = false;

    onInput = async (e: IEvent<string>) => {
        if (e.target === "Mouse0") {
            const { hud, grid } = this;
            if (this.ended) {
                this.overlay.hide();
                this.create();
            }
            else if (this.active) {
                this.active = false;
                if (hud.enabled && hud.shop.isHover) {
                    await hud.buy(this.roll(Config.shop));
                }
                else {
                    await grid.setTile(hud.tile);
                }
                if (!grid.check()) {
                    this.clear();
                    this.ended = true;
                    emit("fired");
                    this.overlay.show("fired", false);
                }
                else if (!hud.move) {
                    this.clear();
                    this.ended = true;
                    emit("promoted");
                    this.overlay.show("promoted", true);
                }
                else {
                    this.save();
                }
                this.active = true;
            }
        }
    };

    onPlace = () => {
        this.hud.type = this.roll();
        this.hud.show();
    };

    onMerge = (e: IEvent<Tile, number>) => {
        const tile = e.target;
        this.coin(tile, e.data);
        if (tile.type === Tileset.PINATA) {
            this.overlay.emit(0.4);
            play("pinata");
        }
        else {
            play("coin");
        }
    };

    onClear = (e: IEvent<Tile>) => {
        const tile = e.target;
        this.coin(tile);
        if (!tile.isGold) {
            this.hud.type = this.roll();
            this.hud.show();
        }
    };

    onALL = (e: IEvent) => {
        play(e.name);
    };

    constructor(data?: GameData) {
        super();
        on("down", this.onInput)
            ("place", this.onPlace)
            ("merge", this.onMerge)
            ("clear", this.onClear)
            ("all", this.onALL);
        if (data) {
            this.hud.load(data.hud);
            this.grid.load(data.grid);
        }
        else {
            this.create();
        }
    }

    create() {
        for (const tile of this.grid.tiles) {
            tile.type = this.roll(Config.init);
        }
        this.hud.load({ coin: 0, type: 1, move: 404, item: 12 });
        this.ended = false;
        this.save();
    }

    save() {
        const { hud, grid } = this;
        store.set({ hud, grid });
    }

    clear() {
        store.set();
    }

    coin(tile: Tile, count: number = 1) {
        const coin = Config.coin[tile.type] * count;
        if (coin) {
            this.score.score(tile, coin);
            this.hud.coin += coin;
        }
    }

    roll(odds = Config.odds): number {
        let roll = rnd(99);
        for (let i = odds.length - 1; i > 0; i--) {
            if (odds[i] && roll < odds[i]) {
                return i;
            }
            roll -= odds[i];
        }
        return 0;
    }

}
