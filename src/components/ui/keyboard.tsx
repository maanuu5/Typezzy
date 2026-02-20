"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { cn } from "@/lib/utils";
import {
  IconBrightnessDown,
  IconBrightnessUp,
  IconCaretRightFilled,
  IconCaretUpFilled,
  IconChevronUp,
  IconMicrophone,
  IconMoon,
  IconPlayerSkipForward,
  IconPlayerTrackNext,
  IconPlayerTrackPrev,
  IconTable,
  IconVolume,
  IconVolume2,
  IconVolume3,
  IconSearch,
  IconWorld,
  IconCommand,
  IconCaretLeftFilled,
  IconCaretDownFilled,
} from "@tabler/icons-react";

// Sound sprite definitions [startMs, durationMs]
const SOUND_DEFINES_DOWN: Record<string, [number, number]> = {
  Escape: [2894, 113], F1: [3610, 98], F2: [4210, 90], F3: [4758, 90],
  F4: [5250, 100], F5: [5831, 105], F6: [6396, 105], F7: [6900, 105],
  F8: [7443, 111], F9: [7955, 91], F10: [8504, 105], F11: [9046, 94],
  F12: [9582, 96], Backquote: [12476, 100], Digit1: [12946, 96],
  Digit2: [13470, 95], Digit3: [13963, 100], Digit4: [14481, 102],
  Digit5: [14994, 94], Digit6: [15505, 109], Digit7: [15990, 97],
  Digit8: [16529, 92], Digit9: [17012, 103], Digit0: [17550, 87],
  Minus: [18052, 93], Equal: [18553, 89], Backspace: [19065, 110],
  Tab: [21734, 119], KeyQ: [22245, 95], KeyW: [22790, 89],
  KeyE: [23317, 83], KeyR: [23817, 92], KeyT: [24297, 92],
  KeyY: [24811, 93], KeyU: [25313, 95], KeyI: [25795, 91],
  KeyO: [26309, 84], KeyP: [26804, 83], BracketLeft: [27330, 85],
  BracketRight: [27883, 99], Backslash: [28393, 100], CapsLock: [31011, 126],
  KeyA: [31542, 85], KeyS: [32031, 88], KeyD: [32492, 85],
  KeyF: [32973, 87], KeyG: [33453, 94], KeyH: [33986, 93],
  KeyJ: [34425, 88], KeyK: [34932, 90], KeyL: [35410, 95],
  Semicolon: [35914, 95], Quote: [36428, 87], Enter: [36902, 117],
  ShiftLeft: [38136, 133], KeyZ: [38694, 80], KeyX: [39148, 76],
  KeyC: [39632, 95], KeyV: [40136, 94], KeyB: [40621, 107],
  KeyN: [41103, 90], KeyM: [41610, 93], Comma: [42110, 92],
  Period: [42594, 90], Slash: [43105, 95], ShiftRight: [43565, 137],
  Fn: [44251, 110], ControlLeft: [45327, 83], AltLeft: [45750, 82],
  MetaLeft: [46199, 100], Space: [51541, 144], MetaRight: [47929, 75],
  AltRight: [49329, 82], ArrowUp: [44251, 110], ArrowLeft: [49837, 88],
  ArrowDown: [50333, 90], ArrowRight: [50783, 111],
};

