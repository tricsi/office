import { ObjectPool, ObjectInit, ObjectFactory } from "./ObjectPool";
import Object2D from "./Object2D";

export class ObjectSpawner extends ObjectPool {

    time: number = 0;

    constructor(
        protected factory: ObjectFactory,
        protected init: ObjectInit,
        public frq: number = 0,
        public limit: number = 0
    ) {
        super(factory);
    }

    create(init: ObjectInit = null): Object2D {
        return !this.limit || this.children.length < this.limit ? super.create(init) : null;
    }

    update(delta: number) {
        super.update(delta);
        if (this.frq <= 0) {
            return;
        }
        this.time += delta;
        if (this.time > this.frq) {
            this.time -= this.frq;
            this.create(this.init);
        }
    }

}
