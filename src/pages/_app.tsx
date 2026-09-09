import { AppProps } from 'next/app'
import { Instrument_Serif, JetBrains_Mono } from 'next/font/google'
import GrainOverlay from '../components/GrainOverlay'
import '../styles/globals.css'

const instrumentSerif = Instrument_Serif({
  weight: '400',
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-instrument-serif',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains-mono',
})

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      {/* Font variables must live on an ancestor of everything that uses them,
          including <body>, so they are hoisted to :root. */}
      <style jsx global>{`
        :root {
          --font-instrument-serif: ${instrumentSerif.style.fontFamily};
          --font-jetbrains-mono: ${jetbrainsMono.style.fontFamily};
        }
      `}</style>
      <GrainOverlay />
      <Component {...pageProps} />
    </>
  )
}

export default MyApp