const SOUND_DEFINES_UP: Record<string, [number, number]> = {
  Escape: [2894 + 120, 100], F1: [3610 + 100, 90], F2: [4210 + 95, 80],
  F3: [4758 + 95, 80], F4: [5250 + 105, 90], F5: [5831 + 110, 95],
  F6: [6396 + 110, 95], F7: [6900 + 110, 95], F8: [7443 + 115, 100],
  F9: [7955 + 95, 80], F10: [8504 + 110, 95], F11: [9046 + 100, 85],
  F12: [9582 + 100, 85], Backquote: [12476 + 105, 90],
  Digit1: [12946 + 100, 85], Digit2: [13470 + 100, 85],
  Digit3: [13963 + 105, 90], Digit4: [14481 + 110, 90],
  Digit5: [14994 + 100, 85], Digit6: [15505 + 115, 100],
  Digit7: [15990 + 100, 90], Digit8: [16529 + 95, 85],
  Digit9: [17012 + 110, 90], Digit0: [17550 + 90, 80],
  Minus: [18052 + 100, 85], Equal: [18553 + 90, 85],
  Backspace: [19065 + 115, 100], Tab: [21734 + 125, 110],
  KeyQ: [22245 + 100, 85], KeyW: [22790 + 90, 85],
  KeyE: [23317 + 85, 80], KeyR: [23817 + 95, 85],
  KeyT: [24297 + 95, 85], KeyY: [24811 + 100, 85],
  KeyU: [25313 + 100, 85], KeyI: [25795 + 95, 85],
  KeyO: [26309 + 85, 80], KeyP: [26804 + 85, 80],
  BracketLeft: [27330 + 85, 80], BracketRight: [27883 + 105, 90],
  Backslash: [28393 + 105, 90], CapsLock: [31011 + 135, 110],
  KeyA: [31542 + 90, 80], KeyS: [32031 + 90, 80],
  KeyD: [32492 + 85, 80], KeyF: [32973 + 90, 80],
  KeyG: [33453 + 100, 85], KeyH: [33986 + 95, 85],
  KeyJ: [34425 + 90, 85], KeyK: [34932 + 95, 85],
  KeyL: [35410 + 100, 85], Semicolon: [35914 + 100, 85],
  Quote: [36428 + 90, 80], Enter: [36902 + 125, 105],
  ShiftLeft: [38136 + 140, 120], KeyZ: [38694 + 85, 75],
  KeyX: [39148 + 80, 70], KeyC: [39632 + 100, 85],
  KeyV: [40136 + 100, 85], KeyB: [40621 + 115, 95],
  KeyN: [41103 + 95, 85], KeyM: [41610 + 100, 85],
  Comma: [42110 + 95, 85], Period: [42594 + 95, 85],
  Slash: [43105 + 100, 85], ShiftRight: [43565 + 145, 125],
  Fn: [44251 + 115, 100], ControlLeft: [45327 + 85, 80],
  AltLeft: [45750 + 85, 80], MetaLeft: [46199 + 105, 90],
  Space: [51541 + 150, 130], MetaRight: [47929 + 75, 70],
  AltRight: [49329 + 85, 80], ArrowUp: [44251 + 115, 100],
  ArrowLeft: [49837 + 90, 85], ArrowDown: [50333 + 95, 80],
  ArrowRight: [50783 + 115, 100],
};

/* ------------------------------------------------------------------ */
/*  Context — only exposes sound functions; highlighting is pure DOM   */
/* ------------------------------------------------------------------ */

interface KeyboardContextType {
  playSoundDown: (keyCode: string) => void;
  playSoundUp: (keyCode: string) => void;
}

const KeyboardContext = createContext<KeyboardContextType | null>(null);

const useKeyboardContext = () => {
  const ctx = useContext(KeyboardContext);
  if (!ctx) throw new Error("useKeyboardContext must be inside KeyboardProvider");
  return ctx;
};

/* ------------------------------------------------------------------ */
/*  Provider — sound + direct-DOM key highlighting                     */
/* ------------------------------------------------------------------ */

