import { on } from "../utils";
import Dispatcher from "./Dispatcher";

export type InputState = { [code: string]: boolean };
export const input: InputState = {};

function update(e: KeyboardEvent, down: boolean): boolean {
    const target = e.code;
    if (input[target] !== down) {
        input[target] = down;
        Dispatcher.emit({ name: "input", target, data: input });
    }
    return false;
}

on(document, "keydown", (e: KeyboardEvent) => update(e, true));
on(document, "keyup", (e: KeyboardEvent) => update(e, false));
