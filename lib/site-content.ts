export const applications = [
  "Shipbuilding",
  "Automotive",
  "Pipeline",
  "Metal Fabrication",
  "Construction",
  "Repair Workshop",
] as const;

export const companyLinks = [
  { href: "/about", label: "About ARCFORT" },
  { href: "/contact", label: "Contact" },
  { href: "/rfq", label: "Request a Quote" },
] as const;

export const contactMethods = [
  { label: "Email", value: "sales@arcfortweld.com", href: "mailto:sales@arcfortweld.com" },
  { label: "WhatsApp", value: "Contact for WhatsApp", href: "/contact" },
] as const;
