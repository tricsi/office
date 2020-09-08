import Object2D from "../core/Engine/Object2D";

export interface State {
    scenes: Object2D[];
}

const state: State = {
    scenes: [],
};

export default state;
