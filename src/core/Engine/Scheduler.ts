import { now } from "../utils";

export type Task = (delta: number) => void;

const tasks: Task[] = [];
let time = now();
let delta = 0;

export function schedule(callback: Task) {
    if (tasks.indexOf(callback) < 0) {
        tasks.push(callback);
    }
}

export function unschedule(callback: Task) {
    const index = tasks.indexOf(callback);
    if (index >= 0) {
        tasks.splice(index, 1);
    }
}

export function update() {
    requestAnimationFrame(update);
    const current = now();
    delta = Math.min(current - time, 0.1);
    time = current;
    for (const task of tasks) {
        task(delta);
    }
}

export function delay(sec: number, tween?: (t: number) => void, stop?: () => boolean): Promise<void> {
    return new Promise<void>((resolve) => {
        let time = sec;
        const callback = (delta: number) => {
            time -= delta;
            if (time <= 0 || (stop && stop())) {
                unschedule(callback);
                tween && tween(1);
                resolve();
            } else {
                tween && tween(1 - time / sec);
            }
        };
        schedule(callback);
        callback(0);
    });
}
