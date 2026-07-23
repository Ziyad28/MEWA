import { useState } from "react";
import stcLogo from "@/assets/company-stc.svg";
import elmLogo from "@/assets/company-elm.svg";
import ejadaLogo from "@/assets/company-ejada.png";
import solutionsLogo from "@/assets/company-solutions.svg";
import samiLogo from "@/assets/company-sami.svg";
import siteLogo from "@/assets/company-site.ico";

const LOGOS: Record<string, string> = {
  "stc.com.sa": stcLogo,
  "elm.sa": elmLogo,
  "ejada.com": ejadaLogo,
  "solutions.com.sa": solutionsLogo,
  "sami.com.sa": samiLogo,
  "site.sa": siteLogo,
};

export function CompanyLogo({
  domain,
  name,
  className = "h-12 w-20",
}: {
  domain: string;
  name: string;
  className?: string;
}) {
  const [source, setSource] = useState(0);
  const sources = [LOGOS[domain], domain ? `https://${domain}/favicon.ico` : undefined].filter(
    Boolean,
  ) as string[];

  if (source >= sources.length) {
    return (
      <div
        aria-label={name}
        className={`${className} rounded-xl bg-gradient-to-br from-[#00573F] to-[#003D2B] text-white flex items-center justify-center text-lg font-black`}
      >
        {name.replace("شركة", "").trim().charAt(0)}
      </div>
    );
  }

  return (
    <span
      className={`${className} inline-flex items-center justify-center overflow-hidden ${domain === "sami.com.sa" ? "rounded-lg bg-[#123f35] p-2" : ""}`}
    >
      <img
        src={sources[source]}
        alt={`شعار ${name}`}
        className="block h-full w-full object-contain"
        loading="lazy"
        decoding="async"
        onError={() => setSource((value) => value + 1)}
      />
    </span>
  );
}
