import Link from 'next/link';
import { ArrowLeft, type LucideIcon } from 'lucide-react';

interface PolicySection {
  id: number;
  title: string;
  content: string;
}

interface PolicyLayoutProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  sections: PolicySection[];
}

export function PolicyLayout({ icon: Icon, title, subtitle, sections }: PolicyLayoutProps) {
  return (
    <div className="pb-20 md:pb-6">
      {/* Hero header */}
      <div className="bg-gradient-to-b from-primary/8 to-transparent border-b">
        <div className="container mx-auto px-4 max-w-3xl py-6 md:py-10">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="h-4 w-4" /> হোমে ফিরুন
          </Link>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
              <Icon className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
              <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table of contents - desktop */}
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="hidden md:block bg-muted/30 rounded-xl p-4 my-6 border">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">সূচিপত্র</p>
          <div className="flex flex-wrap gap-2">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#section-${section.id}`}
                className="text-xs text-muted-foreground hover:text-primary transition-colors bg-background px-3 py-1.5 rounded-lg border hover:border-primary/30"
              >
                {section.id}. {section.title}
              </a>
            ))}
          </div>
        </div>

        {/* Sections */}
        <div className="py-4 md:py-2 space-y-6">
          {sections.map((section, i) => (
            <div
              key={section.id}
              id={`section-${section.id}`}
              className="scroll-mt-20"
            >
              {/* Section header */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-lg flex items-center justify-center shrink-0 text-sm font-bold">
                  {section.id}
                </div>
                <h2 className="text-lg font-bold">{section.title}</h2>
              </div>

              {/* Section content */}
              <div className="ml-11 border-l-2 border-muted pl-5 pb-2">
                <div className="text-sm text-muted-foreground leading-7 whitespace-pre-line">
                  {section.content}
                </div>
              </div>

              {/* Divider */}
              {i < sections.length - 1 && (
                <div className="border-b border-dashed mt-6" />
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between py-6 mt-4 border-t text-xs text-muted-foreground/50">
          <span>সর্বশেষ আপডেট: মার্চ ২০২৬</span>
          <Link href="/" className="hover:text-foreground transition-colors">
            হোমে ফিরুন
          </Link>
        </div>
      </div>
    </div>
  );
}
