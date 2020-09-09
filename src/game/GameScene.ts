import Object2D from "../core/Engine/Object2D";
import dispatcher, { GameEvent } from "../core/Engine/Dispatcher";
import Grid from "./Grid";
import Player from "../core/Audio/Player";
import Hud from "./Hud";
import Tile from "./Tile";
import rnd from "../core/Math/Rnd";
import { InputState } from "../core/Engine/Input";
import Config from "./Config";
import Score from "./Score";

export default class GameScene extends Object2D
{

    hud = new Hud();
    grid = new Grid(6, 6);
    score = new Score();
    store = "office_404";
    params = new URLSearchParams(location.search);

    get seed(): number
    {
        return parseInt(this.params.get("seed"));
    }

    set seed(value: number)
    {
        rnd.SEED = value;
        this.params.set("seed", value.toString());
        window.history.replaceState({}, '', `${location.pathname}?${this.params}`);
    }

    onInput = async (e: GameEvent<string, InputState>) => {
        const seed = this.seed;
        const {hud, grid, store} = this;
        if (grid.active && e.target === "Mouse0" && e.data[e.target])
        {
            await grid.setTile(hud.tile);
            localStorage.setItem(store, JSON.stringify({hud, grid, seed}));
        }
    };

    onShow = (e: GameEvent<Tile, number>) => {
        this.hud.type = this.roll();
        this.hud.tile.show();
    };

    onMerge = (e: GameEvent<Tile, number>) => {
        this.coin(e.target, e.data);
    };

    onClear = (e: GameEvent<Tile>) => {
        const tile = e.target;
        this.coin(tile);
        if (!tile.isSafe)
        {
            this.hud.type = this.roll();
            this.hud.tile.show();
        }
    };

    onALL = (e: GameEvent) => {
        Player.play(e.name);
    };

    constructor()
    {
        super();
        this.add(this.hud)
            .add(this.grid)
            .add(this.score);
        dispatcher
            .on("input", this.onInput)
            .on("show", this.onShow)
            .on("merge", this.onMerge)
            .on("clear", this.onClear)
            .on("all", this.onALL);
//        this.load();
        this.create(this.seed);
    }

    create(seed?: number)
    {
        this.seed = seed || Math.floor(Math.random() * 10000);
        for (const tile of this.grid.tiles)
        {
            tile.type = this.roll(Config.init);
        }
        this.hud.load({
            coin: 0,
            move: 404,
            type: this.roll(),
            music: true
        });
    }

    load()
    {
        try
        {
            const data = JSON.parse(localStorage.getItem(this.store));
            this.seed = data.seed;
            this.hud.load(data.hud);
            this.grid.load(data.grid);
        }
        catch (e)
        {
        }
    }

    coin(tile: Tile, count: number = 1)
    {
        const coin = Config.coin[tile.type] * count;
        this.score.score(tile, coin);
        this.hud.coin += coin;
    }

    roll(odds = Config.odds): number
    {
        let roll = rnd(99);
        for (let i = odds.length - 1; i > 0; i--)
        {
            if (odds[i] && roll < odds[i])
            {
                return i;
            }
            roll -= odds[i];
        }
        return 0;
    }

}
