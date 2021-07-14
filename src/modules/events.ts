export type IEvent<T = any, D = any> = { name: string, target?: T, data?: D };
export type Listener = (event?: IEvent) => void;
export type Listeners = Map<string, Listener[]>;

const defaultListeners: Listeners = new Map<string, Listener[]>();

function parse(event: string) {
    return event.replace(/[^-_\w]+/, " ").trim().split(" ").filter(v => !!v);
}

export function on(
    event: string,
    listener: Listener | EventListenerOrEventListenerObject,
    listeners: any = defaultListeners
) {
    for (const name of parse(event)) {
        if (listeners instanceof Map) {
            listeners.has(name) || listeners.set(name, []);
            listeners.get(name).push(listener);
            continue;
        }
        listeners.addEventListener(event, listener, false);
    }
    return on;
}

export function off(
    event: string,
    listener: Listener | EventListenerOrEventListenerObject,
    listeners: any = defaultListeners
) {
    for (const name of parse(event)) {
        if (listeners instanceof Map) {
            const data = listeners.get(name);
            if (listeners) {
                const index = data.indexOf(listener as Listener);
                index >= 0 && data.splice(index, 1);
            }
            continue;
        }
        listeners.removeEventListener(event, listener, false);
    }
    return off;
}

export function emit(
    name: string,
    target?: any,
    data?: any,
    listeners: any = defaultListeners
) {
    const event = { name, target, data };
    listeners.get("all")?.forEach((listener: Listener) => listener(event));
    listeners.get(name)?.forEach((listener: Listener) => listener(event));
    return emit;
}
