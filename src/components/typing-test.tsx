"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Keyboard } from "@/components/ui/keyboard";

const WORDS = [
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "it",
  "for", "not", "on", "with", "he", "as", "you", "do", "at", "this",
  "but", "his", "by", "from", "they", "we", "say", "her", "she", "or",
  "an", "will", "my", "one", "all", "would", "there", "their", "what",
  "so", "up", "out", "if", "about", "who", "get", "which", "go", "me",
  "when", "make", "can", "like", "time", "no", "just", "him", "know",
  "take", "people", "into", "year", "your", "good", "some", "could",
  "them", "see", "other", "than", "then", "now", "look", "only", "come",
  "its", "over", "think", "also", "back", "after", "use", "two", "how",
  "our", "work", "first", "well", "way", "even", "new", "want", "because",
  "any", "these", "give", "day", "most", "us", "great", "between", "need",
  "large", "often", "hand", "high", "place", "hold", "left", "end", "play",
  "turn", "move", "right", "still", "own", "point", "form", "group", "head",
  "long", "made", "word", "home", "read", "self", "fact", "world", "near",
  "build", "case", "both", "real", "part", "field", "power", "same", "city",
  "much", "keep", "help", "start", "show", "every", "side", "being", "house",
];

const TIME_OPTIONS = [15, 30, 60, 120] as const;
type TimeOption = (typeof TIME_OPTIONS)[number];

function getWordCount(seconds: number): number {
  return Math.ceil(seconds * 2.5);
}

function generateText(count: number): string {
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    out.push(WORDS[Math.floor(Math.random() * WORDS.length)]);
  }
  return out.join(" ");
}

type State = "idle" | "typing" | "done";

/* ---------------------------------------------------------- */
/*  WPM Graph (SVG)                                            */
/* ---------------------------------------------------------- */

interface WpmSample { sec: number; wpm: number; errors: number }

