export const $ = (query: string, element: Element | Document = document) => element.querySelector(query);

export const fs = async () => document.fullscreenElement || await document.body.requestFullscreen();

export const mobile = navigator.userAgent.match(/(Android|iPhone|iPad|iPod)/i);

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
