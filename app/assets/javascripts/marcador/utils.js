export function addMultipleEventListener(element, events, handler) {
  for (const e of events.split(" ")) {
    element.addEventListener(e, handler);
  }
}

export function removeMultipleEventListener(element, events, handler) {
  events.split(" ").forEach((e) => element.removeEventListener(e, handler));
}