<p align="center">
  <img src="public/icon.svg" alt="ISP Signal Generator" width="80" />
</p>

<h1 align="center">ISP Signal Generator</h1>

<p align="center">
  <strong>Intended Signal Period — systematic trade signal journal for quantitative workflows</strong>
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/license-MIT-blue" alt="License"></a>
  <a href="#"><img src="https://img.shields.io/badge/Bun-1.3-black?logo=bun" alt="Bun"></a>
  <a href="#"><img src="https://img.shields.io/badge/React-18-61DAFB?logo=react" alt="React"></a>
  <a href="#"><img src="https://img.shields.io/badge/Vite-5-646CFF?logo=vite" alt="Vite"></a>
  <a href="#"><img src="https://img.shields.io/badge/Lightweight_Charts-4-2962FF?logo=tradingview" alt="Lightweight Charts"></a>
  <a href="#"><img src="https://img.shields.io/badge/Cloudflare_Pages-ready-F38020?logo=cloudflare" alt="Cloudflare Pages"></a>
  <a href="#"><img src="https://img.shields.io/badge/bitview.space-powered-089981" alt="bitview.space"></a>
</p>

---

## Why ISP Matters in Quant Trading

Most discretionary traders treat signals as ephemeral — a gut feeling, a chart pattern spotted, a tweet that moved the market. **Systematic traders know better.**

An **Intended Signal Period (ISP)** is the atomic unit of a quantitative workflow: a timestamped, directional hypothesis backed by a defined price level and a specific capital allocation. Recording ISPs transforms vague trading ideas into **testable, auditable, optimizable data**.

### What ISP Captures That Most Tools Miss

| Dimension | Typical Journal | ISP Signal Generator |
|-----------|----------------|----------------------|
| **Price at Signal** | Approximate | Exact OHLC close |
| **Capital Allocation** | Fixed lots | % of equity (dynamic) |
| **Equity Context** | Separate spreadsheet | Continuous equity curve |
| **Performance Attribution** | Basic P&L | Sharpe, Sortino, Calmar, Kelly, Ulcer, Sterling |
| **Backtest Integration** | Manual | Replayable history |
| **Portfolio Fit** | Trade-level | Portfolio-level drawdown tracking |

### In a Quant Workflow

```
Hypothesis → ISP Signal (BUY/SELL @ Price × %Equity) → Journal Entry →
  Performance Metrics → Equity Curve → Strategy Iteration
```

ISP fills the critical gap between **strategy ideation** and **systematic execution**. Every signal you mark becomes a row in your personal quant database — ready for CSV export, external analysis, or direct visual inspection against the price chart.

---

## Features

### 🕯️ TradingView-Class Chart

- Full BTCUSD daily OHLC history from **bitview.space** (no API key required)
- **Pan & zoom** — scroll to zoom, drag to pan, just like TradingView
- **LIN / LOG scale toggle** — linear for short-term, logarithmic for multi-year Bitcoin perspective
- **Click any candle** to place a trade signal directly on the chart
- Buy/Sell markers rendered as arrows on the time axis

### 🎯 Systematic Trade Journal

- **Click → Modal → BUY/SELL** — minimal friction, maximum precision
- **Equity allocation slider** — use 5%–100% of portfolio per signal
- **Real-time position tracking** — BTC held, cash balance, total equity
- **Running P&L per trade** — know exactly when you're up or down

### 📊 Quant-Grade Performance Metrics

| Metric | What It Measures |
|--------|-----------------|
| **Total Return** | Raw P&L in USD |
| **Annualized Return** | CAGR over the signal period |
| **Sharpe Ratio** | Risk-adjusted return (excess return per unit of total volatility) |
| **Sortino Ratio** | Downside-risk-adjusted return (ignores upside volatility) |
| **Calmar Ratio** | Annualized return ÷ maximum drawdown |
| **Max Drawdown** | Largest peak-to-trough decline (%) |
| **Win Rate** | Profitable closed trades ÷ total closed trades |
| **Profit Factor** | Gross win ÷ gross loss (the "bang for your buck") |
| **Avg Win / Avg Loss** | Ratio of average winning trade to average losing trade |
| **Recovery Factor** | Total return ÷ maximum drawdown |
| **Expectancy** | Expected return per trade (probability-weighted) |
| **Kelly Criterion** | Optimal fraction of capital to risk per trade |
| **Volatility (Ann.)** | Annualized standard deviation of daily returns |
| **Ulcer Index** | Drawdown severity and duration (root mean square of drawdowns) |
| **Sterling Ratio** | Return ÷ average drawdown (with 10% threshold) |

