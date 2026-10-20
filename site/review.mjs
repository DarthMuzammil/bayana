// Visual review: scrolls the built page at several widths, saves full-page and per-screen shots,
// and reports console errors, horizontal overflow and small tap targets.
// Usage: node review.mjs [widths...]   (default 390 768 1440)
import fs from 'node:fs'
import { chromium } from 'playwright-core'

const URL_ = process.env.URL ?? 'http://127.0.0.1:4321/'
const OUT = '/home/muz/landing-page/review'
fs.mkdirSync(OUT, { recursive: true })
const widths = process.argv.slice(2).map(Number).filter(Boolean)
const list = widths.length ? widths : [390, 768, 1440]
const browser = await chromium.launch()
for (const w of list) {
  const h = w < 700 ? 844 : w < 1000 ? 1024 : 900
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1, isMobile: w < 700, hasTouch: w < 700 })
  const errors = []
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  page.on('pageerror', (e) => errors.push(String(e)))
  page.on('requestfailed', (r) => r.failure()?.errorText !== 'net::ERR_ABORTED' && errors.push('failed: ' + r.url()))
  await page.goto(URL_, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1200)
  await page.screenshot({ path: `${OUT}/${w}-00-top.png` })
  const total = await page.evaluate(() => document.documentElement.scrollHeight)
  let i = 1
  for (let y = h * 0.8; y < total; y += h * 0.8) {
    await page.evaluate((y) => scrollTo(0, y), y)
    await page.waitForTimeout(500)
    if (process.env.SCREENS) await page.screenshot({ path: `${OUT}/${w}-${String(i).padStart(2, '0')}.png` })
    i++
  }
  await page.waitForTimeout(800)
  await page.evaluate(() => scrollTo(0, 0))
  await page.waitForTimeout(400)
  await page.screenshot({ path: `${OUT}/${w}-full.png`, fullPage: true })
  const issues = await page.evaluate(() => {
    const out = []
    if (document.documentElement.scrollWidth > innerWidth + 1) out.push(`horizontal overflow: ${document.documentElement.scrollWidth}px > ${innerWidth}px`)
    const wide = [...document.querySelectorAll('body *')].filter((el) => { const r = el.getBoundingClientRect(); return r.right > innerWidth + 1 && getComputedStyle(el).position !== 'fixed' && !el.closest('.ticker, .hero-skyline, .final-skyline, .sr-only') })
    wide.slice(0, 5).forEach((el) => out.push('overflowing: ' + el.tagName.toLowerCase() + '.' + [...el.classList].join('.')))
    if (innerWidth < 700) {
      const small = [...document.querySelectorAll('a, button, summary, input')].filter((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && (r.height < 40 || r.width < 40) && !el.closest('.sr-only, .skip, footer nav, .faq-side') })
      small.slice(0, 8).forEach((el) => { const r = el.getBoundingClientRect(); out.push(`small tap target ${Math.round(r.width)}x${Math.round(r.height)}: ${el.tagName.toLowerCase()} "${(el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 30)}"`) })
    }
    return out
  })
  console.log(`[${w}] height ${total}px · errors: ${errors.length ? errors.join(' | ') : 'none'}`)
  issues.forEach((x) => console.log(`[${w}]   ${x}`))
  await page.close()
}
await browser.close()
