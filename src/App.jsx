import React from 'react'
import { motion } from 'framer-motion'
import PerpBoard from './components/PerpBoard.jsx'
import Logo from '/dark-nyra-logo.svg'

// Replace with your real Pump.fun mint
const DEFAULT_MINT = '3w8qd4jrStowiK8LUzAsHhu9L5JbpiyVcMtjSgs1kJg4'

export default function App(){
  return (
    <div className="min-h-screen bg-nyra-bg text-nyra-text bg-nyra-hero">
      {/* Navbar */}
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={Logo} alt="Dark Nyra" className="h-8 w-auto" />
          <span className="text-sm text-nyra-sub">Perps-Style Live Board</span>
        </div>
        <div className="flex items-center gap-3">
          <a className="nyra-btn-ghost" href="https://pump.fun" target="_blank" rel="noreferrer">Launch on Pump.fun</a>
          <a className="nyra-btn" href="https://github.com" target="_blank" rel="noreferrer">GitHub</a>
        </div>
      </div>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4">
        <motion.div initial={{opacity:0, y:20}} animate={{opacity:1,y:0}} transition={{duration:0.6}} className="rounded-nyra p-6 bg-nyra-grad border border-white/10">
          <h1 className="text-3xl font-semibold tracking-wide">DARK NYRA</h1>
          <p className="text-nyra-sub mt-2">Neon crypto dashboard for your token. Live trades, 1m candles, and a slick orderbook visual.</p>
        </motion.div>

        {/* Board */}
        <div className="mt-6">
          <PerpBoard projectName="Dark Nyra" mint={DEFAULT_MINT} wsUrl="wss://pumpportal.fun/api/data" />
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-4 py-10 text-xs text-nyra-sub">
        <div className="flex items-center justify-between">
          <span>© {new Date().getFullYear()} Dark Nyra</span>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-nyra-neon animate-pulse"></span>
            <span>Realtime powered by PumpPortal</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
