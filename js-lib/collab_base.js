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
    {
      const docUpdates = []
      const doc = crdtFactory.create(update => { docUpdates.push(update) }, true, 'collab_base')
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
    }
    benchmarkTime(crdtFactory.getName(), `${id} (parseTime)`, () => {
      const startHeapUsed = getMemUsed()
      const doc = crdtFactory.create()
      doc.applyUpdate(encodedState)
      logMemoryUsed(crdtFactory.getName(), id, startHeapUsed)
    })
  }

  await runBenchmark('[CollabBase] 基本场景', filter, benchmarkName => {
    const inputData = [];
    for(let i = 0; i < 1000; i++) {
      inputData.push['key_' + i];
    }
    benchmarkTemplate(
      benchmarkName,
      inputData,
      (doc, s, i) => { doc.setMap(s, benchmarkName + '_' + i) },
    )
  })
  console.log('runBenchmark completed');
}
