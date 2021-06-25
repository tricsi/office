import Camera from "../core/Camera";
import {data} from "./input";
import {emit, on} from "./events";
import {Vector} from "./math";

export const pointer: Vector = {x: Number.POSITIVE_INFINITY, y: Number.POSITIVE_INFINITY};

function update(e: MouseEvent, down?: number) {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    Camera.raycast(pointer);
    emit({name: "pointer", target: pointer});
    if (down !== undefined) {
        const name = down ? "down" : "up";
        const target = "Mouse" + e.button;
        data[target] = down;
        emit({name, target, data});
    }
}

const body = document.body;
on("contextmenu", (e: MouseEvent) => e.preventDefault(), body)
("mousedown", (e: MouseEvent) => update(e, 1), body)
("mousemove", (e: MouseEvent) => update(e), body)
("mouseup", (e: MouseEvent) => update(e, 0), body);
