export function createResultList(
  topPx?: number,
  rightPx?: number,
  bottomPx?: number,
  leftPx?: number
): { elem: HTMLUListElement; append: Function } {
  const ul = document.createElement("ul");
  if (topPx) ul.style.top = `${topPx}px`;
  if (rightPx) ul.style.right = `${rightPx}px`;
  if (bottomPx) ul.style.bottom = `${bottomPx}px`;
  if (leftPx) ul.style.left = `${leftPx}px`;
  ul.className =
    "absolute block w-[480px] h-[280px] p-4 text-white bg-white bg-opacity-25 text-3xl rounded-xl overflow-y-auto overflow-x-hidden";

  const appendLine = (text: string) => {
    const li = document.createElement("li");
    li.innerText = text;
    ul.appendChild(li);
  };

  return { elem: ul, append: appendLine };
}
