import { useCallback, useEffect, useRef, useState } from "react";

const MIN_HIGHLIGHT_VISIBLE_RATIO = 0.25;
const SCROLL_BOTTOM_EPSILON_PX = 1;

function calculateVisibleHeight(elementRect: DOMRect, viewportHeight: number): number {
  const visibleTop = Math.max(elementRect.top, 0);
  const visibleBottom = Math.min(elementRect.bottom, viewportHeight);
  return Math.max(0, visibleBottom - visibleTop);
}

function getClosestActivityToViewportCenter(
  elements: Array<HTMLDivElement | null>,
  viewportHeight: number,
) {
  let closestIndex: number | null = null;
  let minDistanceToViewportCenter = Number.POSITIVE_INFINITY;
  let maxVisibleHeight = 0;
  const viewportCenter = viewportHeight / 2;

  elements.forEach((element, index) => {
    if (!element) {
      return;
    }

    const elementRect = element.getBoundingClientRect();
    const visibleHeight = calculateVisibleHeight(elementRect, viewportHeight);

    if (visibleHeight > maxVisibleHeight) {
      maxVisibleHeight = visibleHeight;
    }

    if (visibleHeight <= 0) {
      return;
    }

    const activityCenter = elementRect.top + elementRect.height / 2;
    const distanceToViewportCenter = Math.abs(activityCenter - viewportCenter);

    if (distanceToViewportCenter <= minDistanceToViewportCenter) {
      minDistanceToViewportCenter = distanceToViewportCenter;
      closestIndex = index;
    }
  });

  return { closestIndex, maxVisibleHeight };
}

function isAtPageBottom(viewportHeight: number): boolean {
  const documentHeight = document.documentElement.scrollHeight;
  return window.scrollY + viewportHeight >= documentHeight - SCROLL_BOTTOM_EPSILON_PX;
}

export function useActiveActivityHighlight() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activityRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    let rafId = 0;

    const updateActiveActivity = () => {
      const viewportHeight = window.innerHeight;
      const lastActivityIndex = activityRefs.current.length - 1;

      if (lastActivityIndex >= 0 && isAtPageBottom(viewportHeight)) {
        setActiveIndex(lastActivityIndex);
        return;
      }

      const { closestIndex, maxVisibleHeight } = getClosestActivityToViewportCenter(
        activityRefs.current,
        viewportHeight,
      );

      if (maxVisibleHeight <= viewportHeight * MIN_HIGHLIGHT_VISIBLE_RATIO) {
        setActiveIndex(null);
        return;
      }

      setActiveIndex(closestIndex);
    };

    const handleViewportChange = () => {
      // scroll/resizeイベントをrAFで束ねて、連続計算を抑える。
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateActiveActivity);
    };

    window.addEventListener("scroll", handleViewportChange, { passive: true });
    window.addEventListener("resize", handleViewportChange);
    updateActiveActivity();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", handleViewportChange);
      window.removeEventListener("resize", handleViewportChange);
    };
  }, []);

  const setActivityRef = useCallback((index: number, element: HTMLDivElement | null) => {
    activityRefs.current[index] = element;
  }, []);

  return { activeIndex, setActivityRef };
}
