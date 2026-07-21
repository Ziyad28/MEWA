import { useState } from "react";

export function CompanyLogo({ domain, name, className = "h-12 w-12" }: { domain: string; name: string; className?: string }) {
  const [source, setSource] = useState(0);
  const sources = [
    `https://${domain}/favicon.ico`,
    `https://www.google.com/s2/favicons?sz=256&domain=${domain}`,
  ];

  if (source >= sources.length) {
    return <div aria-label={name} className={`${className} rounded-xl bg-gradient-to-br from-[#00573F] to-[#003D2B] text-white flex items-center justify-center text-lg font-black`}>{name.replace("شركة", "").trim().charAt(0)}</div>;
  }

  return <img src={sources[source]} alt={`شعار ${name}`} className={`${className} object-contain`} onError={() => setSource((value) => value + 1)} />;
}
