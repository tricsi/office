import Object2D from "../core/Engine/Object2D";
import Txt from "../core/Video/Txt";
import Config from "../config";
import Context from "../core/Video/Context";
import Tile from "./Tile";

export default class Hud extends Object2D
{

    protected _move: number;
    protected _coin: number;
    tile: Tile = new Tile(-40, -56);
    moveTxt: Txt = new Txt({...Config.font, x: -30, y: -56, ls: 2, va: 1});
    coinTxt: Txt = new Txt({...Config.font, x: 48, y: -56, ls: 2, va: 1, ha: 2});

    get type(): number
    {
        return this.tile.type;
    }

    set type(value: number)
    {
        this.tile.type = value;
    }

    get move(): number
    {
        return this._move;
    }

    set move(value: number)
    {
        this._move = value;
        this.moveTxt.text(value.toString());
    }

    get coin(): number
    {
        return this._coin;
    }

    set coin(value: number)
    {
        this._coin = value;
        this.coinTxt.text("$" + value);
    }

    constructor()
    {
        super();
        this.coin = 0;
        this.type = 1;
        this.move = 404;
    }

    render(ctx: Context)
    {
        ctx.add(this.tile.sprite)
            .add(this.moveTxt)
            .add(this.coinTxt);
    }

}
