import Object2D, { ObjectParam } from "./Object2D";
import { Pool } from "./Pool";

export class Spawner extends Object2D {

    protected time = 0;
    protected pool: Pool<Object2D>;

    constructor(
        param: ObjectParam = {},
        protected factory: () => Object2D,
        protected init: (item: Object2D) => void,
        public frq: number = 0,
        public limit: number = 0
    ) {
        super(param);
        this.pool = new Pool<Object2D>(factory);
    }

    get(init?: (item: Object2D) => void): Object2D {
        let item = null;
        if (!this.limit || this.children.length < this.limit) {
            item = this.pool.get(init);
            this.children.push(item);
            item.param.p = this;
        }
        return item;
    }

    put(item: Object2D) {
        const index = this.children.indexOf(item);
        if (index >= 0) {
            this.children.splice(index, 1);
            item.param.p = null;
            this.pool.put(item);
        }
    }

    update = (delta: number) => {
        if (this.frq <= 0) {
            return;
        }
        this.time += delta;
        if (this.time > this.frq) {
            this.time -= this.frq;
            this.get(this.init);
        }
    }

}