### 📈 Continuous Equity Curve

- Portfolio value plotted **daily** across the entire OHLC history
- Not just trade points — every candle's close price updates your paper portfolio
- Dashed initial-equity baseline for instant visual comparison
- Syncs with LIN/LOG scale toggle

### 📋 Data Portability

- **Export CSV** — Date, Action, Price, Equity %, Cost, BTC Held, Total Equity
- **Import CSV** — Replay previously exported signal sequences
- **Configurable initial equity** (default $10,000)
- **Configurable trade fee** (default 0.1%)

### ☁️ Deployed on Cloudflare Pages

- Zero server, zero database — all computation happens in your browser
- Free tier: unlimited requests, global CDN
- Data sourced directly from bitview.space public API

---

## Tech Stack

```
┌─────────────────────────────────────────────────────┐
│                    Cloudflare Pages                   │
│  ┌───────────────────────────────────────────────┐  │
│  │                  Vite (Build)                  │  │
│  │  ┌─────────────────────────────────────────┐  │  │
│  │  │           React 18 + TypeScript          │  │  │
│  │  │  ┌──────────┐  ┌──────────────────────┐ │  │  │
│  │  │  │Lightweight│  │  Custom Hooks        │ │  │  │
│  │  │  │ Charts   │  │  - useBitviewData    │ │  │  │
│  │  │  │(Candlestick│  │  - usePortfolio     │ │  │  │
│  │  │  │ + Line)  │  │                      │ │  │  │
│  │  │  └──────────┘  └──────────────────────┘ │  │  │
│  │  └─────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────┘  │
│  Data: bitview.space (BTCUSD OHLCV, no auth)        │
└─────────────────────────────────────────────────────┘
```

