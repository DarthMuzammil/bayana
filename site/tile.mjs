// Tiles review screenshots into contact sheets: node tile.mjs <width> <perSheet> <scale>
import fs from 'node:fs'
import sharp from 'sharp'
const [w, per = 4, scale = 0.5] = process.argv.slice(2).map(Number)
const dir = '/home/muz/landing-page/review'
const files = fs.readdirSync(dir).filter((x) => new RegExp(`^${w}-\\d\\d\\.png$`).test(x)).sort()
for (let k = 0; k < files.length; k += per) {
  const tiles = []
  let x = 0, hmax = 0
  for (const f of files.slice(k, k + per)) {
    const img = sharp(`${dir}/${f}`)
    const m = await img.metadata()
    const tw = Math.round(m.width * scale), th = Math.round(m.height * scale)
    tiles.push({ input: await img.resize(tw).toBuffer(), left: x, top: 0 })
    x += tw + 6; hmax = Math.max(hmax, th)
  }
  await sharp({ create: { width: x, height: hmax, channels: 3, background: '#e11' } }).composite(tiles).png().toFile(`${dir}/sheet-${w}-${k / per}.png`)
}
console.log(files.length, 'screens')