const KeyboardProvider = ({
  children,
  enableSound = false,
  containerRef,
  onKeyDown,
  onKeyUp,
}: {
  children: React.ReactNode;
  enableSound?: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onKeyDown?: (e: KeyboardEvent) => void;
  onKeyUp?: (e: KeyboardEvent) => void;
}) => {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioBufRef = useRef<AudioBuffer | null>(null);
  const readyRef = useRef(false);

  const onKeyDownRef = useRef(onKeyDown);
  const onKeyUpRef = useRef(onKeyUp);
  useEffect(() => { onKeyDownRef.current = onKeyDown; }, [onKeyDown]);
  useEffect(() => { onKeyUpRef.current = onKeyUp; }, [onKeyUp]);

  // Eagerly fetch + decode sound sprite so it's ready before first keypress
  useEffect(() => {
    if (!enableSound) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/sounds/sound.ogg");
        if (!res.ok || cancelled) return;
        const data = await res.arrayBuffer();
        if (cancelled) return;
        const ctx = new AudioContext();
        const buf = await ctx.decodeAudioData(data);
        if (cancelled) { ctx.close(); return; }
        audioCtxRef.current = ctx;
        audioBufRef.current = buf;
        readyRef.current = true;
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [enableSound]);

  const playSprite = useCallback(
    (defs: Record<string, [number, number]>, keyCode: string) => {
      if (!enableSound || !audioCtxRef.current || !audioBufRef.current) return;
      const def = defs[keyCode];
      if (!def) return;
      try {
        if (audioCtxRef.current.state === "suspended") audioCtxRef.current.resume();
        const src = audioCtxRef.current.createBufferSource();
        src.buffer = audioBufRef.current;
        src.connect(audioCtxRef.current.destination);
        src.start(0, def[0] / 1000, def[1] / 1000);
      } catch {}
    },
    [enableSound]
  );

  const playSoundDown = useCallback(
    (k: string) => playSprite(SOUND_DEFINES_DOWN, k),
    [playSprite]
  );
  const playSoundUp = useCallback(
    (k: string) => playSprite(SOUND_DEFINES_UP, k),
    [playSprite]
  );

  /* ---------- Direct DOM highlight helpers ---------- */

  const highlightKey = useCallback((keyCode: string) => {
    const el = containerRef.current?.querySelector(
      `[data-keycode="${keyCode}"]`
    );
    if (el) el.classList.add("key-pressed");
  }, [containerRef]);

  const unhighlightKey = useCallback((keyCode: string) => {
    const el = containerRef.current?.querySelector(
      `[data-keycode="${keyCode}"]`
    );
    if (el) el.classList.remove("key-pressed");
  }, [containerRef]);

  /* ---------- Document-level keyboard event listeners ---------- */

  useEffect(() => {
    const handleDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const code = e.code;
      // Resume AudioContext on first user gesture (browsers require this)
      if (enableSound && audioCtxRef.current?.state === "suspended") {
        audioCtxRef.current.resume();
      }
      playSoundDown(code);
      highlightKey(code);
      onKeyDownRef.current?.(e);
    };

    const handleUp = (e: KeyboardEvent) => {
      const code = e.code;
      playSoundUp(code);
      unhighlightKey(code);
      onKeyUpRef.current?.(e);
    };

    document.addEventListener("keydown", handleDown);
    document.addEventListener("keyup", handleUp);
    return () => {
      document.removeEventListener("keydown", handleDown);
      document.removeEventListener("keyup", handleUp);
    };
  }, [playSoundDown, playSoundUp, highlightKey, unhighlightKey, enableSound]);

  const ctxValue = useMemo(
    () => ({ playSoundDown, playSoundUp }),
    [playSoundDown, playSoundUp]
  );

  return (
    <KeyboardContext.Provider value={ctxValue}>
      {children}
    </KeyboardContext.Provider>
  );
};

/* ------------------------------------------------------------------ */
/*  Keyboard (public export)                                           */
/* ------------------------------------------------------------------ */

export const Keyboard = ({
  className,
  enableSound = false,
  onKeyDown,
  onKeyUp,
}: {
  className?: string;
  enableSound?: boolean;
  onKeyDown?: (e: KeyboardEvent) => void;
  onKeyUp?: (e: KeyboardEvent) => void;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <KeyboardProvider
      enableSound={enableSound}
      containerRef={containerRef}
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
    >
      <div
        ref={containerRef}
        className={cn(
          "mx-auto w-fit [zoom:0.8] sm:[zoom:1] md:[zoom:1.2] lg:[zoom:1.4] xl:[zoom:1.6]",
          className
        )}
      >
        <Keypad />
      </div>
    </KeyboardProvider>
  );
};

/* ------------------------------------------------------------------ */
/*  Keypad layout                                                      */
/* ------------------------------------------------------------------ */

