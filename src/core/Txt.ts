import Sprite, { SpriteParam } from "./Sprite";

export interface TxtParam extends SpriteParam {
    /** Horizontal align (0=top, 1=middle, 2=bottom) */
    ha?: number;
    /** Vertical align (0=left, 1=center, 2=right) */
    va?: number;
    /** Letter spacing */
    ls?: number;
    /** Line gap */
    lg?: number;
}

export default class Txt extends Sprite {

    static idx = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ,.?!$";

    font: TxtParam;

    constructor(param: TxtParam, text?: string) {
        super(param);
        this.font = { ha: 0, va: 0, ls: 1, lg: 1, ...this.param, r: 0, s: 1, sx: 0, sy: 0, c: "ffff", p: this };
        this.text(text);
    }

    text(text = "") {
        const { children, font } = this;
        const { w, h, ha, va, ls, lg } = font;
        let y = 0,
            index = 0,
            width = 0;
        for (const line of text.split("\n")) {
            let x = 0;
            for (let j = 0; j < line.length; j++) {
                const f = Txt.idx.indexOf(line.charAt(j).toUpperCase());
                if (f >= 0) {
                    children.length > index
                        ? children[index].set({ f, x, y })
                        : new Sprite({ ...font, f, x, y });
                    index++;
                }
                x += w + ls;
            }
            y += h + lg;
            width = Math.max(x, width);
        }
        this.set({ n: "", px: Math.round(width * ha / 2), py: Math.round((y - lg) * va / 2) });
        children.length = index;
    }

}
