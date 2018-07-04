const http = require('http')
const {parse} = require('url')
const zlib = require('zlib')

module.exports = class TestServer {
  constructor ({port = 30001} = {}) {
    this.server = http.createServer(this.router)
    this.port = port
    this.hostname = 'localhost'
    this.server.on('error', err => console.log(err.stack))
    this.server.on('connection', socket => socket.setTimeout(1500))
  }

  start () {
    return new Promise((resolve, reject) => this.server.listen(this.port, '127.0.0.1', this.hostname, err => err ? reject(err) : resolve()))
  }

  stop () {
    return new Promise((resolve, reject) => this.server.close(err => err ? reject(err) : resolve()))
  }

  router (req, res) {
    let p = parse(req.url).pathname

    if (p === '/hello') {
      res.statusCode = 200
      res.setHeader('Content-Type', 'text/plain')
      res.end('world')
    }

    if (p === '/gzip') {
      res.statusCode = 200
      res.setHeader('Content-Type', 'text/plain')
      res.setHeader('Content-Encoding', 'gzip')
      zlib.gzip('hello world', (err, buffer) => {
        if (err) console.error(err)
        res.end(buffer)
      })
    }

    if (p === '/invalid-content-encoding') {
      res.statusCode = 200
      res.setHeader('Content-Type', 'text/plain')
      res.setHeader('Content-Encoding', 'gzip')
      res.end('fake gzip string')
    }
  }
}
