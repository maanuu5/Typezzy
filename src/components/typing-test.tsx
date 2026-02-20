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
  const scrollRef = useRef<HTMLDivElement>(null);

  // refs for stable event handler
  const inputRef = useRef(input);
  const textRef = useRef(text);
  const stateRef = useRef(state);
  const correctRef = useRef(correct);
  const incorrectRef = useRef(incorrect);
  const durationRef = useRef(duration);

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
      if (left <= 0) setState("done");
    }, 100);
    return () => clearInterval(id);
  }, [state, start, duration]);

  // live wpm
  useEffect(() => {
    if (state !== "typing" || !start) return;
    const id = setInterval(() => {
      const mins = (Date.now() - start) / 60000;
      if (mins > 0) setWpm(Math.round(correctRef.current / 5 / mins));
    }, 250);
    return () => clearInterval(id);
  }, [state, start]);

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

        {/* Right: sound toggle */}
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
      </div>

      {/* Content area — constrained width */}
      <div className="flex flex-col items-center w-full max-w-[850px] mx-auto">
      {state !== "done" ? (
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
      ) : (
        <div className="flex items-center gap-10 mb-5 font-mono">
          <div className="text-center">
            <div className="text-4xl font-bold text-[#6ee7b7]">{wpm}</div>
            <div className="text-xs text-[#646669] mt-1">wpm</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-[#6ee7b7]">{accuracy}%</div>
            <div className="text-xs text-[#646669] mt-1">accuracy</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-[#646669]">
              {correct}/{correct + incorrect}
            </div>
            <div className="text-xs text-[#646669] mt-1">chars</div>
          </div>
        </div>
      )}

      {/* Text */}
      <div
        ref={scrollRef}
        className={`w-full max-h-[5.5rem] overflow-hidden font-mono text-lg leading-relaxed tracking-wide mb-5 px-1 ${
          state === "done" ? "opacity-30 blur-[2px]" : ""
        }`}
      >
        {chars}
      </div>

      {/* Restart hint */}
      <button
        onClick={reset}
        className="text-[#646669] hover:text-[#d1d0c5] transition-colors font-mono text-xs mb-4"
      >
        {state === "done" ? "press enter to restart" : "tab to restart"}
      </button>

      {/* Keyboard */}
      <Keyboard enableSound={soundEnabled} onKeyDown={onKeyDown} onKeyUp={onKeyUp} />
      </div>
    </div>
  );
}
