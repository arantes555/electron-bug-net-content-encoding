const electron = require('electron')
const TestServer = require('./server')

const doRequest = (path, {session}) => new Promise((resolve) => {
  let done = false
  setTimeout(() => {
    if (done) return
    console.error(`/!\\ Request to ${path} TIMEOUT\n`)
    resolve()
  }, 2000)

  console.log(`Starting request to ${path} (session=${JSON.stringify(session)})`)
  const options = {
    url: `http://localhost:30001${path}`,
    session: session
      ? electron.session.fromPartition(session)
      : undefined // using the default session (which is persistent)
  }


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
    // normal, plain-text encoding endpoint : everything works
    .then(() => doRequest('/hello', {session: 'persist:test'}))
    .then(() => doRequest('/hello', {session: 'test'}))
    .then(() => doRequest('/hello', {session: false}))

    // correct gzip-encoded endpoint : everything works
    .then(() => doRequest('/gzip', {session: 'persist:test'}))
    .then(() => doRequest('/gzip', {session: 'test'}))
    .then(() => doRequest('/gzip', {session: false}))

    // bad gzip-encoding : works as intended on 1.6.x (getting an error on the response), abnormal behaviour on 1.7+ and on 2.0+ (timeout)
    .then(() => doRequest('/invalid-content-encoding', {session: 'persist:test'})) // emits an error, as intended
    .then(() => doRequest('/invalid-content-encoding', {session: 'test'})) // /!\ TIMEOUT on 1.7+
    .then(() => doRequest('/invalid-content-encoding', {session: false})) // emits an error, as intended

    .then(() => process.exit(0))
})
