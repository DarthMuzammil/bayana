// Generates the line-art skyline symbol used in the hero and the final call to action.
// Deterministic (seeded), so the drawing never changes between builds.
import fs from 'node:fs'

let seed = 7
const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646
const W = 1440, BASE = 252
const paths = []
let x = 6
let i = 0
while (x < W - 40) {
  const w = 34 + Math.round(rnd() * 46)
  const tall = i % 5 === 2 ? 0.92 : i % 3 === 0 ? 0.62 : 0.42
  const h = Math.round((tall + rnd() * 0.22) * 200)
  const top = BASE - h
  const kind = i % 4
  let d
  if (kind === 0) {
    // setback tower
    const s = Math.round(w * 0.22)
    d = `M${x} ${BASE}V${top + 26}H${x + s}V${top}H${x + w - s}V${top + 26}H${x + w}V${BASE}`
  } else if (kind === 1) {
    // rounded crown (Cyber City style)
    const r = w / 2
    d = `M${x} ${BASE}V${top + r}A${r} ${r} 0 0 1 ${x + w} ${top + r}V${BASE}`
  } else if (kind === 2) {
    // slanted roof
    d = `M${x} ${BASE}V${top + 18}L${x + w} ${top}V${BASE}`
  } else {
    // plain block with antenna
    const ax = x + Math.round(w * 0.7)
    d = `M${x} ${BASE}V${top}H${x + w}V${BASE}M${ax} ${top}V${top - 22}`
  }
  paths.push(`<path d="${d}"/>`)
  // window rows
  const rows = Math.floor((h - 34) / 22)
  for (let r = 0; r < rows; r++) {
    const y = top + 30 + r * 22
    if (y > BASE - 14) break
    if (rnd() < 0.55) paths.push(`<path class="win" d="M${x + 9} ${y}H${x + w - 9}"/>`)
  }
  x += w + 10 + Math.round(rnd() * 16)
  i++
}
// crane
paths.push(`<path d="M1180 ${BASE}V58M1180 64H1312M1180 64L1220 58M1296 64V110M1150 64H1180M1174 58L1180 46L1186 58"/>`)
paths.push(`<path d="M0 ${BASE}H${W}"/>`)
const symbol = `<symbol id="skyline" viewBox="0 0 ${W} 260"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths
  .map((p) => p.replace('<path', '<path pathLength="1"'))
  .join('')}</g></symbol>`
fs.writeFileSync(new URL('./src/skyline.svg', import.meta.url), symbol)
console.log('skyline paths:', paths.length)
