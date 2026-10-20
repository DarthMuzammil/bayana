// Builds the static site into dist/: fills in site.config.mjs values, inlines minified CSS and JS,
// subsets the fonts to the characters the page uses, and copies media.
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { transform } from 'esbuild'
import subsetFont from 'subset-font'
import config from './site.config.mjs'

const here = path.dirname(new URL(import.meta.url).pathname)
const src = (f) => path.join(here, 'src', f)
const dist = path.join(here, 'dist')
fs.rmSync(dist, { recursive: true, force: true })
fs.mkdirSync(path.join(dist, 'fonts'), { recursive: true })

let html = fs.readFileSync(src('index.html'), 'utf8')
const sprite = fs.readFileSync(src('sprite.svg'), 'utf8').replace('{{skyline}}', fs.readFileSync(src('skyline.svg'), 'utf8'))

// Contact links
const wa = (text) => `https://wa.me/${config.whatsapp}?text=${encodeURIComponent(text)}`
html = html.replace(/\{\{wa\|([^}]*)\}\}/g, (_, text) => wa(text.replace(/&#39;/g, "'")))
html = html.replaceAll('{{tel}}', `tel:+${config.whatsapp}`)
html = html.replaceAll('{{phone}}', config.phoneDisplay)
html = html.replaceAll('{{site}}', config.siteUrl ? config.siteUrl.replace(/\/?$/, '/') : '')

// Live demo links only when a demo URL is set
if (config.demoUrl) {
  html = html.replace(/<!--nodemo-->[\s\S]*?<!--\/nodemo-->/g, '').replace(/<!--\/?demo-->/g, '')
  html = html.replaceAll('{{demo}}', config.demoUrl)
} else {
  html = html.replace(/<!--demo-->[\s\S]*?<!--\/demo-->/g, '').replace(/<!--\/?nodemo-->/g, '')
}

// "How it works" towers: stage N has N floors (the newest in marigold), a crane until the handover, then a roof and flag.
const tower = (n) => {
  const G = 150, fh = 26, x = 80, w = 80
  const top = G - fh * n
  const parts = [`<path class="ground" d="M-40 ${G}H280"/>`]
  for (let hx = -36; hx < 280; hx += 9) parts.push(`<path class="hatch" d="M${hx} ${G + 1}l-6 7"/>`)
  for (let k = 1; k <= n; k++) {
    const y = G - fh * k
    const wins = [10, 34, 58].map((dx) => `<rect class="win" x="${x + dx}" y="${y + 8}" width="12" height="10"/>`).join('')
    parts.push(`<g class="fl${k === n ? ' new' : ''}" style="--k:${k - 1}"><rect class="body" x="${x}" y="${y}" width="${w}" height="${fh}"/>${wins}</g>`)
  }
  if (n < 4) {
    const t = top - 38
    parts.push(`<path class="crane" d="M196 ${G}V${t}M126 ${t}H222M190 ${t}l6 -12l6 12M140 ${t}v18m-4 0h8v6h-8zM210 ${t}v7h12v-7"/>`)
  } else {
    parts.push(`<path class="roof" d="M74 ${top}H166"/><path class="roof" d="M150 ${top}V${top - 30}"/><path class="flag" d="M150 ${top - 30}L172 ${top - 24}L150 ${top - 18}Z"/>`)
  }
  return `<svg class="tower" viewBox="0 0 240 160" preserveAspectRatio="xMidYMax meet" aria-hidden="true">${parts.join('')}</svg>`
}
html = html.replace(/\{\{tower (\d)\}\}/g, (_, n) => tower(+n))

// Structured data
const jsonld = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Bayana',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Android, iOS, Web',
  description: 'The WhatsApp CRM for real-estate brokerages: instant replies to portal leads, verified site visits, and every client kept with the firm.',
  offers: [
    { '@type': 'Offer', name: 'Starter', price: '4999', priceCurrency: 'INR' },
    { '@type': 'Offer', name: 'Team', price: '11999', priceCurrency: 'INR' },
    { '@type': 'Offer', name: 'Business', price: '21999', priceCurrency: 'INR' },
  ],
}
html = html.replace('{{jsonld}}', JSON.stringify(jsonld))

// Fonts: subset to every character on the page (plus a safety set), pin Fraunces to one style.
const visible = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ')
const attrs = [...html.matchAll(/data-(?:m|y)="([^"]*)"/g)].map((m) => m[1]).join(' ')
const safety = ' 0123456789₹,.%:–—’‘“”…·×+-/()!?abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
const chars = [...new Set(visible + attrs + safety)].filter((c) => c.codePointAt(0) < 0x2c00 || c === '₹').join('')
const fontsDir = path.join(here, 'fonts-src')
const faces = []
const preloads = []
// Italic is only used for a few emphasised words, so it gets a smaller character set.
const italicChars = [...new Set([...html.matchAll(/<em>([^<]*)<\/em>|class="(?:redline|op)"[^>]*>([^<]*)</g)].map((m) => (m[1] ?? '') + (m[2] ?? '')).join('') + ' .,’“”×=–abcdefghijklmnopqrstuvwxyz')].join('')
for (const [family, file, axes, weight, style, text] of [
  ['Fraunces', 'Fraunces.ttf', { opsz: 72, wght: 650, SOFT: 0, WONK: 0 }, '500 800', 'normal', chars],
  ['Fraunces', 'Fraunces-Italic.ttf', { opsz: 72, wght: 520, SOFT: 0, WONK: 0 }, '400 700', 'italic', italicChars],
  ['Manrope', 'Manrope.ttf', { wght: { min: 400, max: 800 } }, '400 800', 'normal', chars],
]) {
  const out = await subsetFont(fs.readFileSync(path.join(fontsDir, file)), text, { targetFormat: 'woff2', variationAxes: axes })
  const name = `${family.toLowerCase()}${style === 'italic' ? '-italic' : ''}-${crypto.createHash('md5').update(out).digest('hex').slice(0, 8)}.woff2`
  fs.writeFileSync(path.join(dist, 'fonts', name), out)
  faces.push(`@font-face{font-family:'${family}';src:url(fonts/${name}) format('woff2');font-weight:${weight};font-style:${style};font-display:swap}`)
  preloads.push(`<link rel="preload" href="fonts/${name}" as="font" type="font/woff2" crossorigin>`)
  console.log(`font ${family} ${style}: ${(out.length / 1024).toFixed(1)} KB`)
}
html = html.replace('{{fontPreloads}}', preloads.join('\n'))

// CSS and JS, minified and inlined
const css = (await transform(faces.join('') + fs.readFileSync(src('styles.css'), 'utf8'), { loader: 'css', minify: true, target: ['chrome100', 'safari15', 'firefox100'] })).code
const js = (await transform(fs.readFileSync(src('main.js'), 'utf8'), { loader: 'js', minify: true, target: ['chrome100', 'safari15', 'firefox100'] })).code
html = html.replace('{{css}}', () => css.trim()).replace('{{js}}', () => js.trim()).replace('{{sprite}}', () => sprite.replace(/\n\s*/g, ''))

// Light HTML minification: drop comments (except the draft note) and collapse whitespace between tags.
html = html.replace(/<!--(?! Draft)[\s\S]*?-->/g, '').replace(/>\s{2,}</g, '>\n<').replace(/\n{2,}/g, '\n')

fs.writeFileSync(path.join(dist, 'index.html'), html)

// Media and static files
const copyDir = (from, to) => {
  if (!fs.existsSync(from)) return
  fs.mkdirSync(to, { recursive: true })
  for (const f of fs.readdirSync(from)) {
    const a = path.join(from, f), b = path.join(to, f)
    fs.statSync(a).isDirectory() ? copyDir(a, b) : fs.copyFileSync(a, b)
  }
}
copyDir(path.join(here, 'src', 'media'), path.join(dist, 'media'))
copyDir(path.join(here, 'src', 'static'), dist)
fs.writeFileSync(path.join(dist, '.nojekyll'), '')

const size = (f) => (fs.statSync(f).size / 1024).toFixed(1)
console.log(`index.html ${size(path.join(dist, 'index.html'))} KB (CSS ${(css.length / 1024).toFixed(1)} KB, JS ${(js.length / 1024).toFixed(1)} KB inlined)`)
if (!config.siteUrl) console.log('note: siteUrl is empty, so og:image is relative. Set it once the page has a public URL.')
