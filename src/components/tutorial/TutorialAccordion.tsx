"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { tutorialSections } from "@/components/tutorial/tutorialSections";

export function TutorialAccordion() {
  const [openId, setOpenId] = useState<string | null>(tutorialSections[0].id);

  const jumpTo = (id: string) => {
    setOpenId(id);
    document.getElementById(id)?.scrollIntoView({ block: "start" });
  };

  return (
    <div className="mt-6">
      <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
        {tutorialSections.map((section) => {
          const isOpen = openId === section.id;
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => jumpTo(section.id)}
              aria-controls={`${section.id}-panel`}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-[12px] font-semibold transition-colors ${
                isOpen
                  ? "border-lime/40 bg-lime/[0.1] text-lime"
                  : "border-white/[0.12] bg-white/[0.02] text-white/60 hover:border-white/25 hover:text-white"
              }`}
            >
              <span className="font-mono text-[10.5px] opacity-70">
                {section.number}
              </span>
              {section.chip}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {tutorialSections.map((section) => {
          const isOpen = openId === section.id;
          const Icon = section.icon;

          return (
            <article
              key={section.id}
              id={section.id}
              className={`scroll-mt-24 overflow-hidden rounded-2xl border bg-surface/60 transition-colors duration-300 ${
                isOpen ? "border-lime/25" : "border-hairline"
              }`}
            >
              <h2>
                <button
                  type="button"
                  id={`${section.id}-trigger`}
                  onClick={() => setOpenId(isOpen ? null : section.id)}
                  aria-expanded={isOpen}
                  aria-controls={`${section.id}-panel`}
                  className="flex w-full items-start gap-3.5 p-4 text-left sm:gap-4 sm:p-5"
                >
                  <span
                    aria-hidden="true"
                    className={`mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-colors duration-300 ${
                      isOpen
                        ? "border-lime/30 bg-lime/[0.1] text-lime"
                        : "border-hairline bg-white/[0.03] text-white/50"
                    }`}
                  >
                    <Icon className="h-[18px] w-[18px]" strokeWidth={2.2} />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
                      Topik {section.number}
                    </span>
                    <span className="mt-1 block text-[14.5px] font-bold leading-snug tracking-[-0.01em] text-white sm:text-base">
                      {section.title}
                    </span>
                    {!isOpen && (
                      <span className="mt-1.5 block text-[12px] leading-relaxed text-white/40">
                        {section.teaser}
                      </span>
                    )}
                  </span>

                  <span
                    aria-hidden="true"
                    className={`mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                      isOpen
                        ? "rotate-180 border-lime/40 bg-lime/[0.1] text-lime"
                        : "border-white/[0.1] bg-white/[0.02] text-white/50"
                    }`}
                  >
                    <ChevronDown className="h-4 w-4" strokeWidth={2.6} />
                  </span>
                </button>
              </h2>

              <div
                id={`${section.id}-panel`}
                role="region"
                aria-labelledby={`${section.id}-trigger`}
                inert={!isOpen}
                className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                  isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="border-t border-hairline px-4 pb-5 pt-4 sm:px-5">
                    {section.content}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
