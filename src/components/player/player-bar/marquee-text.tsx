"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

export function MarqueeText({ text }: { text: string }) {
  const viewportRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [overflowing, setOverflowing] = useState(false);
  const [duration, setDuration] = useState(16);

  useEffect(() => {
    const viewport = viewportRef.current;
    const node = textRef.current;
    if (!viewport || !node) return;

    function measure() {
      if (!viewport || !node) return;

      const range = document.createRange();
      range.selectNodeContents(node);
      const width = range.getBoundingClientRect().width;
      const over = width > viewport.clientWidth + 1;

      setOverflowing(over);
      if (over) {
        setDuration(Math.min(36, Math.max(10, Math.round(width / 30))));
      }
    }

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    document.fonts.ready.then(measure).catch(() => {});

    return () => observer.disconnect();
  }, [text]);

  return (
    <span ref={viewportRef} className="block overflow-hidden">
      <span
        className={
          overflowing ? "player-title-track flex w-max gap-8" : undefined
        }
        style={
          overflowing
            ? ({ "--marquee-duration": `${duration}s` } as CSSProperties)
            : undefined
        }
      >
        <span
          ref={textRef}
          className={cn(
            "player-title-copy block whitespace-nowrap",
            overflowing ? "shrink-0" : "truncate",
          )}
        >
          {text}
        </span>

        {overflowing && (
          <span
            aria-hidden="true"
            className="player-title-clone block shrink-0 whitespace-nowrap"
          >
            {text}
          </span>
        )}
      </span>
    </span>
  );
}
