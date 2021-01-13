import Object2D from "../core/Engine/Object2D";
import dispatcher, { GameEvent } from "../core/Engine/Dispatcher";
import Grid from "./Grid";
import Player from "../core/Audio/Player";
import Hud, { HudData } from "./Hud";
import Tile, { Tileset } from "./Tile";
import { rnd } from "../core/utils";
import { InputState } from "../core/Engine/Input";
import Config from "./Config";
import Score from "./Score";
import Overlay from "./Overlay";

export interface GameData {
    hud: HudData;
    grid: number[];
}

export default class GameScene extends Object2D {

    static store = "office_404";
    static load(): GameData {
        try {
            return JSON.parse(localStorage.getItem(GameScene.store));
        }
        catch (e) {
        }
        return null;
    }

    hud = new Hud();
    grid = new Grid(6, 6);
    score = new Score();
    overlay = new Overlay();
    active = true;
    ended = false;

    onInput = async (e: GameEvent<string, InputState>) => {
        if (e.target === "Mouse0" && e.data[e.target]) {
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
                    dispatcher.emit({ name: "fired" });
                    this.overlay.show("fired", false);
                }
                else if (!hud.move) {
                    this.clear();
                    this.ended = true;
                    dispatcher.emit({ name: "promoted" });
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

    onMerge = (e: GameEvent<Tile, number>) => {
        const tile = e.target;
        this.coin(tile, e.data);
        if (tile.type === Tileset.PINATA) {
            this.overlay.emit(0.4);
            Player.play("pinata");
        }
        else {
            Player.play("coin");
        }
    };

    onClear = (e: GameEvent<Tile>) => {
        const tile = e.target;
        this.coin(tile);
        if (!tile.isGold) {
            this.hud.type = this.roll();
            this.hud.show();
        }
    };

    onALL = (e: GameEvent) => {
        Player.play(e.name);
    };

    constructor(data?: GameData) {
        super();
        this.add(this.hud)
            .add(this.grid)
            .add(this.score)
            .add(this.overlay);
        dispatcher
            .on("input", this.onInput)
            .on("place", this.onPlace)
            .on("merge", this.onMerge)
            .on("clear", this.onClear)
            .on("all", this.onALL);
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
        localStorage.setItem(GameScene.store, JSON.stringify({ hud, grid }));
    }

    clear() {
        localStorage.removeItem(GameScene.store);
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
