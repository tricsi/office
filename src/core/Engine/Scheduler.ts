export function now()
{
    return new Date().getTime() / 1000;
}

class Scheduler
{

    tasks: Task[] = [];
    delta: number = 0;
    time: number = now();

    update()
    {
        const current = now();
        this.delta = Math.min(current - this.time, 0.1);
        this.time = current;
        for (const task of this.tasks)
        {
            task.update();
        }
    }

    add(task: Task)
    {
        if (this.tasks.indexOf(task) < 0)
        {
            this.tasks.push(task);
        }
    }

    remove(task: Task): boolean
    {
        const index = this.tasks.indexOf(task);
        if (index < 0)
        {
            return false;
        }
        this.tasks.splice(index, 1);
        return true;
    }

}

const scheduler = new Scheduler();

export class Task<T = any>
{

    data: T;

    protected _delay: number;
    protected _length: number;
    protected _update: (t: number) => void;
    protected _stopped: boolean = false;
    protected _promise: Promise<void> = null;
    protected _resolve: () => void = null;
    protected _child: Task = null;

    constructor(protected _factory: (task: Task<T>) => Promise<void>)
    {
    }

    async start(data?: T)
    {
        await this.stop();
        this.data = data;
        this._stopped = false;
        this._promise = this._factory(this);
        return this._promise;
    }

    async waitAll(tasks: Task[])
    {
        for (const task of tasks)
        {
            await this.waitTo(task);
        }
    }

    async waitTo(task: Task)
    {
        this._child = task;
        await task.start();
        if (this._stopped)
        {
            task.stop();
        }
        await task._promise;
    }

    wait(delay: number, update?: (t: number) => void): Promise<void>
    {
        if (this._stopped)
        {
            return null;
        }
        this._delay = delay;
        this._length = delay;
        this._update = update;
        scheduler.add(this);
        return new Promise((resolve: () => void) => {
            this._resolve = resolve;
        });
    }

    async stop()
    {
        this._stopped = true;
        if (this._child)
        {
            await this._child.stop();
        }
        this.resolve();
        await this._promise;
    }

    update()
    {
        if (this._resolve)
        {
            const length = this._length;
            this._delay -= scheduler.delta;
            if (this._delay <= 0)
            {
                this.resolve();
            }
            if (this._update && length)
            {
                this._update(1 - this._delay / length);
            }
        }
    }

    protected resolve()
    {
        if (this._resolve)
        {
            const resolve = this._resolve;
            this._update && this._update(1);
            this._resolve = null;
            this._update = null;
            this._length = 0;
            this._delay = 0;
            resolve();
        }
        scheduler.remove(this);
    }

}

export default scheduler;
