export let nextFxId = 10000;
export const activeFX = [];

export function getNextFxId() {
  return nextFxId++;
}

export function clearAllFX() {
  activeFX.length = 0;
}