import { CrdtFactory } from './utils.js' // eslint-disable-line

import { runBenchmarksCollabBase } from '../js-lib/collab_base.js'
import { runBenchmarksCollabComplex } from './collab_complex.js'
import { runBenchmarksCollabMultiUser } from './collab_multi_user.js'
import { runBenchmarksCollabMultiMesh } from './collab_multi_mesh.js'
import { runBenchmarksCollabSyncFrequently } from './collab_sync_frequently.js'
import { runBenchmarksCollabMock } from './collab_mock.js'
import { runBenchmarksCollabAswareness } from './collab_awareness.js'
export * from './b4-editing-trace.js'
export * from './utils.js'

/**
 * @param {CrdtFactory} crdtFactory
 * @param {function(string):boolean} testFilter
 */
export const runBenchmarks = async (crdtFactory, testFilter) => {
  //await runBenchmarksCollabBase(crdtFactory, testFilter);
  //await runBenchmarksCollabMultiUser(crdtFactory, testFilter);
  //await runBenchmarksCollabMultiMesh(crdtFactory, testFilter);
  await runBenchmarksCollabSyncFrequently(crdtFactory, testFilter);
  //await runBenchmarksCollabComplex(crdtFactory, testFilter);
  //await runBenchmarksCollabMock(crdtFactory, testFilter);
  //await runBenchmarksCollabAswareness(crdtFactory, testFilter);
}
