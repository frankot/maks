import React from "react";

interface StudioStatementProps {
  text: string;
  href?: string;
  linkText?: string;
}

/**
 * Reusable component for studio statement and call-to-action link.
 */
export default function StudioStatement({ text, href = "#", linkText = "CHECK US OUT ;)" }: StudioStatementProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h2 className="mb-4 text-center text-[32px] leading-9 font-[500] uppercase">
        {text}
      </h2>
      <div className="flex justify-center">
        <a
          href={href}
          className="group relative pb-1 text-sm tracking-wider uppercase"
        >
          {linkText}
          <span className="absolute bottom-0 left-0 h-px w-full bg-black transition-all duration-300 group-hover:left-1/2 group-hover:w-0"></span>
        </a>
      </div>
    </div>
  );
}
