import { CrdtFactory } from './utils.js' // eslint-disable-line

import { runBenchmarksCollabBase } from '../js-lib/collab_base.js'
export * from './b4-editing-trace.js'
export * from './utils.js'

/**
 * @param {CrdtFactory} crdtFactory
 * @param {function(string):boolean} testFilter
 */
export const runBenchmarks = async (crdtFactory, testFilter) => {
  await runBenchmarksCollabBase(crdtFactory, testFilter);
}
