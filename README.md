* Electron Version: all versions >= 1.7 (tested on 1.7.0, 1.7.15, 1.8.7, 2.0.4)
* Operating System (Platform and Version): macOS 10.13.5
* Last known working Electron version: 1.6.18

**Expected Behavior**
When an endpoint responds with an incorrect `'content-encoding'`, the `response` object from the `net` request should emit a `net::ERR_CONTENT_DECODING_FAILED` error.

**Actual behavior**
When making a request to an endpoint that responds with an incorrect `'content-encoding'`:
- With a persistent (or the default) session, it behaves normally (emitting a `net::ERR_CONTENT_DECODING_FAILED` error)
- With a non-persistent session, nothing happens. We never get the error.

**To Reproduce**

```sh
git clone https://github.com/arantes555/electron-bug-net-content-encoding.git -b master
cd electron-bug-net-content-encoding

# electron@2.0
npm install
npm start # see that the last request gives a timeout


# electron@1.6
git checkout electron-1.6
npm install
npm start # see that all requests behave as intended
```

 **Additional information**

It seems somewhat related to https://github.com/electron/electron/issues/8867 , but it is definitely not the same issue.
