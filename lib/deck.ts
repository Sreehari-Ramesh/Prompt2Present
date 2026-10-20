import { z } from "zod";

export const slideSchema = z.object({
  id: z.string().max(80),
  layout: z.enum(["cover", "columns", "metrics", "statement", "closing"]),
  eyebrow: z.string().max(65),
  title: z.string().max(150),
  subtitle: z.string().max(360),
  items: z.array(z.object({ heading: z.string().max(80), body: z.string().max(240) })).max(4),
  notes: z.string().max(4000),
});
export const deckSchema = z.object({
  title: z.string().min(1).max(100),
  theme: z.enum(["terracotta", "midnight", "sage", "paper"]),
  slides: z.array(slideSchema).min(1).max(20),
});
export const resultSchema = z.object({ message: z.string().max(1200), deck: deckSchema });
export type Slide = z.infer<typeof slideSchema>;
export type Deck = z.infer<typeof deckSchema>;
export type Theme = Deck["theme"];
export const themes: Record<Theme, { name: string; accent: string; background: string; foreground: string; soft: string }> = {
  terracotta: { name: "Terracotta", accent: "#bd593e", background: "#f7f3ec", foreground: "#2f322b", soft: "#e9b29c" },
  midnight: { name: "Midnight", accent: "#263b65", background: "#f0f2f8", foreground: "#172746", soft: "#a8bade" },
  sage: { name: "Botanical", accent: "#486853", background: "#f0f2e9", foreground: "#2e4031", soft: "#b7c4a2" },
  paper: { name: "Monochrome", accent: "#343431", background: "#faf9f5", foreground: "#262622", soft: "#cecbc1" },
};
export const seedDeck: Deck = {
  title: "The future of work",
  theme: "terracotta",
  slides: [
    { id: "intro", layout: "cover", eyebrow: "PERSPECTIVES / 2026", title: "The future\nof work.", subtitle: "Less ordinary. More human.\nA new perspective on how we work, together.", items: [], notes: "Welcome your audience. Introduce the central idea: the future of work is an opportunity to design more thoughtful, human experiences. This is a sample presentation; adapt the examples to your organization." },
    { id: "shift", layout: "statement", eyebrow: "01 / THE BIG SHIFT", title: "Work is changing.\nSo should we.", subtitle: "The question is no longer where we work.\nIt’s how we make work worth doing.", items: [], notes: "Invite the audience to reflect on a change they have experienced at work. Connect their experience to the need for intentional redesign." },
    { id: "forces", layout: "columns", eyebrow: "02 / A NEW LANDSCAPE", title: "Three forces.\nOne new reality.", subtitle: "The ideas reshaping our everyday.", items: [{ heading: "Intelligent tools", body: "Let technology handle the routine, so people can do the remarkable." }, { heading: "Flexible by design", body: "Give teams the freedom to choose how they do their best work." }, { heading: "Human connection", body: "Build belonging with intention, wherever work happens." }], notes: "Walk through each force. Add a specific, verified example from your organization." },
    { id: "principles", layout: "metrics", eyebrow: "03 / OUR NORTH STAR", title: "Better work starts\nwith better questions.", subtitle: "Three principles to guide what comes next.", items: [{ heading: "01", body: "Make space for focus" }, { heading: "02", body: "Design for trust" }, { heading: "03", body: "Measure what matters" }], notes: "These are principles, not statistical claims. Discuss which principle would have the greatest impact for your team." },
    { id: "human", layout: "statement", eyebrow: "04 / THE HUMAN ADVANTAGE", title: "Make room for\nwhat makes us human.", subtitle: "Curiosity. Creativity. Connection.\nThe things no workflow can replace.", items: [], notes: "Use a personal story about collaboration or creative problem solving." },
    { id: "roadmap", layout: "columns", eyebrow: "05 / FROM IDEA TO ACTION", title: "Small steps.\nMeaningful change.", subtitle: "A practical path to a more intentional workplace.", items: [{ heading: "Listen first", body: "Understand what helps your team thrive and what gets in the way." }, { heading: "Experiment openly", body: "Start with one small change. Share what you learn along the way." }, { heading: "Keep evolving", body: "Turn the best experiments into habits. Revisit them together." }], notes: "Ask participants to identify a small experiment they could run this month." },
    { id: "takeaways", layout: "columns", eyebrow: "06 / TAKE IT WITH YOU", title: "A future we\ncreate together.", subtitle: "Progress happens when we choose it, every day.", items: [{ heading: "Be intentional", body: "Design your work around the outcomes you want to create." }, { heading: "Stay curious", body: "Question familiar habits and make space for new possibilities." }, { heading: "Put people first", body: "Build a culture where everyone has room to contribute." }], notes: "Recap the main themes. Ask each person to choose one takeaway." },
    { id: "end", layout: "closing", eyebrow: "THE NEXT CHAPTER", title: "Let’s make\nwork better.", subtitle: "The future starts with a conversation.\nWhat will you change first?", items: [], notes: "Thank the audience and open the discussion." },
  ],
};

// Limited offline example; never represented as live AI.
export function demoGenerate(topic: string, count: number, theme: Theme): Deck {
  const subject = topic.trim().replace(/^(create|make|build|design)\s+(me\s+)?(a\s+)?(\d+[- ]slide\s+)?(presentation|deck|pitch)(\s+(about|on|for))?\s*/i, "").replace(/[.!]$/, "").slice(0, 80) || "Your next big idea";
  const deck = structuredClone(seedDeck);
  deck.title = subject.charAt(0).toUpperCase() + subject.slice(1); deck.theme = theme;
  const labels = [deck.title, "The opportunity ahead.", "A clearer perspective.", "What matters most.", "Ideas into action.", "Our path forward.", "The key takeaways.", "Let’s take the next step."];
  deck.slides = Array.from({ length: count }, (_, i) => {
    const source = structuredClone(seedDeck.slides[i === count - 1 ? 7 : i % 7]);
    const items = source.layout === "columns" ? [{ heading: "The challenge", body: "Describe the problem and the people it affects." }, { heading: "Your approach", body: "Explain your idea and what makes it different." }, { heading: "The impact", body: "Show what success would look like. Add verified evidence." }] : source.layout === "metrics" ? [{ heading: "01", body: "Define the opportunity" }, { heading: "02", body: "Make the case" }, { heading: "03", body: "Propose the next step" }] : [];
    const subtitle = i === 0 ? "A starting point for your next great presentation.\nCreated with Forma’s offline template." : i === count - 1 ? "One clear idea. One meaningful next step.\nWhat would you like your audience to do?" : source.layout === "statement" ? "Start with the problem. Show why it matters.\nGive your audience a reason to care." : "Replace these prompts with the details that make your story yours.";
    return { ...source, id: crypto.randomUUID(), title: labels[i === count - 1 ? 7 : i % 7], eyebrow: i === 0 ? "A FRESH PERSPECTIVE" : `${String(i).padStart(2, "0")} / ${deck.title.toUpperCase().slice(0, 40)}`, subtitle, items, notes: `Demo template for ${deck.title}. Replace this placeholder with your own content or connect OpenAI to generate a narrative.` };
  });
  return deck;
}
