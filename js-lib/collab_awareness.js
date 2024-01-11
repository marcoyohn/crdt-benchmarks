import { setBenchmarkResult, gen, N, benchmarkTime, logMemoryUsed, getMemUsed, runBenchmark } from './utils.js'
import * as prng from 'lib0/prng'
import * as math from 'lib0/math'
import * as t from 'lib0/testing'
import { CrdtFactory, AbstractCrdt } from './index.js' // eslint-disable-line

/**
 * @param {CrdtFactory} crdtFactory
 * @param {function(string):boolean} filter
 */
export const runBenchmarksCollabAswareness = async (crdtFactory, filter) => {
  /**
   * Helper function to run a B1 benchmarks.
   *
   * @template T
   * @param {string} id name of the benchmark e.g. "[B1.1] Description"
   * @param {Array<T>} inputData
   * @param {function(AbstractCrdt, T, number):void} changeFunction Is called on every element in inputData
   * @param {string} docName
   */
  const benchmarkTemplate = (id, inputData, changeFunction, docName) => {
    let docUpdateSize = 0
    // https://hub-she.seewo.com/she-engine-res-hub/wopi/files/133687528128513/133687532322817
    const doc = crdtFactory.create((update, local) => {
      docUpdateSize = docUpdateSize + update.length
    }, true, 'ws://yjs-she.test.seewo.com', docName)

    // 定时统计
    let prevDocUpdateSize =  0
    setInterval(() => {
      setBenchmarkResult(crdtFactory.getName(), `${id} (totalItemSize)`, `${doc.getItemSize()} 个`)
      setBenchmarkResult(crdtFactory.getName(), `${id} (updateSize)`, `${math.round(docUpdateSize - prevDocUpdateSize)} bytes`)
      prevDocUpdateSize = docUpdateSize;

      const startHeapUsed = 0; //getMemUsed()
      logMemoryUsed(crdtFactory.getName(), id, startHeapUsed)

      setBenchmarkResult(crdtFactory.getName(), `${id} (awarenessSyncDelayTime)`, doc.getAwarenessSyncDelayTime())

    }, 3000);
    
    // 定时更新
    setInterval(() => {
      changeFunction(doc, 'key_0', 0);
    }, 16);
  }

  await runBenchmark('[CollabAwareness] awareness场景', filter, benchmarkName => {
    const inputData = [];
    for(let i = 0; i < 1; i++) {
      inputData.push('key_' + i);
    }
    benchmarkTemplate(
      benchmarkName,
      inputData,
      (doc, s, i) => { doc.setAwareness(s, 'ClientId_' + doc.getClientId() + ':' + new Date().getTime()) },
      'collab_awareness'
    ) 
  })

}