export const Keypad = React.memo(() => {
  return (
    <div className="h-full w-fit rounded-xl bg-[#111318] p-1 shadow-sm ring-1 shadow-black/30 ring-white/[0.03]">
      {/* Function Row */}
      <Row>
        <Key
          keyCode="Escape"
          containerClassName="rounded-tl-xl"
          className="w-10 rounded-tl-lg"
          childrenClassName="items-start justify-end pb-[2px] pl-[4px]"
        >
          <span>esc</span>
        </Key>
        <Key keyCode="F1">
          <IconBrightnessDown className="h-[6px] w-[6px]" />
          <span className="mt-1">F1</span>
        </Key>
        <Key keyCode="F2">
          <IconBrightnessUp className="h-[6px] w-[6px]" />
          <span className="mt-1">F2</span>
        </Key>
        <Key keyCode="F3">
          <IconTable className="h-[6px] w-[6px]" />
          <span className="mt-1">F3</span>
        </Key>
        <Key keyCode="F4">
          <IconSearch className="h-[6px] w-[6px]" />
          <span className="mt-1">F4</span>
        </Key>
        <Key keyCode="F5">
          <IconMicrophone className="h-[6px] w-[6px]" />
          <span className="mt-1">F5</span>
        </Key>
        <Key keyCode="F6">
          <IconMoon className="h-[6px] w-[6px]" />
          <span className="mt-1">F6</span>
        </Key>
        <Key keyCode="F7">
          <IconPlayerTrackPrev className="h-[6px] w-[6px]" />
          <span className="mt-1">F7</span>
        </Key>
        <Key keyCode="F8">
          <IconPlayerSkipForward className="h-[6px] w-[6px]" />
          <span className="mt-1">F8</span>
        </Key>
        <Key keyCode="F9">
          <IconPlayerTrackNext className="h-[6px] w-[6px]" />
          <span className="mt-1">F9</span>
        </Key>
        <Key keyCode="F10">
          <IconVolume3 className="h-[6px] w-[6px]" />
          <span className="mt-1">F10</span>
        </Key>
        <Key keyCode="F11">
          <IconVolume2 className="h-[6px] w-[6px]" />
          <span className="mt-1">F11</span>
        </Key>
        <Key keyCode="F12">
          <IconVolume className="h-[6px] w-[6px]" />
          <span className="mt-1">F12</span>
        </Key>
        <Key containerClassName="rounded-tr-xl" className="rounded-tr-lg">
          <div className="h-4 w-4 rounded-full bg-gradient-to-b from-[#1a1d27] via-[#111318] to-[#1a1d27] p-px">
            <div className="h-full w-full rounded-full bg-[#08090d]" />
          </div>
        </Key>
      </Row>

      {/* Number Row */}
      <Row>
        <Key keyCode="Backquote">
          <span>~</span>
          <span>`</span>
        </Key>
        <Key keyCode="Digit1"><span>!</span><span>1</span></Key>
        <Key keyCode="Digit2"><span>@</span><span>2</span></Key>
        <Key keyCode="Digit3"><span>#</span><span>3</span></Key>
        <Key keyCode="Digit4"><span>$</span><span>4</span></Key>
        <Key keyCode="Digit5"><span>%</span><span>5</span></Key>
        <Key keyCode="Digit6"><span>^</span><span>6</span></Key>
        <Key keyCode="Digit7"><span>&</span><span>7</span></Key>
        <Key keyCode="Digit8"><span>*</span><span>8</span></Key>
        <Key keyCode="Digit9"><span>(</span><span>9</span></Key>
        <Key keyCode="Digit0"><span>)</span><span>0</span></Key>
        <Key keyCode="Minus"><span>—</span><span>_</span></Key>
        <Key keyCode="Equal"><span>+</span><span>=</span></Key>
        <Key
          keyCode="Backspace"
          className="w-10"
          childrenClassName="items-end justify-end pr-[4px] pb-[2px]"
        >
          <span>delete</span>
        </Key>
      </Row>

      {/* QWERTY Row */}
      <Row>
        <Key
          keyCode="Tab"
          className="w-10"
          childrenClassName="items-start justify-end pb-[2px] pl-[4px]"
        >
          <span>tab</span>
        </Key>
        {["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"].map((l) => (
          <Key key={l} keyCode={`Key${l}`}>{l}</Key>
        ))}
        <Key keyCode="BracketLeft"><span>{`{`}</span><span>{`[`}</span></Key>
        <Key keyCode="BracketRight"><span>{`}`}</span><span>{`]`}</span></Key>
        <Key keyCode="Backslash"><span>{`|`}</span><span>{`\\`}</span></Key>
      </Row>

      {/* Home Row */}
      <Row>
        <Key
          keyCode="CapsLock"
          className="w-[2.8rem]"
          childrenClassName="items-start justify-end pb-[2px] pl-[4px]"
        >
          <span>caps lock</span>
        </Key>
        {["A", "S", "D", "F", "G", "H", "J", "K", "L"].map((l) => (
          <Key key={l} keyCode={`Key${l}`}>{l}</Key>
        ))}
        <Key keyCode="Semicolon"><span>:</span><span>;</span></Key>
        <Key keyCode="Quote"><span>{`"`}</span><span>{`'`}</span></Key>
        <Key
          keyCode="Enter"
          className="w-[2.85rem]"
          childrenClassName="items-end justify-end pr-[4px] pb-[2px]"
        >
          <span>return</span>
        </Key>
      </Row>

      {/* Bottom Letter Row */}
      <Row>
        <Key
          keyCode="ShiftLeft"
          className="w-[3.65rem]"
          childrenClassName="items-start justify-end pb-[2px] pl-[4px]"
        >
          <span>shift</span>
        </Key>
        {["Z", "X", "C", "V", "B", "N", "M"].map((l) => (
          <Key key={l} keyCode={`Key${l}`}>{l}</Key>
        ))}
        <Key keyCode="Comma"><span>{`<`}</span><span>,</span></Key>
        <Key keyCode="Period"><span>{`>`}</span><span>.</span></Key>
        <Key keyCode="Slash"><span>?</span><span>/</span></Key>
        <Key
          keyCode="ShiftRight"
          className="w-[3.65rem]"
          childrenClassName="items-end justify-end pr-[4px] pb-[2px]"
        >
          <span>shift</span>
        </Key>
      </Row>

      {/* Modifier Row */}
      <Row>
        <ModifierKey
          keyCode="Fn"
          containerClassName="rounded-bl-xl"
          className="rounded-bl-lg"
        >
          <span>fn</span>
          <IconWorld className="h-[6px] w-[6px]" />
        </ModifierKey>
        <ModifierKey keyCode="ControlLeft">
          <IconChevronUp className="h-[6px] w-[6px]" />
          <span>control</span>
        </ModifierKey>
        <ModifierKey keyCode="AltLeft">
          <OptionKey className="h-[6px] w-[6px]" />
          <span>option</span>
        </ModifierKey>
        <ModifierKey keyCode="MetaLeft" className="w-8">
          <IconCommand className="h-[6px] w-[6px]" />
          <span>command</span>
        </ModifierKey>
        <Key keyCode="Space" className="w-[8.2rem]" />
        <ModifierKey keyCode="MetaRight" className="w-8">
          <IconCommand className="h-[6px] w-[6px]" />
          <span>command</span>
        </ModifierKey>
        <ModifierKey keyCode="AltRight">
          <OptionKey className="h-[6px] w-[6px]" />
          <span>option</span>
        </ModifierKey>
        {/* Arrow Keys */}
        <div className="flex h-6 w-[4.9rem] items-center justify-end rounded-[4px] p-[0.5px]">
          <Key keyCode="ArrowLeft" className="h-6 w-6">
            <IconCaretLeftFilled className="h-[6px] w-[6px]" />
          </Key>
          <div className="flex flex-col">
            <Key keyCode="ArrowUp" className="h-3 w-6">
              <IconCaretUpFilled className="h-[6px] w-[6px]" />
            </Key>
            <Key keyCode="ArrowDown" className="h-3 w-6">
              <IconCaretDownFilled className="h-[6px] w-[6px]" />
            </Key>
          </div>
          <Key
            keyCode="ArrowRight"
            containerClassName="rounded-br-xl"
            className="h-6 w-6 rounded-br-lg"
          >
            <IconCaretRightFilled className="h-[6px] w-[6px]" />
          </Key>
        </div>
      </Row>
    </div>
  );
});
Keypad.displayName = "Keypad";

