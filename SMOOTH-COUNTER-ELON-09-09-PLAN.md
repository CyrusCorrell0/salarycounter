# Smooth counter + Elon comparison (09-09)

## Scope
1. Earnings and stopwatch update continuously instead of once per second.
2. New card: how long Elon Musk (~$40M/hr in 2025) needs to earn the current session's earnings.

## Research (src/pages/index.tsx)
- index.tsx:5-9 `TimerState` stores `elapsedSeconds` as an integer. Change needed: store `elapsedMs`.
- index.tsx:75-93 timer effect uses `setInterval(..., 1000)` and `Math.floor(... / 1000)`. Change needed: `requestAnimationFrame` loop, no flooring. Time is still derived from `Date.now() - startTime`, so background tabs do not drift.
- index.tsx:11-19 `formatTime` takes whole seconds. Change needed: callers pass `Math.floor(elapsedMs / 1000)`.
- index.tsx:30-32 `calculateEarnings` takes seconds. Change needed: accept ms, `(wage / 3_600_000) * ms`.
- index.tsx:102-110 `handleStart` rebuilds `startTime` from `elapsedSeconds * 1000`. Change needed: use `elapsedMs`.
- index.tsx:261-263 earnings display shows 2 decimals. At $25/hr a cent takes 1.4 s, so the display would still tick. Change needed: append two sub-cent digits in a smaller muted span so movement is continuous at any wage.
- index.tsx:302 after the Earnings card. Change needed: insert the Elon card.

## Elon card design
- Constant `ELON_HOURLY = 40_000_000`.
- `elonSeconds = currentEarnings / (ELON_HOURLY / 3600)`.
- Headline: the time Elon needs, formatted with a unit that fits (ms, s, min).
- Visualization: a meter filling toward the smallest human-scale moment that is longer than `elonSeconds` (a blink 0.15 s, a heartbeat 0.8 s, a deep breath 4 s, tying shoes 20 s, brushing teeth 120 s, a pop song 200 s, a coffee break 900 s, a lunch break 3600 s, an 8 hour shift 28800 s). Label reads "X% of a blink".
- Secondary line: what Elon earned during the same elapsed time.
- Rendered with the existing `card` and gray/green Tailwind classes, dark mode included.

## Not doing
- No new dependencies, no new files beyond this plan.
- No sub-agent fan-out: the change is about 120 lines in one file.
