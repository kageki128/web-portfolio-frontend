"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

const BLOB_SIZE = 56;
const BLOB_SPEED_PX_PER_SECOND = 250;
const BLOB_CURSOR_OFFSET = 22;
const STOP_DISTANCE_PX = 1;
const MAX_FRAME_DELTA_SECONDS = 1 / 30;

type Point = {
  x: number;
  y: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getDefaultPoint(): Point {
  if (typeof window === "undefined") {
    return { x: 0, y: 0 };
  }

  return {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  };
}

function clampToViewport(point: Point): Point {
  const halfSize = BLOB_SIZE / 2;

  return {
    x: clamp(point.x, halfSize, window.innerWidth - halfSize),
    y: clamp(point.y, halfSize, window.innerHeight - halfSize),
  };
}

export function BlobFollower({ isEnabled }: { isEnabled: boolean }) {
  const blobRef = useRef<HTMLDivElement | null>(null);
  const reachImageRef = useRef<HTMLImageElement | null>(null);
  const partyImageRef = useRef<HTMLImageElement | null>(null);
  const positionRef = useRef<Point>(getDefaultPoint());
  const targetRef = useRef<Point>(getDefaultPoint());
  const cursorRef = useRef<Point>(getDefaultPoint());
  const isMovingRef = useRef(false);
  const latestFrameTimeRef = useRef<number | null>(null);

  function setMovingDisplay(nextIsMoving: boolean) {
    if (isMovingRef.current === nextIsMoving) {
      return;
    }

    isMovingRef.current = nextIsMoving;

    if (reachImageRef.current) {
      reachImageRef.current.style.opacity = nextIsMoving ? "1" : "0";
    }

    if (partyImageRef.current) {
      partyImageRef.current.style.opacity = nextIsMoving ? "0" : "1";
    }
  }

  useEffect(() => {
    if (!isEnabled) {
      setMovingDisplay(false);
      return;
    }

    const defaultPoint = clampToViewport(getDefaultPoint());
    positionRef.current = defaultPoint;
    targetRef.current = defaultPoint;
    cursorRef.current = defaultPoint;
    latestFrameTimeRef.current = null;
    setMovingDisplay(false);

    const handlePointerMove = (event: PointerEvent) => {
      cursorRef.current = {
        x: event.clientX,
        y: event.clientY,
      };
      targetRef.current = clampToViewport({
        x: event.clientX + BLOB_CURSOR_OFFSET,
        y: event.clientY + BLOB_CURSOR_OFFSET,
      });
    };

    const handleResize = () => {
      positionRef.current = clampToViewport(positionRef.current);
      targetRef.current = clampToViewport(targetRef.current);
    };

    const renderPosition = (point: Point) => {
      if (!blobRef.current) {
        return;
      }

      blobRef.current.style.transform = `translate3d(${point.x - BLOB_SIZE / 2}px, ${
        point.y - BLOB_SIZE / 2
      }px, 0)`;

      if (reachImageRef.current) {
        reachImageRef.current.style.transform = point.x < cursorRef.current.x ? "scaleX(-1)" : "scaleX(1)";
      }
    };

    const updatePosition = (frameTime: number) => {
      const latestFrameTime = latestFrameTimeRef.current ?? frameTime;
      const elapsedSeconds = Math.min((frameTime - latestFrameTime) / 1000, MAX_FRAME_DELTA_SECONDS);
      latestFrameTimeRef.current = frameTime;

      const position = positionRef.current;
      const target = targetRef.current;
      const dx = target.x - position.x;
      const dy = target.y - position.y;
      const distance = Math.hypot(dx, dy);

      if (distance <= STOP_DISTANCE_PX) {
        positionRef.current = target;
        renderPosition(target);
        setMovingDisplay(false);
      } else {
        const step = Math.min(distance, BLOB_SPEED_PX_PER_SECOND * elapsedSeconds);
        const nextPosition = {
          x: position.x + (dx / distance) * step,
          y: position.y + (dy / distance) * step,
        };

        positionRef.current = nextPosition;
        renderPosition(nextPosition);
        setMovingDisplay(true);
      }

      animationFrameId = window.requestAnimationFrame(updatePosition);
    };

    let animationFrameId = window.requestAnimationFrame(updatePosition);

    renderPosition(defaultPoint);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("resize", handleResize);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("resize", handleResize);
    };
  }, [isEnabled]);

  if (!isEnabled) {
    return null;
  }

  return (
    <div
      ref={blobRef}
      className="pointer-events-none fixed left-0 top-0 z-[2147483647] h-14 w-14 select-none will-change-transform"
      aria-hidden="true"
    >
      <Image
        ref={reachImageRef}
        src="/images/achievements/blob-reach.gif"
        alt=""
        width={BLOB_SIZE}
        height={BLOB_SIZE}
        className="absolute inset-0 h-14 w-14 object-contain opacity-0 drop-shadow-lg"
        draggable={false}
        unoptimized
      />
      <Image
        ref={partyImageRef}
        src="/images/achievements/party-blob.gif"
        alt=""
        width={BLOB_SIZE}
        height={BLOB_SIZE}
        className="absolute inset-0 h-14 w-14 object-contain opacity-100 drop-shadow-lg"
        draggable={false}
        unoptimized
      />
    </div>
  );
}
