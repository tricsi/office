export type TaskFunc = (delta: number) => void;
export type TaskData = [TaskFunc, number];

export interface SchedulerData {
    time?: number;
    scale?: number;
}

const defaultData: SchedulerData = {
    time: 0,
    scale: 1,
};

const defaultTasks: TaskData[] = [];

export function update(data: SchedulerData = defaultData, tasks = defaultTasks) {
    const current = Date.now() / 1000;
    const delta = Math.min((current - data.time) * data.scale, 0.1);
    data.time = current;
    for (const [task] of tasks) {
        task(delta);
    }
    requestAnimationFrame(() => update(data, tasks));
}

export function schedule(callback: TaskFunc, priority = 0, tasks = defaultTasks) {
    tasks.push([callback, priority]);
    tasks.sort((a, b) => a[1] - b[1]);
}

export function unschedule(callback: TaskFunc, tasks = defaultTasks) {
    for (let i = tasks.length - 1; i >= 0; i--) {
        if (tasks[i][0] === callback) {
            tasks.splice(i, 1);
        }
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

export default defaultData;
