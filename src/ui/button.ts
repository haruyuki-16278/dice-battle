export function createButton(
  buttonText: string,
  topPx?: number,
  rightPx?: number,
  bottomPx?: number,
  leftPx?: number
): HTMLButtonElement {
  const button = document.createElement("button");
  button.innerText = buttonText;
  if (topPx) button.style.top = `${topPx}px`;
  if (rightPx) button.style.right = `${rightPx}px`;
  if (bottomPx) button.style.bottom = `${bottomPx}px`;
  if (leftPx) button.style.left = `${leftPx}px`;
  button.className =
    "absolute p-4 rounded-full bg-white disabled:bg-gray-700 transition-colors";
  return button;
}
