import type { Deck } from "./deck";
import { themes } from "./deck";

export async function exportPowerPoint(deck: Deck) {
  const { default: PptxGenJS } = await import("pptxgenjs");
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE"; pptx.author = "Forma"; pptx.subject = "Created with Forma Presentation Studio"; pptx.title = deck.title; pptx.company = "Forma";
  pptx.theme = { headFontFace: "Aptos Display", bodyFontFace: "Aptos" };
  const palette = themes[deck.theme]; const hex = (s: string) => s.replace("#", "");
  deck.slides.forEach((s, i) => {
    const slide = pptx.addSlide(); const dark = s.layout === "cover" || s.layout === "closing";
    const fg = dark ? "FFF9F0" : hex(palette.foreground);
    slide.background = { color: hex(dark ? palette.accent : palette.background) };
    if (dark) {
      slide.addShape(pptx.ShapeType.ellipse, { x: 7.8, y: .7, w: 5.2, h: 5.2, line: { color: hex(palette.soft), transparency: 50, width: 1 }, fill: { color: hex(palette.accent), transparency: 100 } });
      slide.addShape(pptx.ShapeType.ellipse, { x: 8.35, y: 1.25, w: 4.1, h: 4.1, line: { color: hex(palette.soft), transparency: 55, width: 1 }, fill: { color: hex(palette.accent), transparency: 100 } });
      slide.addShape(pptx.ShapeType.ellipse, { x: 9.1, y: 1.7, w: 2.8, h: 2.8, line: { transparency: 100 }, fill: { color: hex(palette.soft) }, shadow: { type: "outer", color: "5A2B21", blur: 28, angle: 50, offset: 12, opacity: .25 } });
      slide.addShape(pptx.ShapeType.ellipse, { x: 8.0, y: 4.1, w: 1.55, h: 1.55, line: { transparency: 100 }, fill: { color: "F3D4BB" } });
    }
    const base = { fontFace: "Aptos", color: fg, margin: 0, breakLine: false, valign: "middle" as const };
    slide.addText(s.eyebrow, { ...base, x: .78, y: .75, w: 9.5, h: .3, fontSize: 10, charSpacing: 2.2, bold: true });
    const grid = s.layout === "columns" || s.layout === "metrics";
    const titleSize = dark ? 53 : s.layout === "statement" ? 48 : 37;
    slide.addText(s.title, { ...base, x: .78, y: dark ? 2.0 : 1.35, w: dark ? 6.9 : 11.7, h: dark ? 2.3 : 1.7, fontSize: titleSize, bold: true, fit: "shrink", valign: "top", paraSpaceAfter: 0 });
    slide.addText(s.subtitle, { ...base, x: .8, y: dark ? 4.65 : grid ? 3.1 : 4.0, w: dark ? 6.2 : 10.9, h: .85, fontSize: dark ? 14 : 15, fit: "shrink", valign: "top", transparency: 12 });
    if (grid) s.items.forEach((item, j) => {
      const cell = 11.75 / Math.max(s.items.length, 1); const x = .8 + j * cell;
      slide.addShape(pptx.ShapeType.line, { x, y: 4.28, w: cell - .3, h: 0, line: { color: hex(palette.soft), width: 1 } });
      if (s.layout === "columns") slide.addText(String(j + 1).padStart(2, "0"), { ...base, x, y: 4.5, w: 1, h: .3, fontSize: 10, color: hex(palette.accent) });
      slide.addText(item.heading, { ...base, x, y: s.layout === "metrics" ? 4.5 : 5.0, w: cell - .35, h: .75, fontSize: s.layout === "metrics" ? 40 : 18, color: hex(palette.accent), bold: true, fit: "shrink" });
      slide.addText(item.body, { ...base, x, y: 5.75, w: cell - .35, h: .78, fontSize: 12, fit: "shrink", valign: "top" });
    });
    slide.addText("FORMA  /  IDEAS INTO IMPACT", { ...base, x: .8, y: 6.95, w: 7, h: .2, fontSize: 7, charSpacing: 1.2 });
    slide.addText(`${String(i + 1).padStart(2, "0")} / ${String(deck.slides.length).padStart(2, "0")}`, { ...base, x: 11.5, y: 6.95, w: 1, h: .2, fontSize: 8, align: "right" });
    slide.addNotes(s.notes);
  });
  await pptx.writeFile({ fileName: `${deck.title.replace(/[^\p{L}\p{N} _-]/gu, "").trim() || "Presentation"}.pptx` });
}
