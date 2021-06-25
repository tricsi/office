import Tile, {Tileset} from "./Tile";
import {rnd} from "../modules/utils";
import Object2D, {ObjectParam} from "../core/Object2D";
import {emit} from "../modules/events";

export default class Grid extends Object2D {

    tiles: Tile[] = [];
    front = new Object2D({p: this});
    back = new Object2D({p: this});

    constructor(param: ObjectParam, public width: number, public height: number) {
        super(param);
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                this.tiles.push(new Tile(x * 16 - 40, y * 16 - 40, 0, this.back, this.front));
            }
        }
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                this.tile(x, y)
                    .add(this.tile(x - 1, y))
                    .add(this.tile(x + 1, y))
                    .add(this.tile(x, y - 1))
                    .add(this.tile(x, y + 1));
            }
        }
    }

    load(data: number[]) {
        this.tiles.forEach((tile, i) => tile.type = data[i] || 0);
    }

    toJSON(): number[] {
        return this.tiles.map(t => t.type);
    }

    tile(x: number, y: number): Tile {
        if (x < 0 || x >= this.width || y < 0 || y > this.height) {
            return null;
        }
        return this.tiles[this.height * y + x] as Tile;
    }

    check(): number {
        return this.tiles.reduce((count, tile) => (tile.type > Tileset.EMPTY ? 0 : 1) + count, 0);
    }

    async setTile(src: Tile) {
        const type = src.type;
        const tile = this.tiles.filter((t: Tile) => t.isHover).pop() as Tile;
        if (!tile) {
            return;
        }
        if (tile.type !== Tileset.EMPTY) {
            if (type === Tileset.SELL || tile.isGold) {
                // clear
                await tile.clear();
                emit({name: "clear", target: tile});
                tile.type = Tileset.EMPTY;
                await this.move(tile);
            }
        } else if (type !== Tileset.SELL) {
            // place
            await src.moveTo(tile);
            tile.type = type;
            emit({name: "place", target: tile});
            if (!tile.isMovable) {
                await this.merge(tile);
            }
            await this.lock(tile);
            await this.move(tile);
        }
    }

    async move(tile: Tile) {
        const dudes = this.tiles.filter(t => t.isMovable && t !== tile);
        dudes.length && await Promise.all(dudes.map(t => t.move()));
    }

    async merge(tile: Tile) {
        let type = tile.type;
        let count = tile.count();
        while (count.filter(v => v > 2).length) {
            type = count.reduce((p, v, i) => !p && v > 2 ? i : p, 0);
            await tile.merge(type);
            emit({name: "merge", target: tile, data: count[type]});
            if (!tile.isWild) {
                tile.upgrade(type);
            }
            count = tile.count();
        }
        if (tile.isWild) {
            tile.upgrade(type);
        }
    }

    async lock(tile: Tile) {
        let pinatas = this.tiles.filter(t => t.isMovable && t.isLocked);
        if (pinatas.length) {
            emit({name: "lock", target: tile, data: pinatas});
            await Promise.all(pinatas.map(t => t.lock()));
            while (pinatas.length) {
                let i = pinatas.length > 1 ? rnd(pinatas.length - 1, 0, true) : 0;
                const pinata = pinatas.indexOf(tile) < 0 ? pinatas[i] : tile;
                await this.merge(pinata);
                pinatas = pinatas.filter(t => t.type && t !== pinata);
            }
        }
    }

}
