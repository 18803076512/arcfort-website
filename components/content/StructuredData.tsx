type StructuredDataProps = {
  data: Record<string, unknown> | Record<string, unknown>[];
};

function stringifyJsonLd(data: Record<string, unknown>) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function StructuredData({ data }: StructuredDataProps) {
  const entries = Array.isArray(data) ? data : [data];

  return (
    <>
      {entries.map((entry, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: stringifyJsonLd(entry) }}
        />
      ))}
    </>
  );
}
