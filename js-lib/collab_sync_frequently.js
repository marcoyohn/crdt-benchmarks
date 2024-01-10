import { setBenchmarkResult, gen, N, benchmarkTime, logMemoryUsed, getMemUsed, runBenchmark } from './utils.js'
import * as prng from 'lib0/prng'
import * as math from 'lib0/math'
import * as t from 'lib0/testing'
import { CrdtFactory, AbstractCrdt } from './index.js' // eslint-disable-line

/**
 * @param {CrdtFactory} crdtFactory
 * @param {function(string):boolean} filter
 */
export const runBenchmarksCollabSyncFrequently = async (crdtFactory, filter) => {
  /**
   * Helper function to run a B1 benchmarks.
   *
   * @template T
   * @param {string} id name of the benchmark e.g. "[B1.1] Description"
   * @param {Array<T>} inputData
   * @param {function(AbstractCrdt, T, number):void} changeFunction Is called on every element in inputData
   */
  const benchmarkTemplate = (id, inputData, changeFunction) => {
    let docUpdateSize = 0
    // https://hub-she.seewo.com/she-engine-res-hub/wopi/files/133687528128513/133687532322817
    const doc = crdtFactory.create((update, local) => {
      docUpdateSize = docUpdateSize + update.length
    }, true, 'ws://yjs-she.test.seewo.com', 'collab_base')
    
    for (let i = 0; i < inputData.length; i++) {
      changeFunction(doc, inputData[i], i)
    }

    // 定时统计
    let prevDocUpdateSize =  0
    setInterval(() => {
      setBenchmarkResult(crdtFactory.getName(), `${id} (totalItemSize)`, `${doc.getItemSize()} 个`)
      setBenchmarkResult(crdtFactory.getName(), `${id} (updateSize)`, `${math.round(docUpdateSize - prevDocUpdateSize)} bytes`)
      prevDocUpdateSize = docUpdateSize;

      const startHeapUsed = 0; //getMemUsed()
      logMemoryUsed(crdtFactory.getName(), id, startHeapUsed)

      setBenchmarkResult(crdtFactory.getName(), `${id} (syncDelayTime)`, doc.getSyncDelayTime())

    }, 3000);
    
    // 定时更新
    // 同步频发，每秒同步120帧
    setInterval(() => {
      let count = 0;
      let randomMod = Math.ceil(Math.random()*1000)
      while(randomMod < 1000) {
        if(count > 0) {
          break;
        }
        count++
        changeFunction(doc, inputData[randomMod], randomMod);
        randomMod = randomMod + randomMod;
      }
    }, 8);
  }

  await runBenchmark('[CollabSyncFrequently] 同步频繁场景', filter, benchmarkName => {
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
