import Context from "../Video/Context";

export default class Object2D {

    parent: Object2D;
    children: Object2D[] = [];

    add(child: Object2D): Object2D {
        this.children.push(child);
        child.parent = this;
        return this;
    }

    remove(child: Object2D) {
        const index = this.children.indexOf(child);
        if (index >= 0) {
            this.children.splice(index, 1);
            child.parent = null;
        }
    }

    each(callback: (item: Object2D, index?: number) => void) {
        for (let i = this.children.length - 1; i >= 0; i--) {
            callback(this.children[i], i);
        }
    }

    update(delta: number) {
        this.each(child => child.update(delta));
    }

    render(ctx: Context) {
        this.each(child => child.render(ctx));
    }

}
