// Turns raw captures into web-ready media in src/media and src/static.
// Inputs: ../capture-out (screen recordings + snaps from the demo), ../../landing-assets (partner photo and logo).
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import sharp from 'sharp'
import ffmpeg from 'ffmpeg-static'
import { chromium } from 'playwright-core'

const here = path.dirname(new URL(import.meta.url).pathname)
const CAP = path.join(here, '..', 'capture-out')
const PARTNER = '/home/muz/landing-assets'
const MEDIA = path.join(here, 'src', 'media')
const STATIC = path.join(here, 'src', 'static')
fs.mkdirSync(MEDIA, { recursive: true })
fs.mkdirSync(STATIC, { recursive: true })
const kb = (f) => (fs.statSync(f).size / 1024).toFixed(0) + ' KB'

async function img(input, name, width, { avifQ = 55, webpQ = 78, pipeline } = {}) {
  let p = sharp(input)
  if (pipeline) p = pipeline(p)
  const buf = await p.resize({ width, withoutEnlargement: true }).toBuffer()
  await sharp(buf).avif({ quality: avifQ, effort: 6 }).toFile(path.join(MEDIA, `${name}.avif`))
  await sharp(buf).webp({ quality: webpQ, effort: 6 }).toFile(path.join(MEDIA, `${name}.webp`))
  console.log(`${name}: avif ${kb(path.join(MEDIA, name + '.avif'))}, webp ${kb(path.join(MEDIA, name + '.webp'))}`)
}

// 1. Phone screens for "How it works"
for (let n = 1; n <= 4; n++) await img(path.join(CAP, `snap-how-${n}.png`), `how-${n}`, 600)

// 2. Owner desktop screenshot, and the owner's phone home for the hero on small screens
for (const w of [1000, 1600]) await img(path.join(CAP, 'still-d-today.png'), `d-today-${w}`, w, { avifQ: 50 })
await img(path.join(CAP, 'still-p-today.png'), 'p-today', 600)

// 3. Product clips (encoded from the original frames, not from an already-compressed video)
const clips = { reply: 600, share: 600, visit: 600, handover: 600, escalate: 420 }
for (const [name, width] of Object.entries(clips)) {
  const dir = path.join(CAP, 'frames', name)
  const list = fs.existsSync(path.join(dir, 'list-trim.txt')) ? path.join(dir, 'list-trim.txt') : path.join(dir, 'list.txt')
  const vf = `scale=${width}:-2:flags=lanczos,fps=30,format=yuv420p`
  const mp4 = path.join(MEDIA, `${name}.mp4`)
  const webm = path.join(MEDIA, `${name}.webm`)
  execFileSync(ffmpeg, ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', list, '-vf', vf, '-c:v', 'libx264', '-preset', 'slow', '-crf', '27', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', mp4])
  execFileSync(ffmpeg, ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', list, '-vf', vf, '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '42', '-row-mt', '1', '-deadline', 'good', '-cpu-used', '2', '-an', webm])
  const first = fs.readdirSync(dir).filter((f) => f.endsWith('.jpg')).sort()[0]
  await sharp(path.join(dir, first)).resize({ width }).webp({ quality: 72 }).toFile(path.join(MEDIA, `${name}-poster.webp`))
  console.log(`${name}: mp4 ${kb(mp4)}, webm ${kb(webm)}, poster ${kb(path.join(MEDIA, name + '-poster.webp'))}`)
}

// 4. Partner: founder photo (already a circle on grey; crop inside the circle) and logo (circle from a screenshot)
await img(path.join(PARTNER, 'bdr-founder-bipin.jpg'), 'bipin', 192, { pipeline: (p) => p.extract({ left: 72, top: 44, width: 470, height: 470 }) })
{
  const meta = await sharp(path.join(PARTNER, 'bdr-logo-screenshot.png')).metadata()
  // The logo circle sits at ~(50%, 44%) of the screenshot with a radius of ~33% of its width.
  const cx = Math.round(meta.width * 0.4993), cy = Math.round(meta.height * 0.4397), r = Math.round(meta.width * 0.326)
  const size = r * 2
  const mask = Buffer.from(`<svg width="${size}" height="${size}"><circle cx="${r}" cy="${r}" r="${r - 2}" fill="#fff"/></svg>`)
  const circle = await sharp(path.join(PARTNER, 'bdr-logo-screenshot.png'))
    .extract({ left: cx - r, top: cy - r, width: size, height: size })
    .composite([{ input: mask, blend: 'dest-in' }])
    .png()
    .toBuffer()
  fs.writeFileSync(path.join(CAP, 'bdr-logo-circle.png'), circle)
  await img(circle, 'bdr-logo', 176, { avifQ: 60, webpQ: 85 })
}

