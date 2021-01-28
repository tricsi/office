import { on } from "../utils";
import Camera from "../Video/Camera";
import { input } from "./Input";
import Vec from "../Math/Vec";
import { emit } from "./Dispatcher";

export const pointer: Vec = new Vec();

function update(e: MouseEvent, down?: boolean) {
    Camera.raycast(pointer.set(e.clientX, e.clientY));
    emit({ name: "pointer", target: pointer });
    if (down !== undefined) {
        const target = "Mouse" + e.button;
        input[target] = down;
        emit({ name: "input", target, data: input });
    }
}

const body = document.body;
on(body, "contextmenu", (e: MouseEvent) => e.preventDefault())
    (body, "mousedown", (e: MouseEvent) => update(e, true))
    (body, "mouseup", (e: MouseEvent) => update(e, false))
    (body, "mousemove", (e: MouseEvent) => update(e));
