export function $(query: string, element?: Element): Element {
    return (element || document).querySelector(query);
}

export function on(element: any, event: string, callback: EventListenerOrEventListenerObject, capture: any = false) {
    element.addEventListener(event, callback, capture);
}

export async function fs() {
    document.fullscreenElement || await document.body.requestFullscreen();
}