function WpmGraph({ samples, maxSec }: { samples: WpmSample[]; maxSec: number }) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; sample: WpmSample } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  if (samples.length < 2) return null;

  const W = 520, H = 180, PL = 38, PR = 12, PT = 16, PB = 26;
  const gw = W - PL - PR, gh = H - PT - PB;

  const maxWpm = Math.max(30, ...samples.map((s) => s.wpm));
  const ceilWpm = Math.ceil(maxWpm / 20) * 20;

  const toX = (sec: number) => PL + (sec / maxSec) * gw;
  const toY = (wpm: number) => PT + gh - (wpm / ceilWpm) * gh;

  // Horizontal grid
  const gridLines: number[] = [];
  const step = ceilWpm <= 60 ? 15 : ceilWpm <= 120 ? 20 : 30;
  for (let v = 0; v <= ceilWpm; v += step) gridLines.push(v);

  // X-axis labels
  const xStep = maxSec <= 15 ? 3 : maxSec <= 30 ? 5 : maxSec <= 60 ? 10 : 20;
  const xLabels: number[] = [];
  for (let v = xStep; v <= maxSec; v += xStep) xLabels.push(v);

  // Build path data
  const linePath = samples.map((s, i) => `${i === 0 ? "M" : "L"}${toX(s.sec)},${toY(s.wpm)}`).join(" ");

  // Handle hover on dots
  const handleDotEnter = (e: React.MouseEvent<SVGCircleElement>, s: WpmSample) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const svgX = e.clientX - rect.left;
    const svgY = e.clientY - rect.top;
    setTooltip({ x: svgX, y: svgY, sample: s });
  };

  return (
    <div className="relative w-full max-w-[560px]">
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="xMidYMid meet"
        onMouseLeave={() => setTooltip(null)}>
        {/* Grid lines */}
        {gridLines.map((v) => (
          <g key={v}>
            <line x1={PL} x2={W - PR} y1={toY(v)} y2={toY(v)} stroke="#2c2c2e" strokeWidth={1} />
            <text x={PL - 6} y={toY(v) + 3} textAnchor="end" className="fill-[#646669] text-[8px] font-mono">{v}</text>
          </g>
        ))}

        {/* X-axis labels */}
        {xLabels.map((v) => (
          <text key={`x-${v}`} x={toX(v)} y={H - 4} textAnchor="middle" className="fill-[#646669] text-[8px] font-mono">{v}s</text>
        ))}

        {/* Y-axis label */}
        <text x={6} y={PT + gh / 2} textAnchor="middle" className="fill-[#646669] text-[7px] font-mono" transform={`rotate(-90,6,${PT + gh / 2})`}>WPM</text>

        {/* Smooth line — gradient stroke via segments */}
        <path d={linePath} fill="none" stroke="#6ee7b7" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" opacity={0.25} />

        {/* Color-coded segments on top */}
        {samples.slice(1).map((s, i) => (
          <line
            key={`seg-${i}`}
            x1={toX(samples[i].sec)} y1={toY(samples[i].wpm)}
            x2={toX(s.sec)} y2={toY(s.wpm)}
            stroke={s.errors > 0 ? "#ca4754" : "#6ee7b7"}
            strokeWidth={2}
            strokeLinecap="round"
          />
        ))}

        {/* Dots */}
        {samples.map((s, i) => (
          <circle
            key={i}
            cx={toX(s.sec)}
            cy={toY(s.wpm)}
            r={s.errors > 0 ? 4.5 : 3}
            fill={s.errors > 0 ? "#ca4754" : "#6ee7b7"}
            className={s.errors > 0 ? "cursor-pointer" : ""}
            onMouseEnter={(e) => s.errors > 0 ? handleDotEnter(e, s) : undefined}
            onMouseLeave={() => setTooltip(null)}
          />
        ))}

        {/* Invisible larger hit areas for error dots */}
        {samples.filter((s) => s.errors > 0).map((s, i) => (
          <circle
            key={`hit-${i}`}
            cx={toX(s.sec)}
            cy={toY(s.wpm)}
            r={12}
            fill="transparent"
            className="cursor-pointer"
            onMouseEnter={(e) => handleDotEnter(e, s)}
            onMouseLeave={() => setTooltip(null)}
          />
        ))}
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="absolute pointer-events-none z-10 bg-[#2c2c2e] border border-[#3a3a3c] rounded-lg px-3 py-2 shadow-lg"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: "translate(-50%, -120%)",
          }}
        >
          <div className="flex flex-col gap-0.5 text-xs font-mono whitespace-nowrap">
            <span className="text-[#d1d0c5]">{tooltip.sample.wpm} wpm at {tooltip.sample.sec}s</span>
            <span className="text-[#ca4754] font-semibold">{tooltip.sample.errors} {tooltip.sample.errors === 1 ? "error" : "errors"} in this interval</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------- */
/*  Main Component                                             */
/* ---------------------------------------------------------- */

