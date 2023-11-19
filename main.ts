import { takeStores, textInput, useStatusBar } from "./deps/scrapbox-std.ts";
import { insertKeyMap, normalKeyMap } from "./preset.ts";
import type { KeyMap, Mode } from "./types.ts";
import { filterCommands } from "./filterCommands.ts";
import { normalize, split, toVimKey } from "./toVimKey.ts";
import { listenKeySequences } from "./listenKeySequences.ts";
import { viewCaret } from "./viewCaret.ts";

let mode: Mode = "normal";
let sequence: string[] = [];
let commands: KeyMap[] = [];
const { cursor, selection } = takeStores();

let disposeCaret = () => {};
const dispatch = (next: Mode): void => {
  if (mode === next && commands.length !== 0) return;
  mode = next;
  disposeCaret = mode === "normal" ? viewCaret(cursor) : (disposeCaret(), () => {});
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
