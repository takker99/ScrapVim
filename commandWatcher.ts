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
  const onCompositionEnd = (e: unknown) => {
    const event = e as CompositionEvent;
    if (!event.isTrusted) return;
    if (!(event.target instanceof HTMLElement)) return;
    if (event.target.id !== "text-input") return;
    event.stopPropagation();
    handleEvent(event);

    // 空文字のcompositionendを代わりに発生させて、IME操作が壊れないようにする
    element.value = "";
    const dummy = new CompositionEvent("compositionend", { data: "" });
    element.dispatchEvent(dummy);
  };
  const parent = element.parentElement ?? document;
  element.addEventListener("compositionstart", callback);
  parent.addEventListener("compositionend", onCompositionEnd, {
    capture: true,
  });
  element.addEventListener("keydown", callback);

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
          endEvent instanceof CompositionEvent &&
          endEvent.type !== "compositionend"
        ) {
          continue;
        }

        for (const char of event.data) {
          yield char;
        }
        if (endEvent instanceof KeyboardEvent) {
          if (endEvent.isComposing) break;
          const key = toVimKey(endEvent);
          if (key === undefined) break;
          yield key;
        }

        break;
      }
    }
  } catch (e) {
    throw e;
  } finally {
    element.removeEventListener("compositionstart", callback);
    parent.removeEventListener("compositionend", onCompositionEnd, {
      capture: true,
    });
    element.removeEventListener("keydown", callback);
  }
}
