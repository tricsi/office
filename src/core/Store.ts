export default class Store {

    constructor(protected prefix: string, protected store = localStorage) {
    }

    protected key(sufix: string): string {
        return this.prefix + sufix;
    }

    set(data?: any, key = "") {
        data !== undefined
            ? this.store.setItem(this.key(key), JSON.stringify(data))
            : this.store.removeItem(this.key(key));
    }

    get(key = "") {
        try {
            return JSON.parse(this.store.getItem(this.key(key)));
        } catch (e) {
        }
        return null;
    }

}
