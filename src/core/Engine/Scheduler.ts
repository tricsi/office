import { now } from "../utils";

export type Task = (delta: number) => void;

class Scheduler {

    max = 0.1;
    time = now();
    delta = 0;
    tasks: Task[] = [];

    add(callback: Task) {
        if (this.tasks.indexOf(callback) < 0) {
            this.tasks.push(callback);
        }
    }

    remove(callback: Task) {
        const index = this.tasks.indexOf(callback);
        if (index >= 0) {
            this.tasks.splice(index, 1);
        }
    }

    update() {
        const current = now();
        this.delta = Math.min(current - this.time, this.max);
        this.time = current;
        for (const task of this.tasks) {
            task(this.delta);
        }
    }

    delay(sec: number, update?: (t: number) => void, stop?: () => boolean): Promise<void> {
        return new Promise<void>((resolve) => {
            let time = sec;
            const callback = (delta: number) => {
                time -= delta;
                if (time <= 0 || (stop && stop())) {
                    this.remove(callback);
                    update && update(1);
                    resolve();
                } else {
                    update && update(1 - time / sec);
                }
            };
            this.add(callback);
            callback(0);
        });
    }

}

export default new Scheduler();
