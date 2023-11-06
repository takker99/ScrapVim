/** Web APIの`KeyboardEvent`から必要なpropertiesだけ取り出したもの */
export interface KeyEvent {
  key: string;
  shiftKey: boolean;
  ctrlKey: boolean;
  altKey: boolean;
  metaKey: boolean;
}

/** キーボードイベントをvim key notationに変換する */
export const toVimKey = (event: KeyEvent): string | undefined => {
  // ignore control keys
  if (["Process", "Shift", "Control", "Alt", "OS"].includes(event.key)) return;
  // サロゲートペアなどで構成された文字が印字キーとして送られてくる可能性を考慮して、書記素クラスターの長さで判定する
  if ([...event.key].length === 0) return "";

  // vim key notationへの変換
  const command = event.key === "Backspace"
    ? "BS"
    : event.key === "Delete"
    ? "Del"
    : event.key === " "
    ? "Space"
    : event.key === "Escape"
    ? "Esc"
    : event.key.startsWith("Arrow")
    ? event.key.slice(5)
    : ["\\", "<"].includes(event.key)
    ? `\\${event.key}`
    : event.key;

  // 修飾子をつける
  let modifier = "";
  if (event.altKey) modifier += "A-";
  if (event.ctrlKey) modifier += "C-";
  if (event.metaKey) modifier += "M-";
  // 一文字のキーはには付けない
  // すべてShiftキーによって変換された文字だと考える
  if (event.shiftKey && [...command].length > 1) {
    modifier += "S-";
  }

  return modifier !== ""
    ? `<${modifier}${command}>`
    : [...command].length > 1
    ? `<${command}>`
    : command;
};

/** vim key notationの表記を一意なものに統一する */
export const normalize = (key: string): string => {
  switch (key) {
    case "<Return>":
    case "<CR>":
      return "<Enter>";
    case "<BSlash>":
    case "\\":
      return "\\\\";
    case "<Bar>":
      return "|";
    case "<lt>":
    case "<":
      return "\\<";
    default:
      return key;
  }
};

/** vim key notationをキーごとに分割する */
export function* split(key: string): Generator<string, void, unknown> {
  const iter = key[Symbol.iterator]();
  for (const char of iter) {
    switch (char) {
      case "\\": {
        const c = iter.next();
        yield c.done ? char : `${char}${c.value}`;
        break;
      }
      case "<": {
        let stack = char;
        for (const c of iter) {
          stack += c;
          if (c === ">") {
            if (stack === "<>") {
              yield "<";
              yield ">";
              break;
            }
            yield stack;
            break;
          }
        }
        if (!stack.endsWith(">")) {
          for (const c of stack) {
            yield c;
          }
        }
        break;
      }
      default:
        yield char;
    }
  }
}
