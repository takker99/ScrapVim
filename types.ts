import { Cursor, Selection } from "./deps/scrapbox-std.ts";

export type Mode = "normal" | "insert" /*|"visual"|"pending"*/;
export interface State {
  keys: string[];
  mode: Mode;
}
export interface KeyMap {
  /** vim key notationで書かれたキーの羅列
   *
   * 一意になるよう正規化されている
   */
  sequence: string[];
  command: Command;
}
export type Command = (
  mode: Mode,
  cursor: Cursor,
  selection: Selection,
) => Mode;
