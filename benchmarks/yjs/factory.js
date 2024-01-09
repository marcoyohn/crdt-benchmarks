
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
   * @param {string} [serverUrl]
   * @param {string} [documentName]
   */
  create (updateHandler, connectToServer, serverUrl, documentName) {
    return new YjsCRDT(updateHandler, connectToServer, serverUrl, documentName)
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
   * @param {string} [serverUrl]
   * @param {string} [documentName]
   */
  constructor (updateHandler, connectToServer, serverUrl, documentName) {
    this.ydoc = new Y.Doc()
    if (updateHandler) {
      this.ydoc.on('update', update => {
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
            url: serverUrl, //"ws://yjs-she.test.seewo.com",
            parameters: {wopiEnabled: '1', yDocField: 'map'},
            // Pass a polyfill to use WebSockets in a Node.js environment.
            WebSocketPolyfill: WebSocket,
          }),
          name: documentName,
          document: this.ydoc,
          preserveConnection: false,
          //token: "mock",
          token: "eyJhbGciOiJSUzUxMiJ9.eyJzdWIiOiIxMzM2ODc1MjgxMjg1MTM7c21odHF6bmpnd3ZudndycHV4c3lxcnk1N201NDI1MTE7MSIsImV4cCI6MTcwNDc5OTk4M30.Wv9JOfMwMcdhbn8RXgAXFzU8dY6JPox0xpIxcTOP31ewhqQec6cfwy0oJFrKNVA8F2KakBZRjipVBPtgCd7s0bHuQca-3GCHLxIf_UvywgLB9KGrdaeiwNaXSCEPzq7aakwQyZ4M1Jy91FEJSp-CYzz_kCJAOCXkoXrRpyRuKCUXPL7H41WeaQMtv86YUKsRVfodKlwYqtRxhLaj84JyFrSBVsgAtijZBcuDZKJKVISjXCOoOVxp8swAw-jRMSV_P_zdc-njIz59c_qMR5u2h8H9oW8aeGzoAiVVBs8CZFa5OQ7a56meZF0egb2M3jmVoJgng2SLAU12aXZ4Gql-1C46kKjZ10KLd94CW3PGzfmtsZ9xuGJm4HQnVBdstFxFH5FIsZRC5Ig7f3vyWB8molFzb8RVPDXWM747TA7i8wWz7VHMEWVO6MKbovTjgMBFoT5K6bseyTptrfIEuf4Z0FjSycmHh15hjsPQf3lVD_g1lCY5CBCOjpiUGqN-dWE3t31Nxsp3hGGlWxsl6TJdYwF-k4lgD7WuCZPex-sjWCDEBidf8aBjl_z6ZBiowBjNoelWK4A-3wCGT1Sx-OyrBZQgrF64KkbjhnFjmWDEgAUxTpNSKNzgFGYoaZEOvndXKBQ-jVxEzbZgrrOkHt5yUg0DjUyv5H_fXAgbVK5Pfps"
          
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
