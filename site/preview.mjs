// Serves dist/ on http://127.0.0.1:4321 (this machine only) for checking the build.
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'

const root = path.join(path.dirname(new URL(import.meta.url).pathname), 'dist')
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.avif': 'image/avif', '.mp4': 'video/mp4', '.webm': 'video/webm', '.woff2': 'font/woff2', '.txt': 'text/plain' }
const port = +(process.env.PORT ?? 4321)

http
  .createServer((req, res) => {
    const url = decodeURIComponent(new URL(req.url, 'http://x').pathname)
    let file = path.join(root, url)
    if (!file.startsWith(root)) return res.writeHead(403).end()
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html')
    if (!fs.existsSync(file)) return res.writeHead(404).end('not found')
    const stat = fs.statSync(file)
    const type = types[path.extname(file)] ?? 'application/octet-stream'
    // Range requests so videos can seek like on a real host.
    const range = req.headers.range?.match(/bytes=(\d*)-(\d*)/)
    if (range) {
      const start = +range[1] || 0
      const end = range[2] ? +range[2] : stat.size - 1
      res.writeHead(206, { 'Content-Type': type, 'Content-Range': `bytes ${start}-${end}/${stat.size}`, 'Accept-Ranges': 'bytes', 'Content-Length': end - start + 1 })
      return fs.createReadStream(file, { start, end }).pipe(res)
    }
    // Compress text like a real host (GitHub Pages, Netlify, Cloudflare) does.
    if (/html|css|javascript|svg|plain/.test(type) && /gzip/.test(req.headers['accept-encoding'] ?? '')) {
      const body = zlib.gzipSync(fs.readFileSync(file), { level: 9 })
      res.writeHead(200, { 'Content-Type': type, 'Content-Encoding': 'gzip', 'Content-Length': body.length, Vary: 'Accept-Encoding' })
      return res.end(body)
    }
    res.writeHead(200, { 'Content-Type': type, 'Content-Length': stat.size, 'Accept-Ranges': 'bytes' })
    fs.createReadStream(file).pipe(res)
  })
  .listen(port, '127.0.0.1', () => console.log(`preview: http://127.0.0.1:${port}/`))