export default function TypingTest() {
  const [duration, setDuration] = useState<TimeOption>(30);
  const [text, setText] = useState("");
  const [input, setInput] = useState("");
  const [state, setState] = useState<State>("idle");
  const [start, setStart] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [cursorOn, setCursorOn] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [wpmHistory, setWpmHistory] = useState<WpmSample[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // refs for stable event handler
  const inputRef = useRef(input);
  const textRef = useRef(text);
  const stateRef = useRef(state);
  const correctRef = useRef(correct);
  const incorrectRef = useRef(incorrect);
  const durationRef = useRef(duration);
  const lastSampleCorrect = useRef(0);
  const lastSampleIncorrect = useRef(0);

  useEffect(() => { inputRef.current = input; }, [input]);
  useEffect(() => { textRef.current = text; }, [text]);
  useEffect(() => { stateRef.current = state; }, [state]);
  useEffect(() => { correctRef.current = correct; }, [correct]);
  useEffect(() => { incorrectRef.current = incorrect; }, [incorrect]);
  useEffect(() => { durationRef.current = duration; }, [duration]);

  // generate words (scaled to duration)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setText(generateText(getWordCount(duration))); }, []);

  // cursor blink
  useEffect(() => {
    if (state === "idle") {
      const id = setInterval(() => setCursorOn((v) => !v), 530);
      return () => clearInterval(id);
    }
    setCursorOn(true);
  }, [state]);

  // timer
  useEffect(() => {
    if (state !== "typing" || !start) return;
    const id = setInterval(() => {
      const left = Math.max(0, duration - (Date.now() - start) / 1000);
      setTimeLeft(Math.ceil(left));
      if (left <= 0) {
        clearInterval(id);

        // Push a final WPM sample so errors after the last periodic sample aren't lost
        const elapsed = (Date.now() - start) / 1000;
        const mins = elapsed / 60;
        const finalWpm = mins > 0 ? Math.round(correctRef.current / 5 / mins) : 0;
        const finalErrors = incorrectRef.current - lastSampleIncorrect.current;
        const finalSec = duration;
        lastSampleIncorrect.current = incorrectRef.current;
        lastSampleCorrect.current = correctRef.current;

        setWpm(finalWpm);
        setWpmHistory((prev) => {
          // Avoid duplicate if the periodic sampler already recorded this second
          if (prev.length > 0 && prev[prev.length - 1].sec === finalSec) {
            const last = prev[prev.length - 1];
            if (finalErrors > 0) {
              return [...prev.slice(0, -1), { ...last, errors: last.errors + finalErrors, wpm: finalWpm }];
            }
            return prev;
          }
          return [...prev, { sec: finalSec, wpm: finalWpm, errors: Math.max(0, finalErrors) }];
        });

        setFadeOut(true);
        setTimeout(() => setState("done"), 400);
      }
    }, 100);
    return () => clearInterval(id);
  }, [state, start, duration]);

  // live wpm + sample history
  useEffect(() => {
    if (state !== "typing" || !start) return;
    const sampleInterval = Math.max(1, Math.round(duration / 12));
    let lastRecordedSec = 0;
    const id = setInterval(() => {
      const elapsed = (Date.now() - start) / 1000;
      const mins = elapsed / 60;
      const currentWpm = mins > 0 ? Math.round(correctRef.current / 5 / mins) : 0;
      setWpm(currentWpm);

      // Sample periodically
      const sec = Math.round(elapsed);
      if (sec > 0 && sec % sampleInterval === 0 && sec !== lastRecordedSec) {
        lastRecordedSec = sec;
        // Compute delta OUTSIDE setState to avoid React strict mode double-invocation bug
        const newErrors = incorrectRef.current - lastSampleIncorrect.current;
        lastSampleIncorrect.current = incorrectRef.current;
        lastSampleCorrect.current = correctRef.current;
        setWpmHistory((prev) => [...prev, { sec, wpm: currentWpm, errors: Math.max(0, newErrors) }]);
      }
    }, 250);
    return () => clearInterval(id);
  }, [state, start, duration]);

  // Smooth transition to results after done
  useEffect(() => {
    if (state === "done") {
      // Double rAF ensures browser paints opacity-0 first, then triggers transition
      const raf1 = requestAnimationFrame(() => {
        const raf2 = requestAnimationFrame(() => setShowResults(true));
        return () => cancelAnimationFrame(raf2);
      });
      return () => cancelAnimationFrame(raf1);
    }
    setShowResults(false);
    setFadeOut(false);
  }, [state]);

  // auto-scroll
  useEffect(() => {
    if (!scrollRef.current) return;
    const el = scrollRef.current.querySelector("[data-cursor]");
    if (el) {
      const cr = el.getBoundingClientRect();
      const pr = scrollRef.current.getBoundingClientRect();
      if (cr.top > pr.top + pr.height * 0.55) {
        scrollRef.current.scrollTop += cr.top - pr.top - pr.height * 0.3;
      }
    }
  }, [input]);

  const reset = useCallback(() => {
    setText(generateText(getWordCount(durationRef.current)));
    setInput("");
    setState("idle");
    setStart(null);
    setTimeLeft(durationRef.current);
    setWpm(0);
    setAccuracy(100);
    setCorrect(0);
    setIncorrect(0);
    setWpmHistory([]);
    setShowResults(false);
    setFadeOut(false);
    lastSampleCorrect.current = 0;
    lastSampleIncorrect.current = 0;
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, []);

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.code === "Tab") {
        e.preventDefault();
        reset();
        return;
      }
      if (stateRef.current === "done") {
        if (e.code === "Enter") {
          e.preventDefault();
          reset();
        }
        return;
      }

      const cur = inputRef.current;
      const txt = textRef.current;

      // backspace
      if (e.code === "Backspace") {
        e.preventDefault();
        if (cur.length > 0) {
          if (cur[cur.length - 1] === txt[cur.length - 1])
            setCorrect((c) => Math.max(0, c - 1));
          else setIncorrect((c) => Math.max(0, c - 1));
          setInput((p) => p.slice(0, -1));
        }
        return;
      }

      // ignore non-printable
      if (e.key.length > 1 && e.key !== " ") return;
      const ch = e.key === " " ? " " : e.key;
      if (ch.length !== 1) return;
      e.preventDefault();

      // start on first key
      if (stateRef.current === "idle") {
        setState("typing");
        setStart(Date.now());
      }

      setInput(cur + ch);

      if (ch === txt[cur.length]) {
        setCorrect((c) => {
          const n = c + 1;
          const inc = incorrectRef.current;
          setAccuracy(n + inc > 0 ? Math.round((n / (n + inc)) * 100) : 100);
          return n;
        });
      } else {
        setIncorrect((c) => {
          const n = c + 1;
          const cor = correctRef.current;
          setAccuracy(cor + n > 0 ? Math.round((cor / (cor + n)) * 100) : 100);
          return n;
        });
      }
    },
    [reset]
  );

  const onKeyUp = useCallback(() => {}, []);

  // render chars
  const chars = text.split("").map((ch, i) => {
    let color = "text-[#646669]";
    if (i < input.length) {
      color = input[i] === ch ? "text-[#d1d0c5]" : "text-[#ca4754]";
    }
    return (
      <span key={i} className="relative">
        {i === input.length && (
          <span
            data-cursor
            className={`absolute -left-[1px] top-0 h-full w-[2px] bg-[#6ee7b7] transition-opacity duration-100 ${
              cursorOn ? "opacity-100" : "opacity-0"
            }`}
          />
        )}
        <span className={`${color} transition-colors duration-75`}>{ch}</span>
      </span>
    );
  });

  return (
    <div className="flex flex-col items-center w-full select-none">

      {/* Top row — full width so toggle reaches the real right edge */}
      <div className="relative flex items-center justify-center w-full mb-5 min-h-[36px]">
        {/* Center: time selector (visible only when idle) */}
        {state === "idle" && (
          <div className="flex items-center gap-1 font-mono text-sm bg-[#2c2c2e] rounded-lg px-1 py-1">
            {TIME_OPTIONS.map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setDuration(t);
                    setTimeLeft(t);
                    setText(generateText(getWordCount(t)));
                    setInput("");
                    setCorrect(0);
                    setIncorrect(0);
                    setAccuracy(100);
                    if (scrollRef.current) scrollRef.current.scrollTop = 0;
                  }}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    duration === t
                      ? "bg-[#6ee7b7] text-[#1c1c1e] font-bold"
                      : "text-[#646669] hover:text-[#d1d0c5]"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          )}

        {/* Right: sound toggle — hidden on results screen */}
        {state !== "done" && (
          <button
            onClick={() => setSoundEnabled((v) => !v)}
            className={`absolute right-0 flex items-center justify-center w-9 h-9 rounded-full bg-[#2c2c2e] transition-colors ${
              soundEnabled ? "text-[#6ee7b7]" : "text-[#646669] hover:text-[#d1d0c5]"
            }`}
            title={soundEnabled ? "Mute sounds" : "Enable sounds"}
          >
            {soundEnabled ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
            )}
          </button>
        )}
      </div>

      {/* Content area — constrained width */}
      <div className="flex flex-col items-center w-full max-w-[850px] mx-auto">

      {/* ===== RESULTS SCREEN ===== */}
      {state === "done" ? (
        <div
          className={`w-full transition-opacity duration-[800ms] ease-in-out ${
            showResults ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Graph */}
          <div className="w-full flex justify-center mb-8">
            <WpmGraph samples={wpmHistory} maxSec={duration} />
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 w-full font-mono">
            <div className="bg-[#2c2c2e] rounded-xl px-5 py-4">
              <div className="text-3xl font-bold text-[#6ee7b7]">{wpm}</div>
              <div className="text-[10px] uppercase tracking-widest text-[#646669] mt-1">wpm</div>
            </div>
            <div className="bg-[#2c2c2e] rounded-xl px-5 py-4">
              <div className="text-3xl font-bold text-[#6ee7b7]">{accuracy}%</div>
              <div className="text-[10px] uppercase tracking-widest text-[#646669] mt-1">accuracy</div>
            </div>
            <div className="bg-[#2c2c2e] rounded-xl px-5 py-4">
              <div className="text-3xl font-bold text-[#d1d0c5]">
                {Math.round((correct + incorrect) / 5 / (duration / 60))}
              </div>
              <div className="text-[10px] uppercase tracking-widest text-[#646669] mt-1">raw</div>
            </div>
            <div className="bg-[#2c2c2e] rounded-xl px-5 py-4">
              <div className="text-3xl font-bold text-[#d1d0c5]">
                {wpmHistory.length >= 2
                  ? (() => {
                      const avg = wpmHistory.reduce((s, h) => s + h.wpm, 0) / wpmHistory.length;
                      const variance = wpmHistory.reduce((s, h) => s + (h.wpm - avg) ** 2, 0) / wpmHistory.length;
                      return Math.max(0, Math.round(100 - Math.sqrt(variance) / Math.max(1, avg) * 100));
                    })()
                  : 100}%
              </div>
              <div className="text-[10px] uppercase tracking-widest text-[#646669] mt-1">consistency</div>
            </div>
          </div>

          {/* Detail row */}
          <div className="flex items-center justify-center gap-8 mt-5 font-mono text-sm text-[#646669]">
            <span><span className="text-[#6ee7b7]">{correct}</span> correct</span>
            <span><span className="text-[#ca4754]">{incorrect}</span> errors</span>
            <span>{duration}s</span>
          </div>

          {/* Restart hint */}
          <div className="flex justify-center mt-6">
            <button
              onClick={reset}
              className="text-[#646669] hover:text-[#d1d0c5] transition-colors font-mono text-xs"
            >
              press enter or tab to restart
            </button>
          </div>
        </div>
      ) : (
        /* ===== TYPING SCREEN ===== */
        <div className={`w-full flex flex-col items-center transition-opacity duration-[400ms] ease-in-out ${fadeOut ? "opacity-0" : "opacity-100"}`}>
          {/* Stats bar */}
          <div className="flex items-center gap-4 mb-5 font-mono h-8">
            <span className="text-xl font-bold text-[#6ee7b7] tabular-nums">
              {timeLeft}{state === "idle" && "s"}
            </span>
            {state === "typing" && (
              <>
                <span className="text-sm text-[#646669]">{wpm} wpm</span>
                <span className="text-sm text-[#646669]">{accuracy}%</span>
              </>
            )}
          </div>

          {/* Text */}
          <div
            ref={scrollRef}
            className="w-full max-h-[5.5rem] overflow-hidden font-mono text-lg leading-relaxed tracking-wide mb-5 px-1"
          >
            {chars}
          </div>

          {/* Restart hint */}
          <button
            onClick={reset}
            className="text-[#646669] hover:text-[#d1d0c5] transition-colors font-mono text-xs mb-4"
          >
            tab to restart
          </button>

          {/* Keyboard */}
          <Keyboard enableSound={soundEnabled} onKeyDown={onKeyDown} onKeyUp={onKeyUp} />
        </div>
      )}
      </div>
    </div>
  );
}
