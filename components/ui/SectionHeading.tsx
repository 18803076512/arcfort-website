type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  id?: string;
  inverse?: boolean;
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  id,
  inverse = false,
  className = "",
}: SectionHeadingProps) {
  return (
    <div className={className}>
      {eyebrow ? (
        <p className={`section-eyebrow ${inverse ? "!text-slate-300" : ""}`}>{eyebrow}</p>
      ) : null}
      <h2 id={id} className={`section-title mt-3 ${inverse ? "!text-white" : ""}`}>
        {title}
      </h2>
      {description ? (
        <p className={`body-large mt-5 ${inverse ? "!text-slate-300" : ""}`}>{description}</p>
      ) : null}
    </div>
  );
}
