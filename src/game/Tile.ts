import Sprite from "../core/Video/Sprite";
import { Task } from "../core/Engine/Scheduler";
import rnd from "../core/Math/Rnd";
import { pointer } from "../core/Engine/Pointer";
import Config from "./Config";

export enum Tileset
{
    EMPTY,
    BOX,
    DRAWER,
    SHELF,
    DESKTOP,
    SERVER,
    CLOUD,
    PLANT,
    DUDE,
    BOSS,
    PINATA,
    GOLD,
    SELL,
    WILD
}

export default class Tile
{

    protected _type: number;
    protected _count: number[] = new Array(14);
    protected _empty: boolean = true;
    protected _tiles: Tile[] = [];
    protected _sprite: Sprite;

    protected showAnim = new Task(async task => {
        await task.wait(0.2, t => this._sprite.set({s: t * t}));
        this._sprite.set({s: 1});
    });

    protected hideAnim = new Task(async task => {
        await task.wait(0.2, t => this._sprite.set({s: 1 - t * t}));
        this._sprite.set({s: 1});
    });

    protected moveAnim = new Task<Tile>(async task => {
        this._empty = true;
        const {x, y} = this._sprite.param;
        const to = task.data._sprite.param;
        await task.wait(0.3, t => {
            const tt = 1 - t * t;
            this._sprite.set({
                x: to.x - ((to.x - x) * tt),
                y: to.y - ((to.y - y) * tt),
                l: 1
            });
        });
        this._sprite.set({x, y, l: 0});
        if (this._empty)
        {
            this.type = Tileset.EMPTY;
        }
    });

    protected lockAnim = new Task(async task => {
        await task.wait(0.2, t => this._sprite.set({r: Math.PI * t, s: 1 - t}));
        this.type = 10;
        await task.wait(0.2, t => this._sprite.set({r: Math.PI * (t + 1), s: t}));
        this._sprite.set({r: 0, s: 1})
    });

    get type(): number
    {
        return this._type;
    }

    set type(value: number)
    {
        this._type = value;
        this._empty = !value;
        this._sprite.set({n: value ? "tile" : "", f: value});
    }

    set layer(l: number)
    {
        this._sprite.set({l});
    }

    get sprite(): Sprite
    {
        return this._sprite;
    }

    get isWild(): boolean
    {
        return this.type == Tileset.WILD;
    }

    get isSafe(): boolean
    {
        return this.type == Tileset.GOLD;
    }

    get isMovable(): boolean
    {
        return this.type == Tileset.DUDE || this.type == Tileset.BOSS;
    }

    get targets(): Tile[]
    {
        if (this.type === Tileset.DUDE)
        {
            return this._tiles.filter(t => t._empty);
        }
        let tiles: Tile[] = [];
        if (this.type === Tileset.BOSS)
        {
            this.traverse(t => t._empty ? tiles.push(t) > 0 : true);
        }
        return tiles;
    }

    get isLocked(): boolean
    {
        let locked = true;
        this.traverse(t => {
            if (!locked || !t.isMovable)
            {
                return false;
            }
            if (t.targets.length)
            {
                locked = false;
            }
            return locked;
        });
        return locked;
    }

    constructor(x = 0, y = 0, type = 0, p?: Sprite)
    {
        this._type = type;
        this._sprite = new Sprite({...Config.tile, n: "", x, y, f: type, p});
    }

    over(): boolean
    {
        return this._sprite.box.has(pointer);
    }

    add(tile: Tile): Tile
    {
        tile && this._tiles.push(tile);
        return this;
    }

    traverse(callback: (tile: Tile) => boolean, checked: Tile[] = [])
    {
        if (checked.includes(this))
        {
            return;
        }
        checked.push(this);
        if (callback(this))
        {
            for (const tile of this._tiles)
            {
                tile.traverse(callback, checked);
            }
        }
    }

    count(): number[]
    {
        const count = this._count.fill(0);
        if (this.isWild)
        {
            for (const tile of this._tiles)
            {
                if (!tile._empty && !tile.isMovable)
                {
                    this.traverse(t => (t.isWild || t.type === tile.type) && ++count[tile.type] > 0);
                }
            }
        }
        else
        {
            this.traverse(t => t.type === this.type && ++count[this.type] > 0);
        }
        return count;
    }

    upgrade(type: number = this.type)
    {
        if (type < Tileset.CLOUD)
        {
            this.type = type + 1;
        }
        else if (type < Tileset.GOLD)
        {
            this.type = Tileset.GOLD;
        }
        else if (type === Tileset.WILD)
        {
            this.type = Tileset.PLANT;
        }
    }

    async show()
    {
        await this.showAnim.start();
    }

    async move()
    {
        const tiles = this.targets;
        if (tiles.length)
        {
            const tile = tiles[tiles.length > 1 ? rnd(tiles.length - 1, 0, true) : 0];
            const type = this.type;
            tile._empty = false;
            await this.moveAnim.start(tile);
            tile.type = type;
        }
    }

    async moveTo(tile: Tile)
    {
        await this.moveAnim.start(tile);
    }

    async merge(type = this.type)
    {
        const tasks: Promise<void>[] = [];
        this.traverse(t => {
            if (t !== this && type !== t.type)
            {
                return false;
            }
            if (this !== t)
            {
                tasks.push(t.moveAnim.start(this));
            }
            return true;
        });
        tasks.length && await Promise.all(tasks);
    }

    async lock()
    {
        await this.lockAnim.start();
    }

    async clear()
    {
        await this.hideAnim.start();
    }
}
