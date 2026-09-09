import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { Play, Pause, RotateCcw, DollarSign, Moon, Sun } from 'lucide-react'

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
  const yearly = monthly * 12 // Average weeks per month
  
  return { daily, weekly, monthly, yearly}
}

export default function Home() {
  const [hourlyWage, setHourlyWage] = useState<number>(0)
  const [wageInput, setWageInput] = useState<string>('')
  const [darkMode, setDarkMode] = useState<boolean>(false)
  const [timer, setTimer] = useState<TimerState>({
    isRunning: false,
    elapsedMs: 0,
    startTime: null
  })

  // Initialize dark mode from localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode')
    if (savedDarkMode) {
      setDarkMode(savedDarkMode === 'true')
    } else {
      // Default to dark mode
      setDarkMode(true)
    }
  }, [])

  // Apply dark mode class to HTML element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
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

  const handleSetWage = () => {
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

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  return (
    <>
      <Head>
        <title>Live Salary Stopwatch</title>
        <meta name="description" content="Calculate your real-time earnings with a live salary stopwatch" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 transition-colors duration-300">
        <div className="max-w-4xl mx-auto">
          {/* Header with Dark Mode Toggle */}
          <div className="flex justify-between items-start mb-8">
            <div className="text-center flex-1">
              <div className="flex items-center justify-center gap-3 mb-4">
                <DollarSign className="w-10 h-10 text-earning-green dark:text-green-400" />
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Live Salary Stopwatch</h1>
              </div>
              <p className="text-lg text-gray-600 dark:text-gray-400">Track your real-time earnings as you work</p>
            </div>
            
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-3 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <Sun className="w-6 h-6 text-yellow-500" />
              ) : (
                <Moon className="w-6 h-6 text-gray-600" />
              )}
            </button>
          </div>

          {/* Wage Input Section */}
          <div className="card p-8 mb-8">
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1">
                <label htmlFor="wage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Hourly Wage ($/hr)
                </label>
                <input
                  type="number"
                  id="wage"
                  value={wageInput}
                  onChange={(e) => setWageInput(e.target.value)}
                  placeholder="Enter your hourly wage"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-earning-blue dark:focus:ring-blue-400 focus:border-transparent text-lg placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200"
                  min="0"
                  step="0.01"
                />
              </div>
              <button
                onClick={handleSetWage}
                className="btn-primary whitespace-nowrap"
                disabled={!wageInput || isNaN(parseFloat(wageInput))}
              >
                Set Wage
              </button>
            </div>
            {hourlyWage > 0 && (
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                Current wage: <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(hourlyWage)}/hr</span>
              </p>
            )}
          </div>

          {/* Main Dashboard */}
          <div className="space-y-8">
            {/* Timer and Controls Section */}
            <div className="card p-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8 text-center">Live Salary Tracker</h2>
              
              {/* Stopwatch Display */}
              <div className="text-center mb-8">
                <div className="mb-8 py-8 px-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
                  <div className="stopwatch-display">
                    {formatTime(elapsedSeconds)}
                  </div>
                </div>
                
                {/* Control Buttons */}
                <div className="flex justify-center gap-4 flex-wrap">
                  {!timer.isRunning ? (
                    <button
                      onClick={handleStart}
                      className="btn-primary flex items-center gap-2 min-w-[120px] justify-center"
                      disabled={hourlyWage === 0}
                    >
                      <Play className="w-5 h-5" />
                      {timer.elapsedMs > 0 ? 'Resume' : 'Start'}
                    </button>
                  ) : (
                    <button
                      onClick={handlePause}
                      className="btn-secondary flex items-center gap-2 min-w-[120px] justify-center"
                    >
                      <Pause className="w-5 h-5" />
                      Pause
                    </button>
                  )}
                  
                  <button
                    onClick={handleReset}
                    className="btn-danger flex items-center gap-2 min-w-[120px] justify-center"
                  >
                    <RotateCcw className="w-5 h-5" />
                    Reset
                  </button>
                </div>

                {hourlyWage === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    Please set your hourly wage to start the timer
                  </p>
                )}
              </div>
            </div>

            {/* Earnings Section */}
            <div className="card p-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8 text-center">Current Earnings & Projections</h2>
              
              <div className="text-center mb-8">
                <div className="mb-6 py-6 px-4 bg-green-50 dark:bg-green-900/20 rounded-2xl">
                  <div className="earnings-display">
                    {earningsParts.dollars}
                    <span className="text-2xl md:text-4xl opacity-40 ml-1">{earningsParts.subCents}</span>
                  </div>
                </div>
                
                <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span>Elapsed time:</span>
                    <span className="font-medium text-gray-900 dark:text-white font-mono">{formatTime(elapsedSeconds)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Hourly wage:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(hourlyWage)}</span>
                  </div>
                </div>
              </div>

              {/* Projections */}
              {hourlyWage > 0 && (
                <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Earnings Projections</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 px-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                      <span className="text-gray-600 dark:text-gray-400">Daily (8 hours):</span>
                      <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(projections.daily)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 px-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                      <span className="text-gray-600 dark:text-gray-400">Weekly (40 hours):</span>
                      <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(projections.weekly)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 px-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                      <span className="text-gray-600 dark:text-gray-400">Monthly (173 hours):</span>
                      <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(projections.monthly)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 px-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                      <span className="text-gray-600 dark:text-gray-400">Yearly:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(projections.yearly)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Elon Comparison */}
            <div className="card p-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2 text-center">How Long Would This Take Elon?</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-8">
                Elon Musk&apos;s net worth grew by about {formatCurrency(ELON_HOURLY)} per hour in 2025
              </p>

              <div className="text-center mb-6 py-6 px-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
                <div className="text-5xl md:text-7xl font-bold font-mono text-gray-900 dark:text-white leading-none tabular-nums">
                  {formatDuration(elon.seconds)}
                </div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                  to earn your <span className="font-semibold text-earning-green dark:text-green-400">{earningsParts.dollars}</span>
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>{Math.round(elon.fraction * 100)}% of {elon.moment.label}</span>
                  <span className="font-mono">{formatDuration(elon.moment.seconds)}</span>
                </div>
                <div className="h-4 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-earning-green dark:bg-green-400"
                    style={{ width: `${elon.fraction * 100}%`, minWidth: elon.seconds > 0 ? '3px' : 0 }}
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-between items-center py-2 px-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg text-sm">
                <span className="text-gray-600 dark:text-gray-400">Elon earned during your session:</span>
                <span className="font-medium text-gray-900 dark:text-white tabular-nums">{formatCurrency(elonEarnedMeanwhile)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-12 text-sm text-gray-500 dark:text-gray-400">
            <p>Your earnings are calculated in real-time based on elapsed time</p>
          </div>
        </div>
      </main>
    </>
  )
}
