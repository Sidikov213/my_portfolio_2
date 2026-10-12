"use client";

import Image from "next/image";
import { useCallback, useState } from "react";

type SnakeTone = "white" | "red";

const SNAKES: Record<
  SnakeTone,
  { rest: string; tongue: string; label: string; className: string }
> = {
  white: {
    rest: "/visuals/snakes/snake-white-s-rest.png",
    tongue: "/visuals/snakes/snake-white-s-tongue.png",
    label: "Белая S-образная змея",
    className: "realistic-snake realistic-snake--white",
  },
  red: {
    rest: "/visuals/snakes/snake-red-s-rest.png",
    tongue: "/visuals/snakes/snake-red-s-tongue.png",
    label: "Красная S-образная змея",
    className: "realistic-snake realistic-snake--red",
  },
};

function SnakeButton({ tone }: { tone: SnakeTone }) {
  const snake = SNAKES[tone];
  const [pressed, setPressed] = useState(false);

  const onPointerUp = useCallback(() => {
    // Keep tongue visible briefly after tap on coarse pointers.
    if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
      setPressed(true);
      window.setTimeout(() => setPressed(false), 700);
    }
  }, []);

  return (
    <button
      type="button"
      className={`${snake.className}${pressed ? " is-pressed" : ""}`}
      aria-label={snake.label}
      onPointerUp={onPointerUp}
      onBlur={() => setPressed(false)}
    >
      <span className="realistic-snake__stage" aria-hidden>
        <Image
          src={snake.rest}
          alt=""
          fill
          sizes="(max-width: 767px) 280px, 520px"
          className="realistic-snake__frame realistic-snake__frame--rest"
          priority
          unoptimized
        />
        <Image
          src={snake.tongue}
          alt=""
          fill
          sizes="(max-width: 767px) 280px, 520px"
          className="realistic-snake__frame realistic-snake__frame--tongue"
          priority
          unoptimized
        />
      </span>
    </button>
  );
}

export function RealisticSnakes() {
  return (
    <div className="realistic-snakes" aria-hidden={false}>
      <SnakeButton tone="white" />
      <SnakeButton tone="red" />
    </div>
  );
}
