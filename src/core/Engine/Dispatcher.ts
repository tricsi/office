export interface GameEvent<T = any, D = any> {
    /** Event name */
    name: string;
    /** Evvent target */
    target?: T;
    /** Event data */
    data?: D;
}

export type Listener = (event?: GameEvent) => void;

const listeners: { [event: string]: Listener[] } = { all: [] };

function parse(event: string) {
    return event.replace(/[^-_\w]+/, " ").trim().split(" ").filter(v => !!v);
}

export function listen(event: string, listener: Listener) {
    for (const name of parse(event)) {
        if (!(name in listeners)) {
            listeners[name] = [];
        }
        listeners[name].push(listener);
    }
}

export function mute(event: string, listener: Listener) {
    for (const name of parse(event)) {
        if (name in listeners) {
            const index = listeners[name].indexOf(listener);
            index >= 0 && listeners[name].splice(index, 1);
        }
    }
}

export function emit(event: GameEvent) {
    listeners["all"].forEach(listener => listener(event));
    listeners[event.name]?.forEach(listener => listener(event));
}
