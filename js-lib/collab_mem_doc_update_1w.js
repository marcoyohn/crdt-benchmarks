import { setBenchmarkResult, gen, N, benchmarkTime, logMemoryUsed, getMemUsed, runBenchmark, tryGc } from './utils.js'
import * as prng from 'lib0/prng'
import * as math from 'lib0/math'
import * as t from 'lib0/testing'
import { CrdtFactory, AbstractCrdt } from './index.js' // eslint-disable-line

/**
 * @param {CrdtFactory} crdtFactory
 * @param {function(string):boolean} filter
 */
export const runBenchmarksCollabMemDocUpdate1w = async (crdtFactory, filter) => {
  /**
   * Helper function to run a B1 benchmarks.
   *
   * @template T
   * @param {string} id name of the benchmark e.g. "[B1.1] Description"
   * @param {Array<T>} inputData
   * @param {function(AbstractCrdt, T, number):void} changeFunction Is called on every element in inputData
   */
  const benchmarkTemplate = (id, inputData, changeFunction, docName, totalUpdateCount) => {
    let updateCount = 0;
    let docUpdateSize = 0
    const docUpdates = []
    // https://hub-she.seewo.com/she-engine-res-hub/wopi/files/133687528128513/133687532322817
    tryGc()
    logMemoryUsed(crdtFactory.getName() + ":before doc create", id, 0)
    const doc = crdtFactory.create((update, local) => {
      docUpdateSize = docUpdateSize + update.length
      docUpdates.push(update)
    }, true, 'ws://yjs-she.test.seewo.com', docName)
    logMemoryUsed(crdtFactory.getName() + ":after doc create", id, 0)
    doc.transact( () => {
      for (let i = 0; i < inputData.length; i++) {
        changeFunction(doc, inputData[i], i)
      }
    })
    logMemoryUsed(crdtFactory.getName() + `:after doc insert ${inputData.length} item`, id, 0)

    // 定时更新
    setInterval(() => {
      doc.transact( () => {
        for (let i = 0; i < inputData.length; i++) {
          if(updateCount >= totalUpdateCount) {
            // 超过则退出
            break;
          }
          changeFunction(doc, inputData[i], i)
          updateCount = updateCount + 1;
        }
      })
      tryGc()
      logMemoryUsed(crdtFactory.getName() + `:after doc total update ${updateCount} item`, id, 0)
      setBenchmarkResult(crdtFactory.getName(), `${id} (encodedStateSize)`, `${doc.getEncodedState().length} bytes`)
      setBenchmarkResult(crdtFactory.getName(), `${id} (updatesTotalSize)`, `${math.round(docUpdateSize)} bytes`)
      setBenchmarkResult(crdtFactory.getName(), `${id} (mergeUpdatesTotalSize)`, `${doc.mergeUpdates(docUpdates).length} bytes`)
    
    }, 3000);
    
  }

  await runBenchmark('[CollabMemDocUpdate] 内存-文档更新内存增长场景', filter, benchmarkName => {
    const inputData = [];
    for(let i = 0; i < 1000; i++) {
      inputData.push('key_' + i);
    }

    benchmarkTemplate(
      benchmarkName,
      inputData,
      (doc, s, i) => { doc.setMap(s, 'ClientId_' + doc.getClientId() + ':' + new Date().getTime()) },
      'CollabMemDocUpdate',
      10000
    )
  })

}
