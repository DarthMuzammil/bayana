import fs from 'node:fs'
import sharp from 'sharp'
const [dir, w, per, scale] = [process.argv[2], process.argv[3], +process.argv[4], +process.argv[5]]
const files = fs.readdirSync(dir).filter((x) => x.startsWith(w + '-') && x.endsWith('.png') && !x.includes('sheet')).sort()
for (let k = 0; k < files.length; k += per) {
  const tiles = []; let x = 0, hmax = 0
  for (const f of files.slice(k, k + per)) { const m = await sharp(`${dir}/${f}`).metadata(); const tw = Math.round(m.width * scale), th = Math.round(m.height * scale); tiles.push({ input: await sharp(`${dir}/${f}`).resize(tw).toBuffer(), left: x, top: 0 }); x += tw + 6; hmax = Math.max(hmax, th) }
  await sharp({ create: { width: x, height: hmax, channels: 3, background: '#e11' } }).composite(tiles).png().toFile(`${dir}/sheet-${w}-${k / per}.png`)
}
console.log(files.length)
