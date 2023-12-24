import { filterCommands } from "./filterCommands.ts";
import { assertEquals } from "./deps/testing.ts";
import { Command, KeyMap } from "./types.ts";

const noop: Command = () => "normal";
const commands: KeyMap[] = [
  { sequence: ["g", "g"], command: noop },
  { sequence: ["G"], command: noop },
  { sequence: ["w"], command: noop },
  { sequence: ["b"], command: noop },
  { sequence: ["b", "b"], command: noop },
  { sequence: ["d", "d"], command: noop },
  { sequence: ["d", "w"], command: noop },
  { sequence: ["<F12>"], command: noop },
  { sequence: ["<", "F", "1", "2", ">"], command: noop },
];

Deno.test("filterCommands() - ", async (t) => {
  await t.step("perfect match", () => {
    const [perfect, matched] = filterCommands(commands, ["G"]);
    assertEquals(perfect, [{ sequence: ["G"], command: noop }]);
    assertEquals(matched, []);
  });

  await t.step("partial match", () => {
    {
      const [perfect, matched] = filterCommands(commands, ["d"]);
      assertEquals(perfect, []);
      assertEquals(matched, [
        { sequence: ["d", "d"], command: noop },
        { sequence: ["d", "w"], command: noop },
      ]);
    }
    const [perfect, matched] = filterCommands(commands, ["b"]);
    assertEquals(perfect, [
      { sequence: ["b"], command: noop },
    ]);
    assertEquals(matched, [
      { sequence: ["b", "b"], command: noop },
    ]);
  });

  await t.step("no match", () => {
    {
      const [perfect, matched] = filterCommands(commands, ["x"]);
      assertEquals(perfect, []);
      assertEquals(matched, []);
    }
    const [perfect, matched] = filterCommands(commands, ["d", "a"]);
    assertEquals(perfect, []);
    assertEquals(matched, []);
  });

  await t.step("empty match", () => {
    {
      const [perfect, matched] = filterCommands(commands, []);
      assertEquals(perfect, []);
      assertEquals(matched, []);
    }
    const [perfect, matched] = filterCommands(commands, [""]);
    assertEquals(perfect, []);
    assertEquals(matched, []);
  });

  await t.step("special key", () => {
    {
      const [perfect, matched] = filterCommands(commands, ["<"]);
      assertEquals(perfect, []);
      assertEquals(matched, [
        { sequence: ["<", "F", "1", "2", ">"], command: noop },
      ]);
    }
    const [perfect, matched] = filterCommands(commands, ["<F12>"]);
    assertEquals(perfect, [
      { sequence: ["<F12>"], command: noop },
    ]);
    assertEquals(matched, []);
  });
});
