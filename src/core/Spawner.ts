import Pool from "./Pool";

export default class Spawner<T> extends Pool<T> {

    protected time = 0;
    protected count = 0;

    constructor(
        protected factory: () => T,
        protected init: (item: T) => void,
        public frq: number = 0,
        public limit: number = 0
    ) {
        super(factory)
    }

    get(init?: (item: T) => void): T {
        let item = null;
        if (!this.limit || this.count < this.limit) {
            item = this.get(init);
            this.count++;
        }
        return item;
    }

    put(item: T) {
        if (this.count > 0) {
            super.put(item);
            this.count--;
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
