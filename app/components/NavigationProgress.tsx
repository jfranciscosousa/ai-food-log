// It's ok for this specific component to ignore set states in effects
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useRef, useState } from "react";
import { useNavigation } from "react-router";

export function NavigationProgress() {
  const { state } = useNavigation();
  const isNavigating = state === "loading" || state === "submitting";

  const [show, setShow] = useState(false);
  const [width, setWidth] = useState(0);
  const [fastTransition, setFastTransition] = useState(false);
  const [fading, setFading] = useState(false);

  // Tracks whether the bar is currently active so we don't need `show` in the
  // effect's dependency array (which would re-run the effect when we call setShow).
  const activeRef = useRef(false);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (isNavigating) {
      activeRef.current = true;
      setFading(false);
      setFastTransition(false);
      setWidth(0);
      setShow(true);

      // Two nested rAFs guarantee the width:0 frame is painted before we
      // start the slow crawl transition.
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = requestAnimationFrame(() => {
          setWidth(80);
        });
      });

      return () => cancelAnimationFrame(rafRef.current);
    } else if (activeRef.current) {
      activeRef.current = false;
      cancelAnimationFrame(rafRef.current);

      // Snap to 100% with a short transition, then fade out.
      setFastTransition(true);
      setWidth(100);

      const t1 = setTimeout(() => setFading(true), 300);
      const t2 = setTimeout(() => {
        setShow(false);
        setWidth(0);
        setFading(false);
        setFastTransition(false);
      }, 700);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [isNavigating]);

  return (
    <>
      {/* Always-present live region so screen readers announce navigation */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {isNavigating ? "Loading…" : ""}
      </div>

      {show && (
        <div
          role="progressbar"
          aria-label="Page loading"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={width}
          className="fixed top-0 left-0 right-0 z-[100] h-[3px] pointer-events-none"
          style={{
            opacity: fading ? 0 : 1,
            transition: "opacity 0.4s ease",
          }}
        >
          <div
            className="h-full bg-primary"
            style={{
              width: `${width}%`,
              transition: fastTransition
                ? "width 0.3s ease-in-out"
                : "width 8s cubic-bezier(0.05, 0, 0.2, 1)",
            }}
          />
        </div>
      )}
    </>
  );
}