/* ------------------------------------------------------------------ */
/*  Primitives                                                         */
/* ------------------------------------------------------------------ */

const Row = ({ children }: { children: React.ReactNode }) => (
  <div className="mb-[2px] flex w-full shrink-0 gap-[2px]">{children}</div>
);

/**
 * Key — no React state for pressed/highlight.
 * The `data-keycode` attribute lets the Provider's event handler
 * toggle `.key-pressed` directly on the DOM node (zero latency).
 * Mouse interactions also use direct classList manipulation.
 */
const Key = ({
  className,
  childrenClassName,
  containerClassName,
  children,
  keyCode,
}: {
  className?: string;
  childrenClassName?: string;
  containerClassName?: string;
  children?: React.ReactNode;
  keyCode?: string;
}) => {
  const { playSoundDown, playSoundUp } = useKeyboardContext();

  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (keyCode) {
      playSoundDown(keyCode);
      e.currentTarget.classList.add("key-pressed");
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (keyCode) {
      playSoundUp(keyCode);
      e.currentTarget.classList.remove("key-pressed");
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (keyCode) e.currentTarget.classList.remove("key-pressed");
  };

  return (
    <div className={cn("rounded-[4px] p-[0.5px]", containerClassName)}>
      <button
        type="button"
        data-keycode={keyCode}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        className={cn(
          "kb-key flex h-6 w-6 cursor-pointer items-center justify-center rounded-[3.5px] bg-[#1a1d27] shadow-[0px_0px_1px_0px_rgba(255,255,255,0.04),0px_1px_2px_0px_rgba(0,0,0,0.4),0px_1px_0px_0px_rgba(255,255,255,0.03)_inset] transition-all duration-75",
          className
        )}
      >
        <div
          className={cn(
            "kb-key-inner flex h-full w-full flex-col items-center justify-center text-[5px] text-[#5b6078]",
            childrenClassName
          )}
        >
          {children}
        </div>
      </button>
    </div>
  );
};

const ModifierKey = ({
  className,
  containerClassName,
  children,
  keyCode,
}: {
  className?: string;
  containerClassName?: string;
  children?: React.ReactNode;
  keyCode?: string;
}) => {
  const { playSoundDown, playSoundUp } = useKeyboardContext();

  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (keyCode) {
      playSoundDown(keyCode);
      e.currentTarget.classList.add("key-pressed");
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (keyCode) {
      playSoundUp(keyCode);
      e.currentTarget.classList.remove("key-pressed");
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (keyCode) e.currentTarget.classList.remove("key-pressed");
  };

  return (
    <div className={cn("rounded-[4px] p-[0.5px]", containerClassName)}>
      <button
        type="button"
        data-keycode={keyCode}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        className={cn(
          "kb-key flex h-6 w-6 cursor-pointer items-center justify-center rounded-[3.5px] bg-[#1a1d27] shadow-[0px_0px_1px_0px_rgba(255,255,255,0.04),0px_1px_2px_0px_rgba(0,0,0,0.4),0px_1px_0px_0px_rgba(255,255,255,0.03)_inset] transition-all duration-75",
          className
        )}
      >
        <div className="kb-key-inner flex h-full w-full flex-col items-start justify-between p-1 text-[5px] text-[#5b6078]">
          {children}
        </div>
      </button>
    </div>
  );
};

const OptionKey = ({ className }: { className?: string }) => (
  <svg
    fill="none"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 32 32"
    className={className}
  >
    <rect stroke="currentColor" strokeWidth={2} x="18" y="5" width="10" height="2" />
    <polygon
      stroke="currentColor"
      strokeWidth={2}
      points="10.6,5 4,5 4,7 9.4,7 18.4,27 28,27 28,25 19.6,25"
    />
  </svg>
);
