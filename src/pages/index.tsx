import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { Moon, Sun } from 'lucide-react'

interface TimerState {
  isRunning: boolean
  elapsedMs: number
  startTime: number | null
}

// Elon Musk's net worth grew by roughly $40M per hour across 2025.
const ELON_HOURLY = 40_000_000
const ELON_PER_SECOND = ELON_HOURLY / 3600

// Human-scale moments, in seconds, that Elon's earning time is measured against.
const MOMENTS: { label: string; seconds: number }[] = [
  { label: 'a blink', seconds: 0.15 },
  { label: 'a heartbeat', seconds: 0.8 },
  { label: 'a deep breath', seconds: 4 },
  { label: 'tying your shoes', seconds: 20 },
  { label: 'brushing your teeth', seconds: 120 },
  { label: 'a pop song', seconds: 200 },
  { label: 'a coffee break', seconds: 900 },
  { label: 'a lunch break', seconds: 3600 },
  { label: 'an 8 hour shift', seconds: 28800 },
]

const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

// Splits an amount into its cent-precision currency string and the next two
// sub-cent digits, so the display can move continuously at any wage.
const splitCurrency = (amount: number): { dollars: string; subCents: string } => {
  const hundredths = Math.floor(amount * 10000)
  return {
    dollars: formatCurrency(Math.floor(hundredths / 100) / 100),
    subCents: (hundredths % 100).toString().padStart(2, '0')
  }
}

