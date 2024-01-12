import { CrdtFactory } from './utils.js' // eslint-disable-line

import { runBenchmarksCollabDelayBase } from './collab_delay_base.js'
import { runBenchmarksCollabDelayDocUpdateFrequently } from './collab_delay_doc_update_frequently.js'
import { runBenchmarksCollabMemDoc } from './collab_mem_doc.js'
import { runBenchmarksCollabMock } from './collab_mock.js'
import { runBenchmarksCollabCpuDocUpdate } from './collab_cpu_doc_update.js'
import { runBenchmarksCollabCpuAwareness } from './collab_cpu_awareness.js'
import { runBenchmarksCollabMemDocUpdate1w } from './collab_mem_doc_update_1w.js'
import { runBenchmarksCollabMemDocUpdate100w } from './collab_mem_doc_update_100w.js'
export * from './b4-editing-trace.js'
export * from './utils.js'

/**
 * @param {CrdtFactory} crdtFactory
 * @param {function(string):boolean} testFilter
 */
export const runBenchmarks = async (crdtFactory, testFilter) => {
  //await runBenchmarksCollabDelayBase(crdtFactory, testFilter);
  //await runBenchmarksCollabDelayDocUpdateFrequently(crdtFactory, testFilter);

  //await runBenchmarksCollabMemDoc(crdtFactory, testFilter);
  //await runBenchmarksCollabMemDocUpdate1w(crdtFactory, testFilter);
  await runBenchmarksCollabMemDocUpdate100w(crdtFactory, testFilter);
  
  
  //await runBenchmarksCollabCpuDocUpdate(crdtFactory, testFilter);
  //await runBenchmarksCollabCpuAwareness(crdtFactory, testFilter);

  //await runBenchmarksCollabMock(crdtFactory, testFilter);
}
