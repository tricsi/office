import Object2D from "../core/Engine/Object2D";
import Txt from "../core/Video/Txt";
import Config from "./Config";
import Context from "../core/Video/Context";
import Tile from "./Tile";
import Sprite from "../core/Video/Sprite";
import dispatcher, { GameEvent } from "../core/Engine/Dispatcher";
import { InputState } from "../core/Engine/Input";
import { pointer } from "../core/Engine/Pointer";
import Player from "../core/Audio/Player";

export interface HudData
{
    move: number;
    coin: number;
    type: number;
    music: boolean;
}

export default class Hud extends Object2D
{

    protected _data: HudData = {coin: 0, type: 1, move: 404, music: true};
    tile = new Tile(-40, -56);
    moveLbl = new Txt({...Config.tiny, x: -30, y: -60, va: 1}, "Moves");
    moveTxt = new Txt({...Config.font, x: -30, y: -53, va: 1});
    coinLbl = new Txt({...Config.tiny, x: 48, y: -60, va: 1, ha: 2}, "Money");
    coinTxt = new Txt({...Config.font, x: 48, y: -53, va: 1, ha: 2});
    infoTxt = new Txt({...Config.tiny, y: 52, ha: 1}, "Merge 3 or more");
    twtIcon = new Sprite({...Config.icon, x: -40, y: 84, f: 2});
    sndIcon = new Sprite({...Config.icon, x: 40, y: 84});

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
        this.coinTxt.text("$" + value);
    }

    get music(): boolean
    {
        return this._data.music;
    }

    set music(value: boolean)
    {
        this._data.music = value;
        this.sndIcon.set({f: value ? 0 : 1});
        Player.mixer("master", value ? 1 : 0);
    }

    onInput = async (e: GameEvent<string, InputState>) => {
        if (e.target !== "Mouse0" || !e.data[e.target])
        {
            return;
        }
        if (this.sndIcon.box.has(pointer))
        {
            this.music = !this.music;
        }
        if (this.twtIcon.box.has(pointer))
        {
            const params = new URLSearchParams();
            params.set("text", "Wellcome to the office!");
            params.set("hashtags", "office404");
            params.set("url", location.href);
            window.open(`http://www.twitter.com/share?${params}`, '_blank');
        }
    };

    constructor()
    {
        super();
        this.load(this._data);
        dispatcher.on("input", this.onInput);
    }

    load(data: HudData)
    {
        this.type = data.type;
        this.coin = data.coin;
        this.move = data.move;
        this.music = data.music;
    }

    render(ctx: Context)
    {
        ctx.add(this.tile.sprite)
            .add(this.moveLbl)
            .add(this.moveTxt)
            .add(this.coinLbl)
            .add(this.coinTxt)
            .add(this.infoTxt)
            .add(this.twtIcon)
            .add(this.sndIcon);
    }

    toJSON(): HudData
    {
        return this._data;
    }

}
