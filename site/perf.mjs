// Scroll smoothness check: real scroll gestures through the whole page while every frame is timed.
// Usage: node perf.mjs [url]   (runs phone with 4x CPU slowdown, then desktop)
import { chromium } from 'playwright-core'

const url = process.argv[2] ?? 'http://127.0.0.1:4321/'
const browser = await chromium.launch()
for (const [label, opts, cpu] of [
  ['phone 390 · 4x slower CPU', { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2.6, isMobile: true, hasTouch: true }, 4],
  ['desktop 1440', { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 }, 1],
]) {
  const page = await browser.newPage(opts)
  const cdp = await page.context().newCDPSession(page)
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpu })
  await page.goto(url, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)
  await page.evaluate(() => {
    window.__frames = []
    window.__long = []
    new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__long.push(e.duration))).observe({ type: 'longtask', buffered: false })
    let prev = performance.now()
    const loop = (t) => { window.__frames.push(t - prev); prev = t; if (!window.__stop) requestAnimationFrame(loop) }
    requestAnimationFrame(loop)
  })
  const total = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight)
  const h = opts.viewport.height
  // Swipe down the page in screen-sized gestures, like a person reading quickly.
  for (let y = 0; y < total; y += h * 0.9) {
    await cdp.send('Input.synthesizeScrollGesture', { x: opts.viewport.width / 2, y: h * 0.6, yDistance: -Math.round(h * 0.9), speed: 1400, gestureSourceType: opts.isMobile ? 'touch' : 'mouse', repeatCount: 1 })
  }
  const r = await page.evaluate(() => {
    window.__stop = true
    const f = window.__frames.slice(2).sort((a, b) => a - b)
    const q = (p) => f[Math.min(f.length - 1, Math.floor(f.length * p))]
    return { frames: f.length, median: q(0.5), p95: q(0.95), over33: f.filter((x) => x > 33.4).length, longTasks: window.__long.length, worstLong: Math.max(0, ...window.__long) }
  })
  console.log(`${label}: ${r.frames} frames · median ${r.median.toFixed(1)} ms · p95 ${r.p95.toFixed(1)} ms · ${((r.over33 / r.frames) * 100).toFixed(1)}% frames over 33 ms · long tasks ${r.longTasks} (worst ${r.worstLong.toFixed(0)} ms)`)
  await page.close()
}
await browser.close()
