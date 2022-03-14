/// <reference no-default-lib="true" />
/// <reference lib="esnext" />
/// <reference lib="dom" />

const changeSpecialKey = (key: string): string => {
  if (key.startsWith("Arrow")) return key.slice(5);
  switch (key) {
    case "Backspace":
      return "BS";
    case "Delete":
      return "Del";
    case " ":
      return "Space";
    case "Escape":
      return "Esc";
  }
  return key;
};

export const toVimKey = (
  event: Pick<
    KeyboardEvent,
    "key" | "shiftKey" | "ctrlKey" | "altKey" | "metaKey"
  >,
): string | undefined => {
  if (["Process", "Shift", "Control", "Alt", "OS"].includes(event.key)) return;
  if (event.key.length === 0) return "";

  // vim key notationへの変換
  const command = changeSpecialKey(event.key);

  // 修飾子をつける
  let modifier = "";
  if (event.altKey) modifier += "A-";
  if (event.ctrlKey) modifier += "C-";
  if (event.metaKey) modifier += "M-";
  // 一文字のキーはには付けない
  // すべてShiftキーによって変換された文字だと考える
  if (event.shiftKey && command.length > 1) {
    modifier += "S-";
  }

  return modifier !== ""
    // <C-w>などは<C-W>に統一する
    ? `<${modifier}${command.length > 1 ? command : command.toUpperCase()}>`
    : command.length > 1
    ? `<${command}>`
    : command;
};
