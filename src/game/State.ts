import Object2D from "../core/Object2D";
import Store from "../core/Store";

export interface State {
    scenes: Object2D[];
}

const state: State = {
    scenes: [],
};

export default state;

export const store = new Store("office_404");
