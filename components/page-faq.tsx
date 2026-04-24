import { CheckCircle2 } from "lucide-react";

export type FaqItem = {
  question: string;
  answer: string;
};

export function PageFaqSection({
  eyebrow = "FAQ",
  title,
  items,
}: {
  eyebrow?: string;
  title: string;
  items: readonly FaqItem[];
}) {
  return (
    <section className="mt-12 rounded-lg border border-zinc-200 bg-white p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl font-black tracking-tight text-zinc-950">{title}</h2>
      <div className="mt-8 grid gap-5">
        {items.map((item) => (
          <div
            key={item.question}
            className="border-t border-zinc-200 pt-5 first:border-t-0 first:pt-0"
          >
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-1 size-4 shrink-0 text-emerald-600" />
              <div>
                <h3 className="font-semibold text-zinc-950">{item.question}</h3>
                <p className="mt-2 text-sm leading-7 text-zinc-600">{item.answer}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
