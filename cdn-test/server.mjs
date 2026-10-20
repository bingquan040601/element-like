// CDN 冒烟测试的本地静态服务器（无第三方依赖）。
// 解决的问题：UMD 产物扩展名是 .cjs，常规静态服务器（如 http.server）会以
// octet-stream 返回，浏览器拒绝执行；这里显式把 .cjs 映射为 text/javascript。
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname, join, normalize, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(fileURLToPath(import.meta.url), '..', '..') // 仓库根目录
const PORT = 5199

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.cjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.json': 'application/json'
}

createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://localhost:${PORT}`)
    let path = normalize(decodeURIComponent(url.pathname)).replace(/^[/\\]+/, '')
    if (!path) path = 'cdn-test/index.html'
    const file = join(ROOT, path)
    if (!file.startsWith(ROOT)) throw new Error('forbidden')
    const body = await readFile(file)
    res.writeHead(200, { 'content-type': MIME[extname(file).toLowerCase()] ?? 'application/octet-stream' })
    res.end(body)
  } catch {
    res.writeHead(404)
    res.end('not found')
  }
}).listen(PORT, () => console.log(`cdn-test server: http://localhost:${PORT}/`))