const formatDuration = (seconds: number): string => {
  if (seconds < 0.01) return `${(seconds * 1000).toFixed(2)} ms`
  if (seconds < 1) return `${(seconds * 1000).toFixed(seconds < 0.1 ? 1 : 0)} ms`
  if (seconds < 60) return `${seconds.toFixed(2)} s`
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ${Math.floor(seconds % 60)} s`
  return `${Math.floor(seconds / 3600)} h ${Math.floor((seconds % 3600) / 60)} min`
}

const calculateEarnings = (hourlyWage: number, elapsedMs: number): number => {
  return (hourlyWage / 3_600_000) * elapsedMs
}

const compareToElon = (earnings: number) => {
  const seconds = earnings / ELON_PER_SECOND
  const moment = MOMENTS.find(m => m.seconds >= seconds) ?? MOMENTS[MOMENTS.length - 1]
  return { seconds, moment, fraction: Math.min(seconds / moment.seconds, 1) }
}

const calculateProjections = (hourlyWage: number) => {
  const daily = hourlyWage * 8 // 8 hour work day
  const weekly = daily * 5 // 5 work days
  const monthly = weekly * 4.33 // Average weeks per month
  const yearly = monthly * 12

  return { daily, weekly, monthly, yearly }
}

// Section index + eyebrow, matching the "design engineer" indices on cyruscorrell.com.
function Section({
  index,
  label,
  children
}: {
  index: string
  label: string
  children: React.ReactNode
}) {
  return (
    <section className="border-t border-foreground/15 py-12 md:py-16">
      <p className="mono-label mb-8 text-foreground/50">
        {index} <span className="mx-2">&mdash;</span> {label}
      </p>
      {children}
    </section>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between border-t border-foreground/15 py-3">
      <span className="text-lg opacity-80">{label}</span>
      <span className="figure text-lg">{value}</span>
    </div>
  )
}

export default function Home() {
  const [hourlyWage, setHourlyWage] = useState<number>(0)
  const [wageInput, setWageInput] = useState<string>('')
  const [darkMode, setDarkMode] = useState<boolean>(true)
  const [timer, setTimer] = useState<TimerState>({
    isRunning: false,
    elapsedMs: 0,
    startTime: null
  })

  // Dark is the default; only an explicit saved preference switches to light.
  useEffect(() => {
    const saved = localStorage.getItem('darkMode')
    if (saved !== null) setDarkMode(saved === 'true')
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('darkMode', darkMode.toString())
  }, [darkMode])

  // Timer effect - re-derives elapsed time from the wall clock every frame,
  // so the display moves smoothly and never drifts after a background tab.
  useEffect(() => {
    if (!timer.isRunning || timer.startTime === null) return

    const startTime = timer.startTime
    let frame = 0
    const tick = () => {
      setTimer(prev => ({ ...prev, elapsedMs: Date.now() - startTime }))
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(frame)
  }, [timer.isRunning, timer.startTime])

  const handleSetWage = (e: React.FormEvent) => {
    e.preventDefault()
    const wage = parseFloat(wageInput)
    if (!isNaN(wage) && wage > 0) {
      setHourlyWage(wage)
    }
  }

  const handleStart = () => {
    if (!timer.isRunning) {
      setTimer({
        isRunning: true,
        elapsedMs: timer.elapsedMs,
        startTime: Date.now() - timer.elapsedMs
      })
    }
  }

  const handlePause = () => {
    setTimer(prev => ({
      ...prev,
      isRunning: false,
      startTime: null
    }))
  }

  const handleReset = () => {
    setTimer({
      isRunning: false,
      elapsedMs: 0,
      startTime: null
    })
  }

  const elapsedSeconds = Math.floor(timer.elapsedMs / 1000)
  const currentEarnings = calculateEarnings(hourlyWage, timer.elapsedMs)
  const earningsParts = splitCurrency(currentEarnings)
  const projections = calculateProjections(hourlyWage)
  const elon = compareToElon(currentEarnings)
  const elonEarnedMeanwhile = ELON_PER_SECOND * (timer.elapsedMs / 1000)

  return (
    <>
      <Head>
        <title>Live Salary Stopwatch</title>
        <meta name="description" content="Calculate your real-time earnings with a live salary stopwatch" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className="min-h-screen px-6 py-12 md:py-20">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <header className="mb-16 flex items-start justify-between gap-6 md:mb-24">
            <div>
              <p className="mono-label mb-6 text-foreground/50">Salary counter</p>
              <h1 className="text-5xl font-normal leading-[0.95] sm:text-7xl md:text-8xl">
                Live Salary
                <br />
                <span className="italic">Stopwatch</span>
              </h1>
              <p className="mt-6 max-w-md text-xl italic opacity-70">
                Watch what your time is worth, as you spend it.
              </p>
            </div>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className="shrink-0 p-2 transition-opacity hover:opacity-70"
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </header>

          {/* 01 Wage */}
          <Section index="01" label="Wage">
            <form onSubmit={handleSetWage} className="flex flex-col gap-6 sm:flex-row sm:items-end">
              <label htmlFor="wage" className="flex flex-1 items-baseline gap-2 border-b border-foreground/30 pb-2 transition-colors focus-within:border-foreground">
                <span className="text-3xl opacity-50 md:text-4xl">$</span>
                <input
                  type="number"
                  id="wage"
                  value={wageInput}
                  onChange={(e) => setWageInput(e.target.value)}
                  placeholder="0.00"
                  className="figure w-full bg-transparent text-3xl outline-none placeholder:text-foreground/30 md:text-4xl"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                />
                <span className="text-xl italic opacity-50">/ hr</span>
              </label>
              <button
                type="submit"
                className="pill-primary whitespace-nowrap"
                disabled={!wageInput || isNaN(parseFloat(wageInput))}
              >
                Set wage
              </button>
            </form>
            <p className="mt-6 text-lg italic opacity-70">
              {hourlyWage > 0
                ? <>Counting at <span className="figure not-italic">{formatCurrency(hourlyWage)}</span> per hour.</>
                : 'Set an hourly wage to start the clock.'}
            </p>
          </Section>

          {/* 02 Time */}
          <Section index="02" label="Time">
            <div className="figure text-6xl sm:text-8xl md:text-[7.5rem]">
              {formatTime(elapsedSeconds)}
            </div>

            <div className="mt-10 flex flex-wrap gap-4">
              {!timer.isRunning ? (
                <button
                  onClick={handleStart}
                  className="pill-primary min-w-[9rem]"
                  disabled={hourlyWage === 0}
                >
                  {timer.elapsedMs > 0 ? 'Resume' : 'Start'}
                </button>
              ) : (
                <button onClick={handlePause} className="pill-outline min-w-[9rem]">
                  Pause
                </button>
              )}
              <button
                onClick={handleReset}
                className="pill-outline"
                disabled={timer.elapsedMs === 0}
              >
                Reset
              </button>
            </div>
          </Section>

          {/* 03 Earnings */}
          <Section index="03" label="Earnings">
            <div className="figure text-6xl sm:text-8xl md:text-[7.5rem]">
              {earningsParts.dollars}
              <span className="ml-2 text-2xl opacity-40 sm:text-4xl md:text-5xl">{earningsParts.subCents}</span>
            </div>

            <div className="mt-10">
              <Row label="Elapsed" value={formatTime(elapsedSeconds)} />
              <Row label="Hourly" value={formatCurrency(hourlyWage)} />
              {hourlyWage > 0 && (
                <>
                  <Row label="Daily, 8 hours" value={formatCurrency(projections.daily)} />
                  <Row label="Weekly, 40 hours" value={formatCurrency(projections.weekly)} />
                  <Row label="Monthly, 173 hours" value={formatCurrency(projections.monthly)} />
                  <Row label="Yearly" value={formatCurrency(projections.yearly)} />
                </>
              )}
            </div>
          </Section>

          {/* 04 Elon */}
          <Section index="04" label="Elon Musk">
            <h2 className="text-3xl font-normal leading-tight sm:text-4xl">
              How long would this take Elon?
            </h2>
            <p className="mt-3 max-w-xl text-lg italic opacity-70">
              His net worth grew by about {formatCurrency(ELON_HOURLY)} per hour in 2025.
            </p>

            <div className="figure mt-10 text-5xl sm:text-7xl md:text-8xl">
              {formatDuration(elon.seconds)}
            </div>
            <p className="mt-4 text-xl italic opacity-70">
              to earn your <span className="figure not-italic opacity-100">{earningsParts.dollars}</span>
            </p>

            <div className="mt-10">
              <div className="mb-3 flex justify-between">
                <span className="mono-label text-foreground/50">
                  {Math.round(elon.fraction * 100)}% of {elon.moment.label}
                </span>
                <span className="mono-label text-foreground/50">{formatDuration(elon.moment.seconds)}</span>
              </div>
              <div className="h-1 w-full overflow-hidden bg-foreground/10">
                <div
                  className="h-full bg-foreground"
                  style={{ width: `${elon.fraction * 100}%`, minWidth: elon.seconds > 0 ? '2px' : 0 }}
                />
              </div>
            </div>

            <div className="mt-10">
              <Row label="Elon earned during your session" value={formatCurrency(elonEarnedMeanwhile)} />
            </div>
          </Section>

          {/* Footer */}
          <footer className="border-t border-foreground/15 pt-8">
            <p className="mono-label text-foreground/40">Earnings update every frame from elapsed time</p>
          </footer>
        </div>
      </main>
    </>
  )
}
