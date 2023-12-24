import { KeyMap } from "./types.ts";

export const filterCommands = (
  commands: KeyMap[],
  input: string[],
): [KeyMap[], KeyMap[]] => {
  /** 前方部分一致したコマンド */
  const matched: KeyMap[] = [];
  /** 完全一致したコマンド */
  const perfect: KeyMap[] = [];
  if (input.length === 0) return [perfect, matched];

  for (const command of commands) {
    if (
      command.sequence.length <= input.length &&
      command.sequence.every((key, i) => key === input[i])
    ) {
      perfect.push(command);
      continue;
    }
    if (input.every((key, i) => key === command.sequence[i])) {
      matched.push(command);
    }
  }
  return [perfect, matched];
};
