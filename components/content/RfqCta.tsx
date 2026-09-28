import Link from "next/link";
import { buildEmailHref, buildWhatsAppHref, siteConfig } from "@/lib/content/site";

type RfqCtaProps = {
  title?: string;
  description?: string;
  productName?: string;
  rfqPrompt?: string;
};

export function RfqCta({
  title = "Need a reliable welding parts supplier?",
  description = "Send your product list, drawings, product photos or reference part details. ArcFort Weld will respond with quotation, MOQ and delivery options after confirmation.",
  productName,
  rfqPrompt,
}: RfqCtaProps) {
  const inquiryReference = rfqPrompt ?? productName;
  const rfqHref = inquiryReference
    ? `/rfq?product=${encodeURIComponent(inquiryReference)}`
    : "/rfq";
  const directInquiryMessage = productName
    ? [
        `Hello ArcFort Weld, I would like a quotation for ${productName}.`,
        "",
        rfqPrompt ?? "Quantity:\nDestination country:\nModel / drawing / sample reference:",
      ].join("\n")
    : undefined;
  const emailHref = buildEmailHref({
    subject: productName ? `ArcFort Weld RFQ - ${productName}` : "ArcFort Weld product RFQ",
    message: directInquiryMessage,
  });
  const whatsappHref = buildWhatsAppHref({ message: directInquiryMessage });

  return (
    <section
      data-nosnippet
      data-snippet-region="rfq-cta"
      className="bg-arc-midnight px-6 py-8 text-white sm:px-8 sm:py-10 lg:px-10"
    >
      <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase text-slate-300">Request for Quotation</p>
          <h2 className="mt-3 font-display text-3xl font-black leading-tight">{title}</h2>
          <p className="mt-4 text-sm leading-6 text-slate-300">{description}</p>
        </div>
        <div className="shrink-0">
          <Link href={rfqHref} className="button-base button-primary w-full sm:w-auto">
            Request a Quote
          </Link>
        </div>
      </div>
      <div className="mt-7 flex flex-col gap-2 border-t border-white/15 pt-5 text-sm text-slate-300 sm:flex-row sm:gap-6">
        <a href={emailHref} className="break-all font-semibold transition hover:text-white">
          {siteConfig.email}
        </a>
        <a href={whatsappHref} className="font-semibold transition hover:text-white">
          WhatsApp {siteConfig.whatsapp}
        </a>
      </div>
    </section>
  );
}
