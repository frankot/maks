'use client';

interface TitleProps {
  text: string;
  onPrev?: () => void;
  onNext?: () => void;
}

export default function Title({ text, onPrev, onNext }: TitleProps) {
  return (
    <div className="mx-auto px-4">
      <div className="flex items-center justify-between py-6 md:py-8">
        {/* Left 1/2 - Big category title */}
        <div className="w-1/2 pr-3">
          <h2 className="text-4xl leading-[0.9] font-extrabold whitespace-nowrap text-black/90 uppercase sm:text-5xl md:text-6xl lg:text-7xl">
            {text}
          </h2>
        </div>
        {/* Right 1/2 - Chevron controls */}
        <div className="flex w-1/2 items-center justify-end gap-3 pl-3 md:gap-4">
          <button
            type="button"
            onClick={onPrev}
            aria-label="Scroll left"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/20 text-black transition-colors hover:bg-black hover:text-white"
          >
            <ChevronLeftIcon />
          </button>
          <button
            type="button"
            onClick={onNext}
            aria-label="Scroll right"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/20 text-black transition-colors hover:bg-black hover:text-white"
          >
            <ChevronRightIcon />
          </button>
        </div>
      </div>
    </div>
  );
}

function ChevronLeftIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-5 w-5"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-5 w-5"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}
