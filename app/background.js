const electron = require('electron')
const TestServer = require('./server')

const doRequest = (path, useSession) => new Promise((resolve) => {
  let done = false
  setTimeout(() => {
    if (done) return
    console.log(`Request to ${path} timeout\n`)
    resolve()
  }, 2000)

  console.log(`Starting request to ${path} ${useSession ? 'WITH' : 'WITHOUT'} session`)
  const options = {
    url: `http://localhost:30001${path}`,
    // partition: 'test'
    session: useSession ? electron.session.fromPartition('persist:test', {cache: true}) : undefined
  } // TODO : session / persist / cache


  const request = electron.net.request(options)
  request.on('error', (err) => {
    console.log(`Request to ${path} got error `, err)
    done = true
    resolve()
  })
  request.on('response', (response) => {
    response.on('data', (chunk) => {
      console.log(`BODY: ${chunk}`)
    })
    response.on('end', () => {
      console.log(`Finished request to ${path}\n`)
      done = true
      resolve()
    })
    response.on('error', (err) => {
      console.log(`Response from ${path} got error `, err, '\n')
      done = true
      resolve()
    })
  })
  request.end()
})

electron.app.on('ready', () => {
  const server = new TestServer()
  server.start()
    .then(() => doRequest('/hello', true))
    .then(() => doRequest('/hello', false))
    .then(() => doRequest('/gzip', true))
    .then(() => doRequest('/gzip', false))
    .then(() => doRequest('/invalid-content-encoding', true))
    .then(() => doRequest('/invalid-content-encoding', false))
    .then(() => process.exit(0))
})
