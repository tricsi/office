export function $(query: string, element?: Element): Element {
    return (element || document).querySelector(query);
}

export function on(element: any, event: string, callback: EventListenerOrEventListenerObject, capture: any = false) {
    element.addEventListener(event, callback, capture);
    return on;
}

export function now() {
    return new Date().getTime() / 1000;
}

export async function fs() {
    document.fullscreenElement || await document.body.requestFullscreen();
}

export function mobile() {
    return navigator.userAgent.match(/(Android|iPhone|iPad|iPod)/i);
}

export function rnd(max: number = 1, seed: number = 0, round: boolean = false): number {
    if (max <= 0) {
        return max;
    }
    const mod = 233280;
    rnd.SEED = (rnd.SEED * 9301 + 49297) % mod;
    seed = seed ? rnd.SEED * seed % mod : rnd.SEED;
    let value = (seed / mod) * max;
    return round ? Math.round(value) : value;
}

rnd.SEED = Math.random();
