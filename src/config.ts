import { TxtParam } from "./core/Video/Txt";
import { SpriteParam } from "./core/Video/Sprite";

export default class Config {
    static readonly font: TxtParam = {n: "font", w: 6, h: 8};
    static readonly tile: SpriteParam = {n: "tile", w: 16, h: 16, px: 8, py: 8};
    static readonly odds: number[] = [0, 0, 20, 10, 2, 0, 0, 2, 10, 2, 0, 0, 2, 2];
}
