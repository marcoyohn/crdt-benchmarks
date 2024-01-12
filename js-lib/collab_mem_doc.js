import { setBenchmarkResult, gen, N, benchmarkTime, logMemoryUsed, getMemUsed, runBenchmark, tryGc } from './utils.js'
import * as prng from 'lib0/prng'
import * as math from 'lib0/math'
import * as t from 'lib0/testing'
import { CrdtFactory, AbstractCrdt } from './index.js' // eslint-disable-line

/**
 * @param {CrdtFactory} crdtFactory
 * @param {function(string):boolean} filter
 */
export const runBenchmarksCollabMemDoc = async (crdtFactory, filter) => {
  /**
   * Helper function to run a B1 benchmarks.
   *
   * @template T
   * @param {string} id name of the benchmark e.g. "[B1.1] Description"
   * @param {Array<T>} inputData
   * @param {function(AbstractCrdt, T, number):void} changeFunction Is called on every element in inputData
   */
  const benchmarkTemplate = (id, inputData, changeFunction, docName) => {
    let docUpdateSize = 0
    // https://hub-she.seewo.com/she-engine-res-hub/wopi/files/133687528128513/133687532322817
    tryGc()
    logMemoryUsed(crdtFactory.getName() + ":before doc create", id, 0)
    const doc = crdtFactory.create((update, local) => {
      docUpdateSize = docUpdateSize + update.length
    }, true, 'ws://yjs-she.test.seewo.com', docName)
    logMemoryUsed(crdtFactory.getName() + ":after doc create", id, 0)
    doc.transact( () => {
      for (let i = 0; i < inputData.length; i++) {
        changeFunction(doc, inputData[i], i)
      }
    })
    logMemoryUsed(crdtFactory.getName() + `:after doc insert ${inputData.length} item`, id, 0)

    // 定时统计
    setInterval(() => {
      setBenchmarkResult(crdtFactory.getName(), `${id} (totalItemSize)`, `${doc.getItemSize()} 个`)
      setBenchmarkResult(crdtFactory.getName(), `${id} (docSize)`, `${docUpdateSize} bytes`)

      const startHeapUsed = 0; //getMemUsed()
      logMemoryUsed(crdtFactory.getName(), id, startHeapUsed)

    }, 10000);
    
  }

  await runBenchmark('[CollabMemDoc] 内存-单一文档场景', filter, benchmarkName => {
    const inputData = [];
    for(let i = 0; i < 10000; i++) {
      inputData.push('key_' + i);
    }
    benchmarkTemplate(
      benchmarkName,
      inputData,
      (doc, s, i) => { doc.setMap(s, 'ClientId_' + doc.getClientId() + ':' + new Date().getTime()) },
      'CollabMemDoc_' + new Date().getTime()
    )
  })

}
