import Object2D from "../core/Engine/Object2D";
import Tile, { Tileset } from "./Tile";
import Tiles from "../core/Video/Tiles";
import Context from "../core/Video/Context";
import Sprite from "../core/Video/Sprite";
import dispatcher from "../core/Engine/Dispatcher";
import rnd from "../core/Math/Rnd";
import Config from "./Config";

export default class Grid extends Object2D
{

    group: Sprite = new Sprite();
    back: Tiles = new Tiles({...Config.tile, x: 8, y: 8, p: this.group}, {w: 6, h: 6, m: "az"});
    tiles: Tile[] = [];
    active: boolean = true;

    constructor(public width: number, public height: number)
    {
        super();
        for (let y = 0; y < this.height; y++)
        {
            for (let x = 0; x < this.width; x++)
            {
                this.tiles.push(new Tile(x * 16 - 40, y * 16 - 40, 0, this.group));
            }
        }
        for (let y = 0; y < this.height; y++)
        {
            for (let x = 0; x < this.width; x++)
            {
                this.tile(x, y)
                    .add(this.tile(x - 1, y))
                    .add(this.tile(x + 1, y))
                    .add(this.tile(x, y - 1))
                    .add(this.tile(x, y + 1));
            }
        }
    }

    load(data: number[])
    {
        this.tiles.forEach((tile, i) => tile.type = data[i] || 0);
    }

    toJSON(): number[]
    {
        return this.tiles.map(t => t.type);
    }

    render(ctx: Context)
    {
        ctx.add(this.group);
    }

    tile(x: number, y: number): Tile
    {
        if (x < 0 || x >= this.width || y < 0 || y > this.height)
        {
            return null;
        }
        return this.tiles[this.height * y + x] as Tile;
    }

    check(): number
    {
        return this.tiles.reduce((count, tile) => (tile.type > Tileset.EMPTY ? 0 : 1) + count, 0);
    }

    async setTile(src: Tile)
    {
        const type = src.type;
        const tile = this.tiles.filter((t: Tile) => t.over()).pop() as Tile;
        if (!tile || !this.active)
        {
            return;
        }
        this.active = false;
        if (tile.type !== Tileset.EMPTY)
        {
            if (type === Tileset.SELL || tile.isSafe)
            {
                // clear
                await tile.clear();
                dispatcher.emit({name: "clear", target: tile});
                tile.type = Tileset.EMPTY;
                await this.move(tile);
            }
        }
        else if (type !== Tileset.SELL)
        {
            // place
            await src.moveTo(tile);
            tile.type = type;
            dispatcher.emit({name: "place", target: tile});
            if (!tile.isMovable)
            {
                await this.merge(tile);
            }
            await this.lock(tile);
            await this.move(tile);
        }
        this.active = true;
    }

    async move(tile: Tile)
    {
        const dudes = this.tiles.filter(t => t.isMovable && t !== tile);
        dudes.length && await Promise.all(dudes.map(t => t.move()));
    }

    async merge(tile: Tile)
    {
        tile.layer = 2;
        let type = tile.type;
        let count = tile.count();
        while (count.filter(v => v > 2).length)
        {
            type = count.reduce((p, v, i) => !p && v > 2 ? i : p, 0);
            await tile.merge(type);
            dispatcher.emit({name: "merge", target: tile, data: count[type]});
            if (!tile.isWild)
            {
                tile.upgrade(type);
            }
            count = tile.count();
        }
        if (tile.isWild)
        {
            tile.upgrade(type);
        }
        tile.layer = 0;
    }

    async lock(tile: Tile)
    {
        let pinatas = this.tiles.filter(t => t.isMovable && t.isLocked);
        if (pinatas.length)
        {
            dispatcher.emit({name: "lock", target: tile, data: pinatas});
            await Promise.all(pinatas.map(t => t.lock()));
            while (pinatas.length)
            {
                let i = pinatas.length > 1 ? rnd(pinatas.length - 1, 0, true) : 0;
                const pinata = pinatas.indexOf(tile) < 0 ? pinatas[i] : tile;
                await this.merge(pinata);
                pinatas = pinatas.filter(t => t.type && t !== pinata);
            }
        }
    }

}
