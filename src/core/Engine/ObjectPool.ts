import Object2D from "./Object2D";

export type ObjectFactory = () => Object2D;
export type ObjectInit = (item: Object2D) => void;

export class ObjectPool extends Object2D {

    private pool: Object2D[] = [];

    constructor(protected factory: ObjectFactory) {
        super();
    }

    create(init?: ObjectInit): Object2D {
        let item = this.pool.pop();
        if (!item) {
            item = this.factory();
        }
        this.add(item);
        if (init) {
            init(item);
        }
        return item;
    }

    remove(item: Object2D) {
        super.remove(item);
        this.pool.push(item);
    }

    clear() {
        while (this.children.length) {
            this.remove(this.children[0]);
        }
    }

}