// 5. Favicons and the social preview image, rendered from HTML so they use the real fonts and logo
const logoSymbol = fs.readFileSync(path.join(here, 'src', 'sprite.svg'), 'utf8').match(/<symbol id="i-logo"[\s\S]*?<\/symbol>/)[0]
const logoSvg = logoSymbol.replace('<symbol id="i-logo"', '<svg xmlns="http://www.w3.org/2000/svg"').replace('</symbol>', '</svg>')
fs.writeFileSync(path.join(STATIC, 'favicon.svg'), logoSvg)
await sharp(Buffer.from(logoSvg)).resize(32, 32).png().toFile(path.join(STATIC, 'favicon-32.png'))
const appleSvg = logoSvg.replace('rx="16"', 'rx="0"')
await sharp(Buffer.from(appleSvg), { density: 600 }).resize(180, 180).png().toFile(path.join(STATIC, 'apple-touch-icon.png'))
fs.writeFileSync(path.join(STATIC, 'robots.txt'), 'User-agent: *\nAllow: /\n')

const fontUrl = (f) => 'file://' + path.join(here, 'fonts-src', f)
const shot = 'file://' + path.join(MEDIA, 'how-2.webp')
const og = `<!doctype html><html><head><style>
@font-face{font-family:F;src:url(${fontUrl('Fraunces.ttf')});font-weight:100 900}
@font-face{font-family:M;src:url(${fontUrl('Manrope.ttf')});font-weight:200 800}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;overflow:hidden;background:#141B34;color:#FFF8EC;font-family:M;position:relative}
.glow{position:absolute;inset:0;background:radial-gradient(50% 70% at 85% 30%,rgba(245,165,36,.28),transparent 70%)}
.copy{position:absolute;left:72px;top:64px;width:640px}
.logo{display:flex;align-items:center;gap:14px;font-family:F;font-weight:650;font-size:40px;letter-spacing:-.03em;font-variation-settings:'opsz' 72}
.logo svg{width:54px;height:54px;border-radius:14px;box-shadow:0 0 0 2px rgba(245,165,36,.4)}
h1{margin-top:58px;font-family:F;font-weight:650;font-size:86px;line-height:1.02;letter-spacing:-.03em;font-variation-settings:'opsz' 72}
h1 em{font-style:normal;color:#F5A524}
p{margin-top:26px;font-size:28px;font-weight:600;color:#C3C8D8;line-height:1.35}
.phone{position:absolute;right:86px;top:56px;width:300px;padding:9px;border-radius:44px;background:#0b0f20;box-shadow:0 0 0 2px rgba(255,255,255,.08),0 40px 80px -20px rgba(0,0,0,.6);transform:rotate(4deg)}
.phone img{display:block;width:100%;border-radius:36px}
.tag{position:absolute;left:72px;bottom:56px;display:flex;gap:12px;font-size:22px;font-weight:800}
.tag span{padding:9px 16px;border-radius:99px;background:rgba(255,248,236,.08);box-shadow:inset 0 0 0 1px rgba(255,248,236,.18)}
</style></head><body><div class="glow"></div>
<div class="copy"><div class="logo">${logoSvg}<span>bayana</span></div>
<h1>From first WhatsApp to <em>bayana</em>.</h1>
<p>The WhatsApp CRM for real-estate brokerages.</p></div>
<div class="tag"><span>Replies in seconds</span><span>Verified visits</span><span>Your data stays yours</span></div>
<div class="phone"><img src="${shot}"></div></body></html>`
const ogFile = path.join(CAP, 'og.html')
fs.writeFileSync(ogFile, og)
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } })
await page.goto('file://' + ogFile)
await page.evaluate(() => document.fonts.ready)
await page.waitForTimeout(300)
await page.screenshot({ path: path.join(STATIC, 'og.png') })
await browser.close()
await sharp(path.join(STATIC, 'og.png')).png({ compressionLevel: 9, palette: false }).toBuffer().then((b) => fs.writeFileSync(path.join(STATIC, 'og.png'), b))
console.log('og.png', kb(path.join(STATIC, 'og.png')))
