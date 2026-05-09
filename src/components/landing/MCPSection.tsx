import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Plug, Sparkles, Code } from "lucide-react";

type Client = {
  name: string;
  logo: string;
  href: string;
  bg?: string;
};

const clients: Client[] = [
  { name: "Claude.ai", logo: "/clients/claude.svg", href: "/docs/connect-claude-ai", bg: "#fbeee5" },
  { name: "Claude Code", logo: "/clients/claude-code.png", href: "/docs/connect-claude-code", bg: "#fbeee5" },
  { name: "ChatGPT", logo: "/clients/chatgpt.png", href: "/docs/connect-chatgpt", bg: "#f1f5f4" },
  { name: "Codex", logo: "/clients/codex.png", href: "/docs/connect-codex", bg: "#eef0fb" },
  { name: "Gemini CLI", logo: "/clients/gemini-cli.png", href: "/docs/connect-gemini-cli", bg: "#eef3ff" },
  { name: "Antigravity", logo: "/clients/antigravity.png", href: "/docs/connect-antigravity", bg: "#f3edff" },
];

type Feature = {
  icon: typeof Plug;
  title: string;
  description: string;
};

const features: Feature[] = [
  {
    icon: Plug,
    title: "Connects in seconds",
    description: "OAuth, no API keys to manage.",
  },
  {
    icon: Sparkles,
    title: "Four purpose-built tools",
    description: "ask, draft, get_feedback, scope_pmm_research.",
  },
  {
    icon: Code,
    title: "Skills + custom instructions included",
    description: "Sherpa picks the right tool, in the right voice.",
  },
];

export function MCPSection() {
  return (
    <section
      id="mcp"
      className="py-14 md:py-20 scroll-mt-20"
      style={{
        background: "linear-gradient(180deg, #ffffff 0%, #f8f9fd 50%, #ffffff 100%)",
      }}
    >
      <div className="max-w-6xl mx-auto px-5 md:px-8">
        {/* Section header */}
        <div className="text-center mb-10 md:mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#0058be] mb-3">
            Now in MCP
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-[-0.03em] text-[#191c1e] mb-4">
            Use Sherpa in every AI you already use
          </h2>
          <p className="text-base md:text-lg text-[#4a4f57] max-w-2xl mx-auto leading-relaxed">
            One connector. Six clients. The same senior PMM advisor everywhere.
          </p>
        </div>

        {/* Client grid */}
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 mb-12 md:mb-16">
          {clients.map((client) => (
            <Link
              key={client.name}
              href={client.href}
              className="group flex flex-col items-center justify-center gap-3 rounded-2xl bg-white border border-[#e8ecf4]/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)] py-5 px-3 transition-all hover:shadow-[0_4px_16px_rgba(0,88,190,0.08)] hover:border-[#0058be]/30 hover:-translate-y-0.5"
              aria-label={`Connect ${client.name}`}
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl overflow-hidden"
                style={{ background: client.bg ?? "#ffffff" }}
              >
                <Image
                  src={client.logo}
                  alt={`${client.name} logo`}
                  width={32}
                  height={32}
                  className="h-7 w-7 object-contain"
                  unoptimized
                />
              </div>
              <span className="text-xs md:text-sm font-medium text-[#191c1e] text-center leading-tight group-hover:text-[#0058be] transition-colors">
                {client.name}
              </span>
            </Link>
          ))}
        </div>

        {/* Feature bullets */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 mb-10 md:mb-12">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl bg-white border border-[#e8ecf4]/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)] p-6 md:p-7"
            >
              <div className="w-10 h-10 rounded-xl bg-[#0058be]/[0.08] flex items-center justify-center mb-4">
                <feature.icon className="h-5 w-5 text-[#0058be]" strokeWidth={2} />
              </div>
              <h3 className="text-base font-bold text-[#191c1e] mb-2">{feature.title}</h3>
              <p className="text-sm text-[#4a4f57] leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Pricing callout */}
        <p className="text-center text-sm text-[#5f6368] max-w-3xl mx-auto leading-relaxed mb-8 md:mb-10">
          Starts free. 10 MCP credits per month.{" "}
          <a
            href="#pricing"
            className="text-[#0058be] hover:text-[#004a9e] underline-offset-4 hover:underline"
          >
            Top up
          </a>{" "}
          anytime, or upgrade to{" "}
          <a
            href="#pricing"
            className="text-[#0058be] hover:text-[#004a9e] underline-offset-4 hover:underline"
          >
            Starter
          </a>{" "}
          for 200 credits/month.
        </p>

        {/* CTA */}
        <div className="max-w-md mx-auto flex flex-col items-center gap-4">
          <Link href="/docs" className="block w-full">
            <Button
              size="lg"
              className="w-full gap-2 rounded-full bg-[#0058be] hover:bg-[#004a9e] text-white font-medium shadow-none h-12 text-base"
            >
              See setup guide <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <a
            href="https://github.com/boommark/pmmsherpa-mcp"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-[#0058be] hover:text-[#004a9e] transition-colors"
          >
            Browse on GitHub →
          </a>
        </div>
      </div>
    </section>
  );
}
