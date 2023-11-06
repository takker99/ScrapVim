/// <reference no-default-lib="true" />
/// <reference lib="esnext" />
/// <reference lib="dom" />

/** キー入力を監視する
 *
 * @param element キー入力を監視する要素
 * @param listener キー入力を受け取る関数
 */
export const listenKeySequences = (
  element: HTMLElement,
  listener: (event: KeyboardEvent | CompositionEvent) => void,
): () => void => {
  const callback = (e: KeyboardEvent | CompositionEvent) => {
    if (e instanceof KeyboardEvent && e.isComposing) return;
    listener(e);
  };

  element.addEventListener("compositionstart", callback);
  element.addEventListener("compositionend", callback);
  element.addEventListener("keydown", callback);

  return () => {
    element.removeEventListener("compositionstart", callback);
    element.removeEventListener("compositionend", callback);
    element.removeEventListener("keydown", callback);
  };
};
