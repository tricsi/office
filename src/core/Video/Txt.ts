import Sprite, { SpriteParam } from "./Sprite";

export interface TxtParam extends SpriteParam
{
    /** Horizontal align (0=top, 1=middle, 2=bottom) */
    ha?: number;
    /** Vertical align (0=left, 1=center, 2=right) */
    va?: number;
    /** Letter spacing */
    ls?: number;
    /** Line gap */
    lg?: number;
}

export default class Txt extends Sprite
{

    font: TxtParam;

    constructor(param: TxtParam, text: string = "")
    {
        super(param);
        const {n} = this.param;
        this.font = {ha: 0, va: 0, ls: 1, lg: 1, ...this.param, r: 0, s: 1, sx: 0, sy: 0, c: "ffff", p: this};
        this.text(text);
    }

    text(text: string = "")
    {
        const {children, font} = this;
        let x = 0,
            y = 0,
            index = 0,
            width = 0;
        let {w, h, ha, va, ls, lg} = font;
        w += ls;
        for (let i = 0; i < text.length; i++)
        {
            let f = text.charCodeAt(i);
            switch (f)
            {
                case 10:
                    y += h + lg;
                    x = font.x;
                    continue;
                case 33:
                    f = 39;
                    break;
                case 36:
                    f = 40;
                    break;
                case 44:
                    f = 36;
                    break;
                case 46:
                    f = 37;
                    break;
                case 63:
                    f = 38;
                    break;
                default:
                    if (f >= 48 && f <= 57)
                    {
                        f -= 48;
                    }
                    else if (f >= 97 && f <= 122)
                    {
                        f -= 87;
                    }
                    else if (f >= 65 && f <= 90)
                    {
                        f -= 55;
                    }
                    else
                    {
                        x += w;
                        continue;
                    }
            }
            children.length > index
                ? children[index].set({f, x, y})
                : new Sprite({...font, f, x, y});
            x += w;
            width = Math.max(x, width);
            index++;
        }
        this.set({n: "", px: Math.round(width * ha / 2), py: Math.round((y + h) * va / 2)});
        children.length = index;
    }

}
