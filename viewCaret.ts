import { Cursor } from "./deps/scrapbox-std.ts";

/** Vimっぽいカーソルを表示する
 *
 * - カーソルがある行の最後の文字の後ろにカーソルを表示する
 * - 行末にリターン記号を表示する
 *
 * @param cursor カーソル
 * @returns 後始末函数
 */
export const viewCaret = (cursor: Cursor): () => void => {
  const id = "scrap-vim-cursor-style";
  if (!document.getElementById(id)) {
    const staticStyle = document.createElement("style");
    staticStyle.textContent = `.line {
  --return-symbol: "⏎";
  --vim-cursor-bg: hsla(38.8, 100%, 50%, 0.5);
}
.line :is(
  :not(.code-block.start) > .indent:not(:has(br), .cell-text, .tab),
  .text:not(:has(.indent)) span:has(> .char-index):not(:has(br)):last-of-type,
  .code-block-start > span:first-of-type,
  .line-title .text
):after,
.line :is(.c-0:has(br.empty-char-index), .indent:has(> br), .cell:last-of-type .tab):before {
  content: var(--return-symbol);
}
.line .formula-preview.text span.result span.indent:after {
  content: "";
}`;
    document.head.append(staticStyle);
  }

  const style = document.createElement("style");
  document.head.append(style);
  let animationId: number | undefined;

  const callback = () => {
    const { line, char } = cursor.getPosition();
    const isLast = cursor.lines[line].text.length === char;
    if (animationId !== undefined) cancelAnimationFrame(animationId);
    animationId = requestAnimationFrame(() => {
      style.textContent = `${
        isLast
          ? `.line:nth-of-type(${
            line + 1
          }) :is(:not(.code-block.start) > .indent:not(:has(br), .cell-text, .tab), .text:not(:has(.indent)) span:has(> .char-index):not(:has(br)):last-of-type, .code-block-start > span:first-of-type, .line-title .text):after, .line:nth-of-type(${
            line + 1
          }) :is(.c-0:has(br.empty-char-index), .indent:has(> br), .cell:last-of-type .tab):before`
          : `.line:nth-of-type(${line + 1}) .c-${char}`
      } {
  background-color: var(--vim-cursor-bg);
}`;
    });
  };
  cursor.addChangeListener(callback);
  callback();

  return () => {
    cursor.removeChangeListener(callback);
    style.remove();
  };
};
