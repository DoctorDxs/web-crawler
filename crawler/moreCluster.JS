const cluster = require('cluster')
const numCPUs = require('os').cpus().length

function fibonacci (n) {
  return n === 0
    ? 0
    : n === 1
      ? 1
      : fibonacci(n - 1) + fibonacci(n - 2)
}

if (cluster.isMaster) {
  const seqArr = [44, 42, 43, 44]
  let endTaskNum = 0

  console.time('main')
  console.log(`[Master]# Master starts running. pid: ${process.pid}`)

  for (let i = 0; i < numCPUs; i++) {
    const worker = cluster.fork()
    worker.send(seqArr[i])
  }
  cluster.on('message', (worker, message, handle) => {
    console.log(`[Master]# Worker ${worker.id}: ${message}`)
    endTaskNum++
    if (endTaskNum === 4) {
      console.timeEnd('main')
      cluster.disconnect()
    }
  })
  cluster.on('exit', (worker, code, signal) => console.log(`[Master]# Worker ${worker.id} died.`))
} else {
  process.on('message', seq => {
    console.log(`[Worker]# starts calculating...`)
    const start = Date.now()
    const result = fibonacci(seq)
    console.log(`[Worker]# The result of task ${process.pid} is ${result}, taking ${Date.now() - start} ms.`)
    process.send('My task has ended.')
  })
}