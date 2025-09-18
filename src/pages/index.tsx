import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { Play, Pause, RotateCcw, DollarSign, Moon, Sun } from 'lucide-react'

interface TimerState {
  isRunning: boolean
  elapsedSeconds: number
  startTime: number | null
}

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

const calculateEarnings = (hourlyWage: number, elapsedSeconds: number): number => {
  return (hourlyWage / 3600) * elapsedSeconds
}

const calculateProjections = (hourlyWage: number) => {
  const daily = hourlyWage * 8 // 8 hour work day
  const weekly = daily * 5 // 5 work days
  const monthly = weekly * 4.33 // Average weeks per month
  
  return { daily, weekly, monthly }
}

export default function Home() {
  const [hourlyWage, setHourlyWage] = useState<number>(0)
  const [wageInput, setWageInput] = useState<string>('')
  const [darkMode, setDarkMode] = useState<boolean>(false)
  const [timer, setTimer] = useState<TimerState>({
    isRunning: false,
    elapsedSeconds: 0,
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

  // Timer effect - runs every second when timer is active
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (timer.isRunning && timer.startTime) {
      interval = setInterval(() => {
        const now = Date.now()
        const elapsed = Math.floor((now - timer.startTime!) / 1000)
        
        setTimer(prev => ({
          ...prev,
          elapsedSeconds: elapsed
        }))
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
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
        elapsedSeconds: timer.elapsedSeconds,
        startTime: Date.now() - (timer.elapsedSeconds * 1000)
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
      elapsedSeconds: 0,
      startTime: null
    })
  }

  const currentEarnings = calculateEarnings(hourlyWage, timer.elapsedSeconds)
  const projections = calculateProjections(hourlyWage)

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
                    {formatTime(timer.elapsedSeconds)}
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
                      {timer.elapsedSeconds > 0 ? 'Resume' : 'Start'}
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
                    {formatCurrency(currentEarnings)}
                  </div>
                </div>
                
                <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span>Elapsed time:</span>
                    <span className="font-medium text-gray-900 dark:text-white font-mono">{formatTime(timer.elapsedSeconds)}</span>
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
                  </div>
                </div>
              )}
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
