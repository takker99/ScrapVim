import { normalize, split, toVimKey } from "./toVimKey.ts";
import { assertEquals, assertStrictEquals } from "./deps/testing.ts";

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
        `<C-${char}>`,
      );
      assertStrictEquals(
        toVimKey(makeEvent(char, ["ctrl", "alt"])),
        `<A-C-${char}>`,
      );
      assertStrictEquals(
        toVimKey(makeEvent(char, ["ctrl", "alt", "shift"])),
        `<A-C-${char}>`,
      );
      assertStrictEquals(
        toVimKey(makeEvent(char, ["ctrl", "meta"])),
        `<C-M-${char}>`,
      );
    }
    for (const char of characters.toUpperCase()) {
      assertStrictEquals(toVimKey(makeEvent(char)), char);
      assertStrictEquals(toVimKey(makeEvent(char, ["shift"])), char);
    }
  });
});
Deno.test("normalize()", () => {
  assertStrictEquals(normalize("<Return>"), "<Enter>");
  assertStrictEquals(normalize("<CR>"), "<Enter>");
  assertStrictEquals(normalize("<BSlash>"), "\\\\");
  assertStrictEquals(normalize("\\"), "\\\\");
  assertStrictEquals(normalize("<Bar>"), "|");
  assertStrictEquals(normalize("<lt>"), "\\<");
  assertStrictEquals(normalize("<"), "\\<");
  assertStrictEquals(normalize("a"), "a");
});
Deno.test("split()", () => {
  assertEquals([...split("")], []);
  assertEquals([...split("a")], ["a"]);
  assertEquals([...split("<")], ["<"]);
  assertEquals([...split("\\<")], ["\\<"]);
  assertEquals([...split("\\")], ["\\"]);
  assertEquals([...split("\\\\")], ["\\\\"]);
  assertEquals([...split("<C-a>")], ["<C-a>"]);
  assertEquals([...split("<F12>")], ["<F12>"]);
  assertEquals([...split("<C-\\><C-n>")], ["<C-\\>", "<C-n>"]);
  assertEquals([...split("<C-\\><C-n>a")], ["<C-\\>", "<C-n>", "a"]);
  assertEquals([...split("\\\\")], ["\\\\"]);
  assertEquals([...split("\\<C-a>")], ["\\<", "C", "-", "a", ">"]);
  assertEquals([...split("\\\\<C-]>")], ["\\\\", "<C-]>"]);
  assertEquals([...split("\\\\<C-\\><C-n>a")], [
    "\\\\",
    "<C-\\>",
    "<C-n>",
    "a",
  ]);
  assertEquals([...split("\\\\<C-\\><C-n>a\\\\")], [
    "\\\\",
    "<C-\\>",
    "<C-n>",
    "a",
    "\\\\",
  ]);
});
