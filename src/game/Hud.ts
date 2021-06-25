import Txt from "../core/Txt";
import Config from "./Config";
import Tile, {Tileset} from "./Tile";
import Object2D, {ObjectParam} from "../core/Object2D";
import {delay} from "../modules/scheduler";
import {emit} from "../modules/events";

export interface HudData {
    move: number;
    coin: number;
    type: number;
    item: number;
}

export default class Hud extends Object2D {

    protected _data: HudData = {coin: 0, type: 1, move: 404, item: 12};
    tile = new Tile(-40, -58, 0, this);
    shop = new Tile(0, 70, 0, this);
    moveLbl = new Txt({...Config.tiny, x: -30, y: -62, va: 1, p: this}, "Days");
    moveTxt = new Txt({...Config.font, x: -30, y: -55, va: 1, p: this});
    coinLbl = new Txt({...Config.tiny, x: 48, y: -62, va: 1, ha: 2, p: this}, "Money");
    coinTxt = new Txt({...Config.font, x: 48, y: -55, va: 1, ha: 2, p: this});
    infoTxt = new Txt({...Config.tiny, y: 52, ha: 1, p: this}, "Click on empty tiles");
    priceTxt = new Txt({...Config.font, y: 84, va: 1, ha: 1, p: this}, "$9999");
    infoIdx = 0;
    infos = [
        "Merge 3 objects",
        "Merge more",
        "Buy better stuff",
        "Subscribers have discount!",
        "Collect the gold bars",
        "Pinata party is cool",
    ];

    get type(): number {
        return this._data.type;
    }

    set type(value: number) {
        this._data.type = value;
        this.tile.type = value;
        this.move--;
    }

    get move(): number {
        return this._data.move;
    }

    set move(value: number) {
        this._data.move = value;
        this.moveTxt.text(value.toString());
    }

    get coin(): number {
        return this._data.coin;
    }

    set coin(value: number) {
        this._data.coin = value;
        this.enabled = this.enabled;
        this.coinTxt.text("$" + value);
    }

    get price(): number {
        return Config.price[this.item];
    }

    get item(): number {
        return this._data.item;
    }

    set item(value: number) {
        this._data.item = value;
        this.shop.type = value;
        this.enabled = this.enabled;
        this.priceTxt.text(value ? "$" + this.price : "Free");
    }

    get enabled(): boolean {
        return this.price <= this.coin;
    }

    set enabled(value: boolean) {
        const a = value ? 1 : 0.5;
        this.shop.sprite.set({a});
        this.priceTxt.set({a});
    }

    constructor(param: ObjectParam) {
        super(param);
        this.load(this._data);
    }

    load(data: HudData) {
        this.type = data.type;
        this.coin = data.coin;
        this.move = data.move;
        this.item = data.item;
    }

    async buy(next: number) {
        const price = this.price;
        const type = this.shop.type;
        emit("buy", this.shop, price);
        await this.shop.moveTo(this.tile);
        this.item = next;
        this.coin -= price;
        this.type = type;
        this.move++;
        await this.shop.show();
        this.help();
    }

    async info(text: string) {
        await delay(0.2, t => this.infoTxt.set({a: 1 - t * t}));
        this.infoTxt.text(text);
        await delay(0.3, t => this.infoTxt.set({a: t * t}));
    }

    show() {
        this.tile.show();
        this.help();
    }

    help() {
        switch (this.type) {
            case Tileset.PLANT:
                this.info("Hmm... a plant?");
                break;
            case Tileset.DUDE:
                this.info("Hey dude!");
                break;
            case Tileset.BOSS:
                this.info("Bosses are annoying!");
                break;
            case Tileset.SELL:
                this.info("You can sell something!");
                break;
            case Tileset.WILD:
                this.info("Diamond merge all stuff!");
                break;
            default:
                this.info(this.infos[this.infoIdx]);
                if (++this.infoIdx >= this.infos.length) {
                    this.infoIdx = 0;
                }
                break;
        }
    }

    toJSON(): HudData {
        return this._data;
    }

}
