import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

export default function PerpBoard({ projectName = 'Dark Nyra', mint, wsUrl = 'wss://pumpportal.fun/api/data' }) {
  const chartRef = useRef(null);
  const chartApiRef = useRef(null);
  const seriesRef = useRef(null);
  const wsRef = useRef(null);

  const [connected, setConnected] = useState(false);
  const [trades, setTrades] = useState([]);
  const [candlesMap] = useState(() => new Map());
  const [depth, setDepth] = useState({ bids: [], asks: [] });
  const [lastPrice, setLastPrice] = useState(null);
  const [status, setStatus] = useState('idle');

  const bucket = (tsSec) => Math.floor(tsSec / 60) * 60;

  // Init chart
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { createChart } = await import('lightweight-charts');
      if (cancelled) return;
      const el = chartRef.current;
      const chart = createChart(el, {
        layout: { background: { type: 'solid', color: '#0b0e1a' }, textColor: '#e6e6ff' },
        grid: { horzLines: { color: 'rgba(255,255,255,0.06)' }, vertLines: { color: 'rgba(255,255,255,0.06)' } },
        rightPriceScale: { scaleMargins: { top: 0.1, bottom: 0.1 } },
        timeScale: { borderColor: 'rgba(255,255,255,0.1)' },
        width: el.clientWidth,
        height: 340,
      });
      const series = chart.addCandlestickSeries({
        upColor: 'rgba(58, 255, 176, 1)',
        downColor: 'rgba(255, 92, 135, 1)',
        borderVisible: false,
        wickVisible: true,
      });
      chartApiRef.current = chart;
      seriesRef.current = series;
      const onResize = () => chart.applyOptions({ width: el.clientWidth });
      window.addEventListener('resize', onResize);
      return () => { window.removeEventListener('resize', onResize); chart.remove(); };
    })();
    return () => { cancelled = true; };
  }, []);

  // WS to PumpPortal
  useEffect(() => {
    if (!wsUrl || !mint) return;
    setStatus('connecting ws');
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus('connected');
      const sub = { method: 'subscribeTokenTrade', keys: [mint] };
      ws.send(JSON.stringify(sub));
      setConnected(true);
    };

    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        if (msg?.channel === 'tokenTrade' && msg.data) {
          const d = msg.data;
          const tsMs = d.ts || Date.now();
          const price = Number(d.price);
          setLastPrice(price);

          // Tape
          setTrades((t) => [{ ts: tsMs, price, size: d.size, side: d.side, tx: d.tx }, ...t].slice(0, 250));

          // Candle 1m
          const k = bucket(Math.floor(tsMs / 1000));
          const existing = candlesMap.get(k);
          if (!existing) {
            const candle = { time: k, open: price, high: price, low: price, close: price };
            candlesMap.set(k, candle);
            seriesRef.current?.update(candle);
          } else {
            existing.high = Math.max(existing.high, price);
            existing.low = Math.min(existing.low, price);
            existing.close = price;
            seriesRef.current?.update(existing);
          }

          // Virtual depth (visual only).
          setDepth((prev) => {
            const center = price || prev.center || 0;
            const step = Math.max(center * 0.002, 0.0001);
            const build = (side) => Array.from({ length: 14 }).map((_, i) => {
              const p = parseFloat((center + (side === 'ask' ? i + 1 : -(i + 1)) * step).toFixed(6));
              const q = Math.round((1 + Math.random() * 10) * (100 / (i + 1))) / 100;
              return [p, q];
            });
            return { bids: build('bid'), asks: build('ask') };
          });
        }
      } catch (e) {
        console.error('ws msg parse', e);
      }
    };

    ws.onclose = () => { setConnected(false); setStatus('ws closed'); };
    ws.onerror = (e) => { console.error('ws err', e); setStatus('ws error'); };

    return () => { try { ws.close(); } catch (e) {} };
  }, [wsUrl, mint, candlesMap]);

  const connectWallet = async () => {
    try {
      const provider = window.solana;
      if (!provider || !provider.isPhantom) return alert('Phantom wallet not found');
    const resp = await provider.connect();
      console.log('wallet', resp.publicKey.toString());
      setStatus('wallet connected');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <motion.div initial={{opacity:0, y:16}} animate={{opacity:1, y:0}} transition={{duration:0.5}} className="rounded-nyra bg-nyra-panel/70 backdrop-blur border border-white/5 shadow-nyra-inner">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/5">
        <div>
          <div className="text-sm text-nyra-sub uppercase tracking-wider">{projectName}</div>
          <div className="text-xl font-semibold">Live Board — {mint ? `${mint.slice(0,8)}...${mint.slice(-6)}` : '—'}</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm">Price: <span className="font-semibold text-white">{lastPrice ?? '—'}</span></div>
          <button onClick={connectWallet} className="nyra-btn">Connect Phantom</button>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-12 gap-4 p-4">
        {/* Chart */}
        <div className="col-span-8 nyra-card p-3">
          <div ref={chartRef} className="w-full rounded overflow-hidden" style={{ height: 340 }} />
        </div>

        {/* Side status */}
        <div className="col-span-4 space-y-4">
          <div className="nyra-card p-3">
            <div className="text-xs text-nyra-sub">Status</div>
            <div className="mt-2 text-sm space-y-1">
              <div>WS: <span className="font-medium">{connected ? 'connected' : 'disconnected'}</span></div>
              <div>State: <span className="font-medium">{status}</span></div>
              <div>Trades stored: <span className="font-medium">{trades.length}</span></div>
            </div>
          </div>

          <div className="nyra-card p-3">
            <div className="text-xs text-nyra-sub">Market</div>
            <div className="mt-2 text-sm space-y-1">
              <div>Mint:</div>
              <code className="block text-xs break-all p-2 bg-black/30 rounded">{mint || '—'}</code>
              <a className="nyra-btn mt-2 text-center inline-block" href={mint ? `https://pump.fun/coin/${mint}` : '#'} target="_blank" rel="noreferrer">Open in Pump.fun</a>
            </div>
          </div>
        </div>

        {/* Orderbook + Tape */}
        <div className="col-span-6 nyra-card p-3">
          <div className="text-xs text-nyra-sub">Orderbook (visual)</div>
          <div className="flex gap-4 mt-2">
            <div className="w-1/2">
              <div className="text-xs text-nyra-sub">Bids</div>
              <ul className="text-sm leading-5 max-h-48 overflow-auto">
                {depth.bids.map(([p,q],i)=> (
                  <li key={'b'+i} className="flex justify-between">
                    <span>{p}</span><span className="text-nyra-sub">{q}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="w-1/2">
              <div className="text-xs text-nyra-sub">Asks</div>
              <ul className="text-sm leading-5 max-h-48 overflow-auto">
                {depth.asks.map(([p,q],i)=> (
                  <li key={'a'+i} className="flex justify-between">
                    <span>{p}</span><span className="text-nyra-sub">{q}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="col-span-6 nyra-card p-3">
          <div className="text-xs text-nyra-sub">Trade Tape</div>
          <ul className="text-sm max-h-48 overflow-auto mt-2 space-y-1">
            {trades.slice(0,60).map((t,i)=> (
              <li key={i} className={`flex justify-between ${t.side==='buy'? 'text-green-300':'text-rose-300'}`}>
                <span className="text-xs">{new Date(t.ts).toLocaleTimeString()}</span>
                <span className="mx-2">{t.size}</span>
                <span className="font-medium">{t.price}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  )
}
