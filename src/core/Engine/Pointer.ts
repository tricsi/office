import { on } from "../utils";
import Camera from "../Video/Camera";
import Dispatcher from "./Dispatcher";
import { input } from "./Input";
import Vec from "../Math/Vec";

export const pointer: Vec = new Vec();

function update(e: MouseEvent, down?: boolean) {
    Camera.raycast(pointer.set(e.clientX, e.clientY));
    Dispatcher.emit({ name: "pointer", target: pointer });
    if (down !== undefined) {
        const target = "Mouse" + e.button;
        input[target] = down;
        Dispatcher.emit({ name: "input", target, data: input });
    }
}

const body = document.body;
on(body, "contextmenu", (e: MouseEvent) => e.preventDefault());
on(body, "mousedown", (e: MouseEvent) => update(e, true));
on(body, "mouseup", (e: MouseEvent) => update(e, false));
on(body, "mousemove", (e: MouseEvent) => update(e));
