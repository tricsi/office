import { emit, on } from "./events";

export type InputData = { [code: string]: number };
export const data: InputData = {};

function update(e: KeyboardEvent, down: number): boolean {
    const target = e.code;
    if (data[target] !== down) {
        data[target] = down;
        const name = down ? "down" : "up";
        emit(name, target, data);
    }
    return false;
}

const doc = document
on("keydown", (e: KeyboardEvent) => update(e, 1), doc)
    ("keyup", (e: KeyboardEvent) => update(e, 0), doc);
