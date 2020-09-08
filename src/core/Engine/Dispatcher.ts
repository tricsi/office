export interface GameEvent<T = any, D = any>
{
    /** Event name */
    name: string;
    /** Evvent target */
    target?: T;
    /** Event data */
    data?: D;
}

export type Listener = (event?: GameEvent) => void;

export class Dispatcher
{

    listeners: { [event: string]: Listener[] } = {all: []};

    parse(event: string)
    {
        return event.replace(/[^-_\w]+/, " ").trim().split(" ").filter(v => !!v);
    }

    on(event: string, listener: Listener): Dispatcher
    {
        for (const name of this.parse(event))
        {
            if (!(name in this.listeners))
            {
                this.listeners[name] = [];
            }
            this.listeners[name].push(listener);
        }
        return this;
    }

    off(event: string, listener: Listener): Dispatcher
    {
        for (const name of this.parse(event))
        {
            if (name in this.listeners)
            {
                const index = this.listeners[name].indexOf(listener);
                index >= 0 && this.listeners[name].splice(index, 1);
            }
        }
        return this;
    }

    emit(event: GameEvent)
    {
        this.listeners["all"].forEach(listener => listener(event));
        this.listeners[event.name]?.forEach(listener => listener(event));
    }

}

const dispatcher = new Dispatcher();

export default dispatcher;
