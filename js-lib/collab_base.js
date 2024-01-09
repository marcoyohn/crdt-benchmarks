import { setBenchmarkResult, gen, N, benchmarkTime, logMemoryUsed, getMemUsed, runBenchmark } from './utils.js'
import * as prng from 'lib0/prng'
import * as math from 'lib0/math'
import * as t from 'lib0/testing'
import { CrdtFactory, AbstractCrdt } from './index.js' // eslint-disable-line

/**
 * @param {CrdtFactory} crdtFactory
 * @param {function(string):boolean} filter
 */
export const runBenchmarksCollabBase = async (crdtFactory, filter) => {
  /**
   * Helper function to run a B1 benchmarks.
   *
   * @template T
   * @param {string} id name of the benchmark e.g. "[B1.1] Description"
   * @param {Array<T>} inputData
   * @param {function(AbstractCrdt, T, number):void} changeFunction Is called on every element in inputData
   */
  const benchmarkTemplate = (id, inputData, changeFunction) => {
    let encodedState = null
    const docUpdates = []
    // https://hub-she.seewo.com/she-engine-res-hub/wopi/files/133687528128513/133687532322817
    const doc = crdtFactory.create((update, local) => docUpdates.push(update), true, 'ws://127.0.0.1:1234', 'collab_base')
    benchmarkTime(crdtFactory.getName(), `${id} (time)`, () => {
      for (let i = 0; i < inputData.length; i++) {
        changeFunction(doc, inputData[i], i)
      }
    })
    const updateSize = docUpdates.reduce((a, b) => a + b.length, 0)
    setBenchmarkResult(crdtFactory.getName(), `${id} (avgUpdateSize)`, `${math.round(updateSize / inputData.length)} bytes`)
    benchmarkTime(crdtFactory.getName(), `${id} (encodeTime)`, () => {
      encodedState = doc.getEncodedState()
    })
    // @ts-ignore
    const documentSize = encodedState.length
    setBenchmarkResult(crdtFactory.getName(), `${id} (docSize)`, `${documentSize} bytes`)

    benchmarkTime(crdtFactory.getName(), `${id} (parseTime)`, () => {
      const startHeapUsed = getMemUsed()
      logMemoryUsed(crdtFactory.getName(), id, startHeapUsed)
    })
    
    // 定时更新
    setInterval(() => {
      let count = 0;
      let randomMod = Math.ceil(Math.random()*1000)
      for (let i = 0; i < inputData.length; i++) {
        if(i % randomMod == 0) {
          if(count > 5) {
            break;
          }
          count++
          changeFunction(doc, inputData[i], i)
        }
      }
    }, 100);
  }

  await runBenchmark('[CollabBase] 基本场景', filter, benchmarkName => {
    const inputData = [];
    for(let i = 0; i < 1000; i++) {
      inputData.push('key_' + i);
    }
    benchmarkTemplate(
      benchmarkName,
      inputData,
      (doc, s, i) => { doc.setMap(s, 'ClientId_' + doc.getClientId() + ':' + new Date().getTime()) },
    )
  })

}
