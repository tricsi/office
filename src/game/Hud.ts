import Object2D from "../core/Engine/Object2D";
import Txt from "../core/Video/Txt";
import Config from "./Config";
import Context from "../core/Video/Context";
import Tile, { Tileset } from "./Tile";
import { Task } from "../core/Engine/Scheduler";
import dispatcher from "../core/Engine/Dispatcher";

export interface HudData
{
    move: number;
    coin: number;
    type: number;
    item: number;
}

export default class Hud extends Object2D
{

    protected _data: HudData = {coin: 0, type: 1, move: 404, item: 12};
    tile = new Tile(-40, -58);
    shop = new Tile(0, 70);
    moveLbl = new Txt({...Config.tiny, x: -30, y: -62, va: 1}, "Days");
    moveTxt = new Txt({...Config.font, x: -30, y: -55, va: 1});
    coinLbl = new Txt({...Config.tiny, x: 48, y: -62, va: 1, ha: 2}, "Money");
    coinTxt = new Txt({...Config.font, x: 48, y: -55, va: 1, ha: 2});
    infoTxt = new Txt({...Config.tiny, y: 52, ha: 1}, "Click on empty tiles");
    priceTxt = new Txt({...Config.font, y: 84, va: 1, ha: 1}, "$9999");
    infoAnim = new Task<string>(async task => {
        await task.wait(0.2, t => this.infoTxt.set({a: 1 - t * t}));
        this.infoTxt.text(task.data);
        await task.wait(0.3, t => this.infoTxt.set({a: t * t}));
    });
    infoIdx = 0;
    info = [
        "Merge 3 objects",
        "Merge more",
        "Buy better stuff",
        "Subscribers have discount!",
        "Collect the gold bars",
        "Pinata party is cool",
    ];

    get type(): number
    {
        return this._data.type;
    }

    set type(value: number)
    {
        this._data.type = value;
        this.tile.type = value;
        this.move--;
    }

    get move(): number
    {
        return this._data.move;
    }

    set move(value: number)
    {
        this._data.move = value;
        this.moveTxt.text(value.toString());
    }

    get coin(): number
    {
        return this._data.coin;
    }

    set coin(value: number)
    {
        this._data.coin = value;
        this.enabled = this.enabled;
        this.coinTxt.text("$" + value);
    }

    get price(): number
    {
        return Config.price[this.item];
    }

    get item(): number
    {
        return this._data.item;
    }

    set item(value: number)
    {
        this._data.item = value;
        this.shop.type = value;
        this.enabled = this.enabled;
        this.priceTxt.text(value ? "$" + this.price : "Free");
    }

    get enabled(): boolean
    {
        return this.price <= this.coin;
    }

    set enabled(value: boolean)
    {
        const a = value ? 1 : 0.5;
        this.shop.sprite.set({a});
        this.priceTxt.set({a});
    }

    constructor()
    {
        super();
        this.load(this._data);
    }

    load(data: HudData)
    {
        this.type = data.type;
        this.coin = data.coin;
        this.move = data.move;
        this.item = data.item;
    }

    async buy(next: number)
    {
        const price = this.price;
        const type = this.shop.type;
        dispatcher.emit({name: "buy", target: this.shop, data: price});
        await this.shop.moveTo(this.tile);
        this.item = next;
        this.coin -= price;
        this.type = type;
        this.move++;
        await this.shop.show();
        this.help();
    }

    show()
    {
        this.tile.show();
        this.help();
    }

    help()
    {
        switch (this.type)
        {
            case Tileset.PLANT:
                this.infoAnim.start("Hmm... a plant?");
                break;
            case Tileset.DUDE:
                this.infoAnim.start("Hey dude!");
                break;
            case Tileset.BOSS:
                this.infoAnim.start("Bosses are annoying!");
                break;
            case Tileset.SELL:
                this.infoAnim.start("You can sell something!");
                break;
            case Tileset.WILD:
                this.infoAnim.start("Diamond merge all stuff!");
                break;
            default:
                this.infoAnim.start(this.info[this.infoIdx]);
                if (++this.infoIdx >= this.info.length)
                {
                    this.infoIdx = 0;
                }
                break;
        }
    }

    render(ctx: Context)
    {
        ctx.add(this.tile.sprite)
            .add(this.shop.sprite)
            .add(this.moveLbl)
            .add(this.moveTxt)
            .add(this.coinLbl)
            .add(this.coinTxt)
            .add(this.infoTxt)
            .add(this.priceTxt);
    }

    toJSON(): HudData
    {
        return this._data;
    }

}
