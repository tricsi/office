import Camera from "../Video/Camera";
import {data} from "./Input";
import {emit, on} from "./Dispatcher";
import {Vector} from "../Math/Math2D";

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
