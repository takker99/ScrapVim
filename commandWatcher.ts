/// <reference no-default-lib="true" />
/// <reference lib="esnext" />
/// <reference lib="dom" />

import { promisify } from "./deps/async-lib.ts";
import { toVimKey } from "./toVimKey.ts";

export async function* commandWatcher(
  element: HTMLInputElement | HTMLTextAreaElement,
): AsyncGenerator<string, void, unknown> {
  const [watcher, handleEvent] = promisify<CompositionEvent | KeyboardEvent>();

  const callback = (e: unknown) => {
    const event = e as (CompositionEvent | KeyboardEvent);
    if (!event.isTrusted) return;
    event.preventDefault();
    event.stopPropagation();
    handleEvent(event);
  };
  element.addEventListener("compositionstart", callback);
  element.addEventListener("compositionend", callback);
  document.addEventListener("keydown", callback);

  try {
    while (true) {
      const event = await watcher();

      if (event instanceof KeyboardEvent) {
        if (event.isComposing) continue;
        const key = toVimKey(event);
        if (key === undefined) continue;
        yield key;
        continue;
      }

      if (event.type === "compositionend") {
        for (const char of event.data) {
          yield char;
        }
        continue;
      }

      // compositionendになるまで待つ
      while (true) {
        const endEvent = await watcher();
        if (
          !(endEvent instanceof KeyboardEvent &&
            endEvent.type === "compositionend")
        ) {
          continue;
        }
        for (const char of event.data) {
          yield char;
        }
        break;
      }
    }
  } catch (e) {
    throw e;
  } finally {
    element.removeEventListener("compositionstart", callback);
    element.removeEventListener("compositionend", callback);
    document.removeEventListener("keydown", callback);
  }
}
