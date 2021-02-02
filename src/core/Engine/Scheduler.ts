import { now } from "../utils";

export type Task = (delta: number) => void;

let tasks = new Map<Task,number>();
let time = now();
let delta = 0;

export function schedule(callback: Task, priority = 0) {
    tasks.has(callback) || (tasks = new Map<Task,number>([...tasks.set(callback, priority).entries()].sort((a, b) => a[1] - b[1])));
}

export function unschedule(callback: Task) {
    tasks.delete(callback);
}

export function update() {
    requestAnimationFrame(update);
    const current = now();
    delta = Math.min(current - time, 0.1);
    time = current;
    for (const [task] of tasks) {
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
