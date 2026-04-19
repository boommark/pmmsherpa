"use client";

interface LogoItem {
  name: string;
  file: string;
  wide?: boolean;
}

// Row 1: Starts with Google, mega-brands and major enterprise
const row1Logos: LogoItem[] = [
  { name: "Google", file: "google" },
  { name: "Microsoft", file: "microsoft" },
  { name: "Amazon", file: "amazon" },
  { name: "NVIDIA", file: "nvidia" },
  { name: "Cisco", file: "cisco" },
  { name: "IBM", file: "ibm" },
  { name: "Oracle", file: "oracle" },
  { name: "Infor", file: "infor" },
  { name: "Uber", file: "uber" },
  { name: "Boeing", file: "boeing" },
  { name: "WhatsApp", file: "whatsapp" },
  { name: "SAP", file: "sap" },
  { name: "T-Mobile", file: "t-mobile" },
  { name: "GSK", file: "gsk" },
  { name: "Atlassian", file: "atlassian", wide: true },
  { name: "Palo Alto Networks", file: "palo-alto-networks", wide: true },
  { name: "BCG", file: "bcg" },
  { name: "Indeed", file: "indeed" },
  { name: "UiPath", file: "uipath" },
  { name: "Okta", file: "okta" },
];

// Row 2: Starts with Box, tech/growth companies
const row2Logos: LogoItem[] = [
  { name: "Box", file: "box" },
  { name: "Carta", file: "carta" },
  { name: "Scale AI", file: "scale-ai" },
  { name: "Perplexity", file: "perplexity" },
  { name: "CZI", file: "czi" },
  { name: "Upstart", file: "upstart" },
  { name: "Neo4j", file: "neo4j" },
  { name: "InMobi", file: "inmobi" },
  { name: "ChargePoint", file: "chargepoint" },
  { name: "Highspot", file: "highspot" },
  { name: "Cvent", file: "cvent" },
  { name: "Canonical", file: "canonical" },
  { name: "Guidewire", file: "guidewire" },
  { name: "Ping Identity", file: "ping-identity" },
  { name: "Clio", file: "clio" },
  { name: "MacPaw", file: "macpaw" },
  { name: "Swiggy", file: "swiggy" },
];

function LogoTrack({ logos, direction }: { logos: LogoItem[]; direction: "left" | "right" }) {
  const allLogos = [...logos, ...logos];
  const animationClass = direction === "left" ? "animate-scroll-left" : "animate-scroll-right";

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        height: 52,
        maskImage: "linear-gradient(90deg, transparent 0%, #000 8%, #000 92%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(90deg, transparent 0%, #000 8%, #000 92%, transparent 100%)",
      }}
    >
      <div className={`flex items-center w-max ${animationClass} hover:[animation-play-state:paused]`}>
        {allLogos.map((logo, i) => (
          <div
            key={`${logo.file}-${i}`}
            className="flex-shrink-0 flex items-center justify-center opacity-[0.35] grayscale hover:opacity-70 hover:grayscale-0 transition-all duration-300"
            style={{
              width: logo.wide ? 220 : 160,
              height: 52,
              marginRight: 32,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/logos/${logo.file}.svg`}
              alt={logo.name}
              style={{
                maxWidth: logo.wide ? 200 : 140,
                maxHeight: 38,
                width: "auto",
                height: "auto",
                objectFit: "contain",
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function LogoBanner() {
  return (
    <div className="py-4 overflow-hidden">
      <p className="text-center text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-[#b8bcc4] mb-4">
        Trusted by GTM experts at
      </p>
      <LogoTrack logos={row1Logos} direction="left" />
      <div className="h-3" />
      <LogoTrack logos={row2Logos} direction="right" />
    </div>
  );
}
