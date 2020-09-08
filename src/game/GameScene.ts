import Object2D from "../core/Engine/Object2D";
import dispatcher, { GameEvent } from "../core/Engine/Dispatcher";
import Grid from "./Grid";
import Player from "../core/Audio/Player";
import Hud from "./Hud";
import Tile, { Tileset } from "./Tile";
import rnd from "../core/Math/Rnd";
import { InputState } from "../core/Engine/Input";
import Config from "../config";

export default class GameScene extends Object2D
{

    hud: Hud = new Hud();
    grid: Grid = new Grid(6, 6);

    onInput = (e: GameEvent<string, InputState>) => {
        if (e.target === "Mouse0" && e.data[e.target])
        {
            this.grid.setTile(this.hud.tile);
        }
    };

    onShow = (e: GameEvent<Tile, number>) => {
        this.roll();
        this.hud.tile.show();
    };

    onMerge = (e: GameEvent<Tile, number>) => {
        this.score(e.target, e.data);
    };

    onClear = (e: GameEvent<Tile>) => {
        const tile = e.target;
        this.score(tile);
        if (!tile.isSafe)
        {
            this.roll();
            this.hud.tile.show();
        }
    };

    onALL = (e: GameEvent) => {
        Player.play(e.name);
    };

    constructor()
    {
        super();
        this
            .add(this.hud)
            .add(this.grid);
        dispatcher
            .on("input", this.onInput)
            .on("show", this.onShow)
            .on("merge", this.onMerge)
            .on("clear", this.onClear)
            .on("all", this.onALL);
    }

    score(tile: Tile, count: number = 1)
    {
        this.hud.coin += tile.type * count * 5;
    }

    roll()
    {
        const hud = this.hud;
        const odds = Config.odds;
        hud.move--;
        let roll = rnd(99, 0, true);
        for (let i = odds.length - 1; i > Tileset.BOX; i--)
        {
            if (roll < odds[i])
            {
                hud.type = i;
                return;
            }
            roll -= odds[i];
        }
        hud.type = Tileset.BOX;
    }

}
