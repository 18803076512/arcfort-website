type ProcessStep = {
  step: string;
  title: string;
  description: string;
};

type ProcessStepsProps = {
  items: readonly ProcessStep[];
  inverse?: boolean;
};

export function ProcessSteps({ items, inverse = false }: ProcessStepsProps) {
  const borderClass = inverse
    ? "divide-white/15 border-white/20"
    : "divide-arc-line border-arc-line";

  return (
    <ol className={`divide-y border-y ${borderClass}`}>
      {items.map((item) => (
        <li
          key={item.step}
          className="grid gap-3 py-6 sm:grid-cols-[72px_210px_1fr] sm:items-start sm:gap-6"
        >
          <span
            className={`font-display text-3xl font-black ${inverse ? "text-arc-signal" : "text-arc-blue"}`}
          >
            {item.step}
          </span>
          <h3
            className={`font-display text-xl font-black leading-tight ${inverse ? "text-white" : "text-arc-midnight"}`}
          >
            {item.title}
          </h3>
          <p className={`text-sm leading-7 ${inverse ? "text-slate-300" : "text-slate-600"}`}>
            {item.description}
          </p>
        </li>
      ))}
    </ol>
  );
}