| Layer | Technology |
|-------|-----------|
| **Runtime** | Bun 1.3 |
| **Framework** | React 18 + TypeScript |
| **Bundler** | Vite 5 |
| **Chart Engine** | Lightweight Charts (TradingView) |
| **Data Source** | [bitview.space](https://bitview.space) (Bitcoin Research Kit) |
| **Hosting** | Cloudflare Pages (global CDN) |
| **Deployment** | Wrangler CLI / GitHub Actions |

---

## Project Structure

```
isp-signal-generator/
├── index.html                 # Vite entry point
├── package.json               # Bun-managed dependencies
├── vite.config.ts             # Vite configuration
├── tsconfig.json              # TypeScript configuration
├── public/
│   ├── _headers               # Cloudflare Pages security headers
│   └── _redirects             # SPA fallback routing
└── src/
    ├── main.tsx               # React DOM entry
    ├── App.tsx                # Root component, state orchestration
    ├── index.css              # Global styles (dark theme)
    ├── types.ts               # Shared TypeScript interfaces
    ├── utils/
    │   ├── api.ts             # Bitview.space API client (chunked fetch)
    │   ├── metrics.ts         # 16 performance metrics + equity replay
    │   └── csv.ts             # CSV import/export utilities
    ├── hooks/
    │   ├── useBitviewData.ts  # Fetch OHLC data hook
    │   └── usePortfolio.ts    # Trade + portfolio management hook
    └── components/
        ├── Header.tsx            # Top bar (equity, fee, reload)
        ├── PriceChart.tsx        # Candlestick chart + LIN/LOG toggle
        ├── TradeModal.tsx        # Buy/Sell signal modal
        ├── TradeTable.tsx        # Trade log table + CSV actions
        ├── PerformanceMetrics.tsx # 16 metric cards
        ├── EquityCurve.tsx       # Portfolio equity line chart
        └── StatusBar.tsx         # Bottom status bar
```

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) 1.3+ (`curl -fsSL https://bun.sh/install | bash`)
- (Optional) [Wrangler](https://developers.cloudflare.com/workers/wrangler/) — for Pages deployment

### Local Development

```bash
# Clone & install
git clone https://github.com/lutfi-zain/isp-signal-generator.git
cd isp-signal-generator
bun install

# Start dev server (http://localhost:5173)
bun run dev

# Production build
bun run build

# Preview production build
bun run preview
```

The app auto-loads BTCUSD price data from bitview.space on startup — no API key required.

### Deploy to Cloudflare Pages

```bash
# Via Wrangler (must be authenticated)
bun run deploy

# Or build manually, then upload via Cloudflare Dashboard
bun run build
# → Upload dist/ folder to Cloudflare Pages
```

**Dashboard settings:**
- Build command: `bun run build`
- Output directory: `dist`
- Node version: 18+ (or Bun)

---

## Usage Walkthrough

### 1. Load Data
The chart loads automatically. You'll see daily BTCUSD candles from 2009 to present.

### 2. Place a Signal
Click any candle → the trade modal opens showing the date and price. Choose your equity allocation (slider or preset buttons) and click **▲ BUY** or **▼ SELL**.

### 3. Review Trades
All signals appear in the trade log table with running equity, BTC holdings, and P&L. Buy/Sell markers appear on the chart.

### 4. Analyze Performance
The performance panel updates in real-time with 16 metrics. Watch your Sharpe, Sortino, and Max Drawdown evolve with each new signal.

### 5. Export / Import
Use **Export CSV** to download your signal history. Re-import later via **Import CSV** to continue where you left off.

### 6. Tweak Parameters
Adjust **Initial Equity** and **Trade Fee** at any time. Metrics and equity curve update instantly.

---

## API Reference (bitview.space)

This app uses the [Bitcoin Research Kit](https://bitview.space/api) public API — free, no authentication required.

| Endpoint | Usage |
|----------|-------|
| `GET /api/series/price_ohlc/day/len` | Total daily candles |
| `GET /api/series/price_ohlc/day?start=N&end=M` | OHLC data range |
| `GET /api/series/price_ohlc/day/latest` | Most recent candle |

BTCUSD closing price is derived from on-chain UTXO analysis. See [bitview.space/docs](https://bitview.space/llms-full.txt) for details.

---

## Performance Metrics — Explained

| Metric | Formula | Interpretation |
|--------|---------|----------------|
| **Sharpe Ratio** | (R<sub>p</sub> − R<sub>f</sub>) / σ<sub>p</sub> | >1.0 good, >2.0 great, >3.0 excellent |
| **Sortino Ratio** | (R<sub>p</sub> − R<sub>f</sub>) / σ<sub>d</sub> | Only penalizes downside volatility |
| **Calmar Ratio** | R<sub>ann</sub> / MaxDD | >3.0 strong risk-adjusted return |
| **Profit Factor** | Σ(Wins) / Σ(Losses) | >2.0 profitable, <1.0 losing system |
| **Kelly Criterion** | W − (1−W)/(W/L) | Optimal position size as % of equity |
| **Ulcer Index** | √(Σ(DD<sub>i</sub>²)/n) | Lower = smoother equity curve |
| **Sterling Ratio** | R<sub>ann</sub> / (AvgDD + 10%) | >1.0 considered healthy |

Where: R<sub>p</sub> = portfolio return, R<sub>f</sub> = risk-free rate (4%), σ<sub>p</sub> = std dev of returns, σ<sub>d</sub> = downside deviation, MaxDD = maximum drawdown, DD<sub>i</sub> = individual drawdowns, W = win rate, W/L = avg win / avg loss.

---

## Contributing

ISP Signal Generator is designed for extensibility. Ideas for contribution:

- **Multi-asset support** — select from top-10 crypto pairs
- **Custom timeframes** — hourly, 4-hour, weekly data
- **Strategy tagging** — tag signals by strategy for segmented analysis
- **Dark/Light theme toggle**
- **P&L distribution chart** — histogram of trade returns
- **Monte Carlo simulation** — randomized replay of signal sequences
- **GitHub Actions CI/CD** — auto-deploy on push

---

## License

MIT © [lutfi-zain](https://github.com/lutfi-zain)

---

<p align="center">
  <sub>Built with ❤️ for systematic traders who take their signals seriously.</sub>
</p>
