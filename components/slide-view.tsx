"use client";
import type { CSSProperties } from "react";
import { themes, type Slide, type Theme } from "@/lib/deck";

type Props = { slide: Slide; theme: Theme; index: number; total: number; editable?: boolean; onChange?: (field: string, value: string) => void };
export default function SlideView({ slide, theme, index, total, editable = false, onChange }: Props) {
  const palette = themes[theme];
  const dark = slide.layout === "cover" || slide.layout === "closing";
  const edit = (field: string, value: string, className: string, tag: "h1" | "p" | "h3" | "span" = "p", max = 360) => {
    const Tag = tag;
    const titleSize = dark ? 7.15 : slide.layout === "statement" ? 6.4 : 4.65;
    const scale = Math.min(1, Math.sqrt((dark ? 43 : 65) / Math.max(value.length, 1)), 3 / Math.max(value.split("\n").length, 1));
    return <Tag className={className} style={field === "title" ? { fontSize: `${titleSize * scale}cqw` } : undefined} contentEditable={editable} suppressContentEditableWarning role={editable ? "textbox" : undefined} aria-label={editable ? `Edit ${field}` : undefined} onBlur={editable ? e => onChange?.(field, (e.currentTarget.innerText || "").slice(0, max)) : undefined} onKeyDown={editable ? e => { if (e.key === "Escape") e.currentTarget.blur(); } : undefined} onPaste={editable ? e => { e.preventDefault(); document.execCommand("insertText", false, e.clipboardData.getData("text/plain").slice(0, max)); } : undefined}>{value}</Tag>;
  };
  return <div className={`slide-art layout-${slide.layout} ${dark ? "slide-dark" : ""}`} style={{ "--slide-accent": palette.accent, "--slide-bg": palette.background, "--slide-fg": palette.foreground, "--slide-soft": palette.soft } as CSSProperties}>
    {dark && <div className="orb-art" aria-hidden="true"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="orb orb-one" /><div className="orb orb-two" /><div className="orb orb-three" /><div className="orb-line" /><span className="art-star">✳</span></div>}
    <div className="slide-content">
      {edit("eyebrow", slide.eyebrow, "slide-eyebrow", "p", 65)}
      {edit("title", slide.title, "slide-title", "h1", 150)}
      {edit("subtitle", slide.subtitle, "slide-subtitle")}
      {(slide.layout === "columns" || slide.layout === "metrics") && <div className="slide-items" style={{ gridTemplateColumns: `repeat(${Math.max(1, slide.items.length)}, 1fr)` }}>{slide.items.map((item, i) => <div className="slide-item" key={i}><span className="item-number">{String(i + 1).padStart(2, "0")}</span>{edit(`items.${i}.heading`, item.heading, "item-heading", "h3", 80)}{edit(`items.${i}.body`, item.body, "item-body", "p", 240)}</div>)}</div>}
    </div>
    <footer className="slide-footer"><span>FORMA <span className="footer-divider">/</span> IDEAS INTO IMPACT</span><span>{String(index + 1).padStart(2, "0")} <span className="footer-divider">/</span> {String(total).padStart(2, "0")}</span></footer>
  </div>;
}
