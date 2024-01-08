
import { AbstractCrdt, CrdtFactory } from '../../js-lib/index.js' // eslint-disable-line
import * as Y from 'yjs'
import { HocuspocusProvider, HocuspocusProviderWebsocket } from "@hocuspocus/provider";
import WebSocket from 'ws'

export const name = 'yjs'

/**
 * @implements {CrdtFactory}
 */
export class YjsFactory {
  /**
   * @param {function(Uint8Array):void} [updateHandler]
   * @param {boolean} [connectToServer]
   * @param {string} [documentName]
   */
  create (updateHandler, connectToServer, documentName) {
    return new YjsCRDT(updateHandler, connectToServer, documentName)
  }

  getName () {
    return name
  }
}

/**
 * @implements {AbstractCrdt}
 */
export class YjsCRDT {
  /**
   * @param {function(Uint8Array):void} [updateHandler]
   * @param {boolean} [connectToServer]
   * @param {string} [documentName]
   */
  constructor (updateHandler, connectToServer, documentName) {
    this.ydoc = new Y.Doc()
    if (updateHandler) {
      this.ydoc.on('updateV2', update => {
        updateHandler(update)
      })
    }
    this.yarray = this.ydoc.getArray('array')
    this.ymap = this.ydoc.getMap('map')
    this.ytext = this.ydoc.getText('text')

    if (connectToServer) {
      
      this.provider = new HocuspocusProvider(
        {
          websocketProvider: new HocuspocusProviderWebsocket({
            // We don’t need which port the server is running on, but
            // we can get the URL from the passed server instance.
            url: "ws://yjs-she.test.seewo.com",
            // Pass a polyfill to use WebSockets in a Node.js environment.
            WebSocketPolyfill: WebSocket,
          }),
          url: "ws://yjs-she.test.seewo.com",
          name: documentName,
          document: this.ydoc,
          preserveConnection: false,
          // token: "token-123",
          parameters: {wopiEnabled: '1', yDocField: 'map'}
        } 
      );
    }
  }

  /**
   * @return {Uint8Array|string}
   */
  getEncodedState () {
    return Y.encodeStateAsUpdateV2(this.ydoc)
  }

  /**
   * @param {Uint8Array} update
   */
  applyUpdate (update) {
    Y.applyUpdateV2(this.ydoc, update)
  }

  /**
   * Insert several items into the internal shared array implementation.
   *
   * @param {number} index
   * @param {Array<any>} elems
   */
  insertArray (index, elems) {
    this.yarray.insert(index, elems)
  }

  /**
   * Delete several items into the internal shared array implementation.
   *
   * @param {number} index
   * @param {number} len
   */
  deleteArray (index, len) {
    this.yarray.delete(index, len)
  }

  /**
   * @return {Array<any>}
   */
  getArray () {
    return this.yarray.toArray()
  }

  /**
   * Insert text into the internal shared text implementation.
   *
   * @param {number} index
   * @param {string} text
   */
  insertText (index, text) {
    this.ytext.insert(index, text)
  }

  /**
   * Delete text from the internal shared text implementation.
   *
   * @param {number} index
   * @param {number} len
   */
  deleteText (index, len) {
    this.ytext.delete(index, len)
  }

  /**
   * @return {string}
   */
  getText () {
    return this.ytext.toString()
  }

  /**
   * @param {function (AbstractCrdt): void} f
   */
  transact (f) {
    this.ydoc.transact(() => f(this))
  }

  /**
   * @param {string} key
   * @param {any} val
   */
  setMap (key, val) {
    this.ymap.set(key, val)
  }

  /**
   * @return {Map<string,any> | Object<string, any>}
   */
  getMap () {
    return this.ymap.toJSON()
  }
}
