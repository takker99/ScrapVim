/// <reference lib="deno.ns" />

import { toVimKey } from "./toVimKey.ts";
import { assertStrictEquals } from "./deps/testing.ts";

const makeEvent = (
  key: string,
  modifiers?: ("alt" | "ctrl" | "meta" | "shift")[],
) => {
  const event = {
    key,
    altKey: false,
    ctrlKey: false,
    metaKey: false,
    shiftKey: false,
  };
  for (const modifier of modifiers ?? []) {
    event[`${modifier}Key`] = true;
  }
  return event;
};

Deno.test("toVimKey()", async (t) => {
  await t.step("Special keys", () => {
    assertStrictEquals(toVimKey(makeEvent("Enter")), "<Enter>");
    assertStrictEquals(toVimKey(makeEvent("Escape")), "<Esc>");
  });

  await t.step("Characters", () => {
    const characters =
      "abcdefghijklmnopqrstuvwxyz!\"#$%&'()=-~^|\\`@{[]}+;*:<,>.?/_";
    for (const char of characters) {
      assertStrictEquals(toVimKey(makeEvent(char)), char);
      assertStrictEquals(
        toVimKey(makeEvent(char, ["ctrl"])),
        `<C-${char.toUpperCase()}>`,
      );
      assertStrictEquals(
        toVimKey(makeEvent(char, ["ctrl", "alt"])),
        `<A-C-${char.toUpperCase()}>`,
      );
      assertStrictEquals(
        toVimKey(makeEvent(char, ["ctrl", "alt", "shift"])),
        `<A-C-${char.toUpperCase()}>`,
      );
      assertStrictEquals(
        toVimKey(makeEvent(char, ["ctrl", "meta"])),
        `<C-M-${char.toUpperCase()}>`,
      );
    }
    for (const char of characters.toUpperCase()) {
      assertStrictEquals(toVimKey(makeEvent(char)), char);
      assertStrictEquals(toVimKey(makeEvent(char, ["shift"])), char);
    }
  });
});
