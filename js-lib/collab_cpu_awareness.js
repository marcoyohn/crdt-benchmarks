import { setBenchmarkResult, gen, N, benchmarkTime, logMemoryUsed, getMemUsed, runBenchmark } from './utils.js'
import * as prng from 'lib0/prng'
import * as math from 'lib0/math'
import * as t from 'lib0/testing'
import { CrdtFactory, AbstractCrdt } from './index.js' // eslint-disable-line

/**
 * @param {CrdtFactory} crdtFactory
 * @param {function(string):boolean} filter
 */
export const runBenchmarksCollabCpuAwareness = async (crdtFactory, filter) => {
  /**
   * Helper function to run a B1 benchmarks.
   *
   * @template T
   * @param {string} id name of the benchmark e.g. "[B1.1] Description"
   * @param {function(AbstractCrdt, T, number):void} changeFunction Is called on every element in inputData
   * @param {string} docName
   */
  const benchmarkTemplate = (id, changeFunction, docName) => {
    let totalItemSize = 0
    // https://hub-she.seewo.com/she-engine-res-hub/wopi/files/133687528128513/133687532322817
    const doc = crdtFactory.create((update, local) => {
    }, true, 'ws://172.30.115.95:1234/ws/', docName + ".cowork")

    // 定时统计
    let prevDocUpdateSize =  0
    setInterval(() => {
      setBenchmarkResult(crdtFactory.getName(), `${id} (totalItemSize)`, `${totalItemSize} 个`)

      const startHeapUsed = 0; //getMemUsed()
      logMemoryUsed(crdtFactory.getName(), id, startHeapUsed)

    }, 10000);
    
    // 定时更新
    setInterval(() => {
      // @ts-ignore
      changeFunction(doc, 'key_0', 0);
      totalItemSize = totalItemSize + 1;
    }, 16);
  }

  await runBenchmark('[CollabCpuAwareness] awareness并发更新场景', filter, benchmarkName => {
    let count = 0;
    while(count < 20) {
      benchmarkTemplate(
        benchmarkName,
        (doc, s, i) => { doc.setAwareness(s, 'ClientId_' + doc.getClientId() + ':' + new Date().getTime()) },
        'CollabCpuAwareness_' + count + "_" + new Date().getTime()
      ); 
      count++
    }
  })

}
