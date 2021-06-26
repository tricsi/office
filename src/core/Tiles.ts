import Object2D from "./Object2D";
import Sprite, {SpriteParam} from "./Sprite";

export interface TileProps {
    t: SpriteParam;
    w: number;
    h: number;
    m: string;
}

export default class Tiles extends Object2D {

    public data: number[];

    constructor(param: SpriteParam, public props: TileProps) {
        super(param);
        const {w, h, m} = props;
        const data = new Array(w * h).fill(-1);
        const flips = new Array(w * h).fill(0);
        let i = 0;
        let j = 0;
        while (i < m.length) {
            let tile = m.charAt(i++);
            let flip = "|-+".indexOf(tile) + 1;
            let count = 1;
            if (flip) {
                tile = m.charAt(i++);
            }
            if (tile.match(/[A-Z]/)) {
                tile = tile.toLowerCase();
            } else {
                count = parseInt(m.charAt(i++), 36) + 1;
            }
            if (tile !== "0") {
                data.fill(parseInt(tile, 36) - 10, j, j + count);
                flips.fill(flip, j, j + count);
            }
            j += count;
        }
        data.forEach((f, i) => {
            if (f < 0) {
                return;
            }
            const {w, h} = props.t;
            const x = props.w * w / 2;
            const y = props.h * h / 2;
            new Sprite({
                ...props.t,
                x: i % props.w * w + w / 2 - x,
                y: Math.floor(i / props.w) * h + h / 2 - y,
                px: w / 2,
                py: h / 2,
                sx: flips[i] & 1 ? -1 : 1,
                sy: flips[i] & 2 ? -1 : 1,
                p: this,
                f
            });
        });
    }

}
