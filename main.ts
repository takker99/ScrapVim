import { takeStores, textInput, useStatusBar } from "./deps/scrapbox-std.ts";
import { insertKeyMap, normalKeyMap } from "./preset.ts";
import type { KeyMap, Mode } from "./types.ts";
import { filterCommands } from "./filterCommands.ts";
import { normalize, split, toVimKey } from "./toVimKey.ts";
import { listenKeySequences } from "./listenKeySequences.ts";

let mode: Mode = "normal";
let sequence: string[] = [];
let commands: KeyMap[] = [];
const { cursor, selection } = takeStores();

{
  const staticStyle = document.createElement("style");
  staticStyle.textContent = `.line {
  --return-symbol: "⏎";
  --vim-cursor-bg: hsla(38.8, 100%, 50%, 0.5);
}
.line :is(
  :not(.code-block.start) > .indent:not(:has(br), .cell-text, .tab),
  .text:not(:has(.indent)) span:has(> .char-index):not(:has(br)):last-of-type,
  .code-block-start > span:first-of-type,
  .line-title .text
):after,
.line :is(.c-0:has(br.empty-char-index), .indent:has(> br), .cell:last-of-type .tab):before {
  content: var(--return-symbol);
}
.line .formula-preview.text span.result span.indent:after {
  content: "";
}`;
  document.head.append(staticStyle);
}
const viewCaret = () => {
  const style = document.createElement("style");
  document.head.append(style);
  let animationId: number | undefined;

  const callback = () => {
    const { line, char } = cursor.getPosition();
    const isLast = cursor.lines[line].text.length === char;
    if (animationId !== undefined) cancelAnimationFrame(animationId);
    animationId = requestAnimationFrame(() => {
      style.textContent = `${
        isLast
          ? `.line:nth-of-type(${
            line + 1
          }) :is(:not(.code-block.start) > .indent:not(:has(br), .cell-text, .tab), .text:not(:has(.indent)) span:has(> .char-index):not(:has(br)):last-of-type, .code-block-start > span:first-of-type, .line-title .text):after, .line:nth-of-type(${
            line + 1
          }) :is(.c-0:has(br.empty-char-index), .indent:has(> br), .cell:last-of-type .tab):before`
          : `.line:nth-of-type(${line + 1}) .c-${char}`
      } {
  background-color: var(--vim-cursor-bg);
}`;
    });
  };
  cursor.addChangeListener(callback);
  callback();
  return () => {
    cursor.removeChangeListener(callback);
    style.remove();
  };
};

let disposeCaret = () => {};
const dispatch = (next: Mode): void => {
  if (mode === next && commands.length !== 0) return;
  mode = next;
  disposeCaret = mode === "normal" ? viewCaret() : (disposeCaret(), () => {});
  commands = [
    ...Object.entries(mode === "normal" ? normalKeyMap : insertKeyMap),
  ].map(([key, command]) => ({
    sequence: [...split(key)].map(normalize),
    command,
  }));
};
dispatch(mode);

let timer: number | undefined;
const log = useStatusBar();
const { render } = useStatusBar();
render({ type: "text", text: mode });
listenKeySequences(
  textInput()!,
  (e) => {
    clearTimeout(timer);
    const keys = e instanceof KeyboardEvent ? [toVimKey(e) ?? ""] : [...e.data];
    let doesPreventDefault = true;
    while (true) {
      const [perfect, matched] = filterCommands(commands, [
        ...sequence,
        ...keys,
      ]);
      if (perfect.length + matched.length === 0) {
        if (sequence.length === 0) {
          // 一つもコマンドが見つからなかった場合は、普通のキー入力として扱う
          doesPreventDefault = false;
          break;
        }
        // 今までのキーをリセットし、今入ってきたキーだけでコマンドを探す
        sequence = [];
        continue;
      }
      // 前方一致したコマンドのみある場合は、キー配列を更新して次のキーを待つ
      if (perfect.length === 0) {
        sequence.push(...keys);
        break;
      }
      if (matched.length > 0) {
        // 前方一致したコマンドがある場合は、後のキーを待つ
        // もし一定時間待っても次のキーが来なければ、完全一致したコマンドを実行する
        timer = setTimeout(() => {
          dispatch(perfect[0].command(mode, cursor, selection));
          sequence = [];
          log.render({ type: "text", text: sequence.join("") });
          render({ type: "text", text: mode });
        }, 1500);
        sequence.push(...keys);
        break;
      }
      // 完全一致したコマンドがある場合はそれを実行する
      dispatch(perfect[0].command(mode, cursor, selection));
      sequence = [];
      break;
    }
    if (doesPreventDefault) {
      e.preventDefault();
      e.stopPropagation();
    }
    log.render({ type: "text", text: sequence.join("") });
    render({ type: "text", text: mode });
  },
);
