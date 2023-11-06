import {
  caret,
  getIndentCount,
  insertText,
  press,
  redo,
  scrollHalfDown,
  scrollHalfUp,
  undo,
} from "./deps/scrapbox-std.ts";
import type { Command } from "./types.ts";

const noop: Command = (mode) => mode;
export const normalKeyMap: Readonly<Record<string, Command>> = {
  h: (mode, cursor) => (cursor.goByAction("go-left"), mode),
  j: (mode, cursor) => (cursor.goByAction("go-down"), mode),
  "<Enter>": (mode, cursor) => (cursor.goByAction("go-down"), mode),
  "<Space>": (mode, cursor) => (cursor.goByAction("go-down"), mode),
  k: (mode, cursor) => (cursor.goByAction("go-up"), mode),
  l: (mode, cursor) => (cursor.goByAction("go-right"), mode),
  gg: (mode, cursor) => (cursor.goByAction("go-top"), mode),
  G: (mode, cursor) => (cursor.goByAction("go-bottom"), mode),
  "$": (mode, cursor) => (cursor.goByAction("go-line-tail"), mode),
  "^": (mode, cursor) => (cursor.goByAction("go-line-head"), mode),
  0: (
    mode,
    cursor,
  ) => (cursor.setPosition({ line: cursor.getPosition().line, char: 0 }), mode),
  b: (mode, cursor) => (cursor.goByAction("go-word-head"), mode),
  w: (mode, cursor) => (cursor.goByAction("go-word-tail"), mode),
  "<C-f>": (mode, cursor) => (cursor.goByAction("go-pagedown"), mode),
  "<C-b>": (mode, cursor) => (cursor.goByAction("go-pageup"), mode),
  "<C-d>": (mode) => (scrollHalfDown(), mode),
  "<C-u>": (mode) => (scrollHalfUp(), mode),
  u: (mode) => (undo(), mode),
  "<C-r>": (mode) => (redo(), mode),
  x: (mode) => (press("Delete"), mode),
  dd: (mode, cursor, selection) => {
    cursor.goByAction("go-line-tail");
    const { line, char: end } = cursor.getPosition();
    selection.setRange({ start: { line, char: 0 }, end: { line, char: end } });
    const text = selection.getSelectedText();
    navigator.clipboard.writeText(text);
    press("Delete");
    return mode;
  },
  D: (mode, _, selection) => {
    press("End", { shiftKey: true });
    const text = selection.getSelectedText();
    navigator.clipboard.writeText(text);
    press("Delete");
    return mode;
  },
  yy: (mode, cursor, selection) => {
    cursor.goByAction("go-line-tail");
    const { line, char: end } = cursor.getPosition();
    selection.setRange({ start: { line, char: 0 }, end: { line, char: end } });
    const text = selection.getSelectedText();
    navigator.clipboard.writeText(text);
    return mode;
  },
  Y: (mode, _, selection) => {
    press("End", { shiftKey: true });
    const text = selection.getSelectedText();
    navigator.clipboard.writeText(text);
    return mode;
  },
  i: () => "insert",
  I: (_, cursor) => {
    const position = caret().position;
    const indent = getIndentCount(position.line) ?? 0;
    cursor.setPosition({ line: position.line, char: indent });
    return "insert";
  },
  a: (_, cursor) => (cursor.goByAction("go-right"), "insert"),
  A: (_, cursor) => (cursor.goByAction("go-line-tail"), "insert"),
  o: (_, cursor) => {
    cursor.goByAction("go-line-tail");
    press("Enter");
    return "insert";
  },
  O: (_, cursor) => {
    cursor.goByAction("go-line-head");
    press("Enter");
    cursor.goByAction("go-up");
    return "insert";
  },
  cc: (_, cursor, selection) => {
    cursor.goByAction("go-line-head");
    cursor.goByAction("go-line-head");
    press("End", { shiftKey: true });
    const text = selection.getSelectedText();
    navigator.clipboard.writeText(text);
    press("Delete");
    return "insert";
  },
  C: (_, _2, selection) => {
    press("End", { shiftKey: true });
    const text = selection.getSelectedText();
    navigator.clipboard.writeText(text);
    press("Delete");
    return "insert";
  },
  p: (
    mode,
    cursor,
  ) => (
    navigator.clipboard.readText().then((text) => {
      if (text === "") return;
      insertText(text).then(() => cursor.goByAction("go-left"));
    }), mode
  ),
  P: (
    mode,
  ) => (navigator.clipboard.readText().then((text) => insertText(text)), mode),
  "<C-h>": (mode) => (press("ArrowLeft", { ctrlKey: true }), mode),
  "<C-j>": (mode) => (press("ArrowDown", { ctrlKey: true }), mode),
  "<C-k>": (mode) => (press("ArrowUp", { ctrlKey: true }), mode),
  "<C-l>": (mode) => (press("ArrowRight", { ctrlKey: true }), mode),
  "<A-h>": (mode) => (press("ArrowLeft", { altKey: true }), mode),
  "<A-j>": (mode) => (press("ArrowDown", { altKey: true }), mode),
  "<A-k>": (mode) => (press("ArrowUp", { altKey: true }), mode),
  "<A-l>": (mode) => (press("ArrowRight", { altKey: true }), mode),
  // normal modeでeditorにキーが送られないようにするダミー
  e: noop,
  f: noop,
  m: noop,
  n: noop,
  q: noop,
  r: noop,
  s: noop,
  t: noop,
  v: noop,
  z: noop,
  B: noop,
  E: noop,
  F: noop,
  H: noop,
  J: noop,
  K: noop,
  L: noop,
  M: noop,
  N: noop,
  Q: noop,
  R: noop,
  S: noop,
  T: noop,
  U: noop,
  V: noop,
  W: noop,
  X: noop,
  Z: noop,
  1: noop,
  2: noop,
  3: noop,
  4: noop,
  5: noop,
  6: noop,
  7: noop,
  8: noop,
  9: noop,
  "!": noop,
  '"': noop,
  "#": noop,
  "%": noop,
  "&": noop,
  "'": noop,
  "(": noop,
  ")": noop,
  "=": noop,
  "~": noop,
  "-": noop,
  "|": noop,
  "\\\\": noop,
  "@": noop,
  "[": noop,
  "]": noop,
  ";": noop,
  ":": noop,
  ",": noop,
  ".": noop,
  "/": noop,
  "`": noop,
  "{": noop,
  "+": noop,
  "*": noop,
  "<": noop,
  ">": noop,
  "?": noop,
  "<Tab>": noop,
  "<BS>": noop,
  "<Del>": noop,
};

export const insertKeyMap: Readonly<Record<string, Command>> = {
  "<Esc>": () => "normal",
  "<C-[>": () => "normal",
};
