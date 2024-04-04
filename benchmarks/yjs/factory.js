
import { setBenchmarkResult, gen, N, benchmarkTime, logMemoryUsed, getMemUsed, runBenchmark } from '../../js-lib/utils.js'
import { AbstractCrdt, CrdtFactory } from '../../js-lib/index.js' // eslint-disable-line
import * as Y from 'yjs'
import { HocuspocusProvider, HocuspocusProviderWebsocket } from "@hocuspocus/provider";
import { WebsocketProvider } from './y-websocket.js';
import ws from 'ws'

export const name = 'yjs'

/**
 * @implements {CrdtFactory}
 */
export class YjsFactory {
  /**
   * @param {function(Uint8Array, boolean):void} [updateHandler]
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
   * @param {function(Uint8Array, boolean):void} [updateHandler]
   * @param {boolean} [connectToServer]
   * @param {string} [serverUrl]
   * @param {string} [documentName]
   */
  constructor (updateHandler, connectToServer, serverUrl, documentName) {
    this.ydoc = new Y.Doc()
    if (updateHandler) {
      this.ydoc.on('update', (update, origin, doc, transaction) => {
        // @ts-ignore
        updateHandler(update, transaction.local)
      })
    }
    this.yarray = this.ydoc.getArray('array')
    this.ymap = this.ydoc.getMap('map')
    this.ytext = this.ydoc.getText('text')
    this.awarenessSyncTime = [];

    if (connectToServer) {
      // this.provider = new HocuspocusProvider(
      //   {
      //     websocketProvider: new HocuspocusProviderWebsocket({
      //       // We don’t need which port the server is running on, but
      //       // we can get the URL from the passed server instance.
      //       url: serverUrl, //"ws://yjs-she.test.seewo.com",
      //       parameters: {wopiEnabled: '0', yDocField: 'map'},
      //       // Pass a polyfill to use WebSockets in a Node.js environment.
      //       WebSocketPolyfill: ws,
      //     }),
      //     name: documentName,
      //     document: this.ydoc,
      //     preserveConnection: false,
      //     token: "mock",
      //     //token: "eyJhbGciOiJSUzUxMiJ9.eyJzdWIiOiIxMzM2ODc1MjgxMjg1MTM7c21odHF6bmpnd3ZudndycHV4c3lxcnk1N201NDI1MTE7MSIsImV4cCI6MTcwNDc5OTk4M30.Wv9JOfMwMcdhbn8RXgAXFzU8dY6JPox0xpIxcTOP31ewhqQec6cfwy0oJFrKNVA8F2KakBZRjipVBPtgCd7s0bHuQca-3GCHLxIf_UvywgLB9KGrdaeiwNaXSCEPzq7aakwQyZ4M1Jy91FEJSp-CYzz_kCJAOCXkoXrRpyRuKCUXPL7H41WeaQMtv86YUKsRVfodKlwYqtRxhLaj84JyFrSBVsgAtijZBcuDZKJKVISjXCOoOVxp8swAw-jRMSV_P_zdc-njIz59c_qMR5u2h8H9oW8aeGzoAiVVBs8CZFa5OQ7a56meZF0egb2M3jmVoJgng2SLAU12aXZ4Gql-1C46kKjZ10KLd94CW3PGzfmtsZ9xuGJm4HQnVBdstFxFH5FIsZRC5Ig7f3vyWB8molFzb8RVPDXWM747TA7i8wWz7VHMEWVO6MKbovTjgMBFoT5K6bseyTptrfIEuf4Z0FjSycmHh15hjsPQf3lVD_g1lCY5CBCOjpiUGqN-dWE3t31Nxsp3hGGlWxsl6TJdYwF-k4lgD7WuCZPex-sjWCDEBidf8aBjl_z6ZBiowBjNoelWK4A-3wCGT1Sx-OyrBZQgrF64KkbjhnFjmWDEgAUxTpNSKNzgFGYoaZEOvndXKBQ-jVxEzbZgrrOkHt5yUg0DjUyv5H_fXAgbVK5Pfps"
          
      //   } 
      // );

      this.provider = new WebsocketProvider(
        serverUrl,
        'mock/' + documentName,
        this.ydoc,
        {
          WebSocketPolyfill: ws,
          params: {token: 'xx-token', wopi_base_url: 'mock', crdt_branch: '1'},
        }
      );

      // this.provider.on("synced", () => {
      this.provider.on("sync", () => {
        this.providerSynced = true;
      });

      // this.provider.on("awarenessChange", ({ states }) => {
      //   for(let clientState of states) {
      //     if(clientState.clientId == this.provider?.awareness?.clientID) {
      //       continue;
      //     }
      //     for(let prop in clientState) {
      //       console.log(prop)
      //       if(prop === 'clientId') {
      //         continue;
      //       }
      //       let val = clientState[prop];
      //       if(val.ts_) {
      //         let now = new Date().getTime();
      //         let ts = Math.abs(now - val.ts_);
      //         let index = Math.floor(ts/10);
      //         if(index < 10) {
      //           //[0,100)
      //           this.awarenessSyncTime[index] = (this.awarenessSyncTime[index] || 0) + 1;
      //         } else if(index < 20) {
      //           // [100,200)
      //           this.awarenessSyncTime[10] = (this.awarenessSyncTime[10] || 0) + 1;
      //         } else if(index < 50){
      //           // [200,500)
      //           this.awarenessSyncTime[11] = (this.awarenessSyncTime[11] || 0) + 1;
      //         } else if(index < 100) {
      //           // [500,1000)
      //           this.awarenessSyncTime[12] = (this.awarenessSyncTime[12] || 0) + 1;
      //         } else {
      //           // [1000,)
      //           this.awarenessSyncTime[13] = (this.awarenessSyncTime[13] || 0) + 1;
      //         }
      //         if(Math.abs(now - val.ts_) >= 1000) {
      //           setBenchmarkResult(name, `${prop} (awarenessSyncTimeout)`, `${Math.abs(now - val.ts_)} ms`)
      //         }
      //       }
      //     }
      //   }
      // });
    
    }

    this.syncTime = [];
    this.ymap.observe(ymapEvent => {
      if(ymapEvent.transaction.local) {
        // 忽略当前客户端自己的更新
        return;
      }
      if(!this.providerSynced) {
        console.log('wait for provider synced, ignore current event')
        return;
      }
      // 加载完成后等待下一轮才开始计算超时
      ymapEvent.changes.keys.forEach((change, key) => {
        if (change.action === 'add'
            || change.action === 'update') {
          let val = ymapEvent.target.get(key);
          if(val instanceof Y.AbstractType) {
            return;
          }
          if(val.ts_) {
            let now = new Date().getTime();
            let ts = Math.abs(now - val.ts_);
            let index = Math.floor(ts/10);
            if(index < 10) {
              //[0,100)
              this.syncTime[index] = (this.syncTime[index] || 0) + 1;
            } else if(index < 20) {
              // [100,200)
              this.syncTime[10] = (this.syncTime[10] || 0) + 1;
            } else if(index < 50){
              // [200,500)
              this.syncTime[11] = (this.syncTime[11] || 0) + 1;
            } else if(index < 100) {
              // [500,1000)
              this.syncTime[12] = (this.syncTime[12] || 0) + 1;
            } else {
              // [1000,)
              this.syncTime[13] = (this.syncTime[13] || 0) + 1;
            }
            if(Math.abs(now - val.ts_) >= 1000) {
              setBenchmarkResult(name, `${key} (syncTimeout)`, `${Math.abs(now - val.ts_)} ms`)
            }
          }
        } else if (change.action === 'delete') {
          // do nothing
        }
      })
    });
  }

  /**
   * @return {Uint8Array|string}
   */
  getEncodedState (encode = "1") {
    if(encode === "1") {
      return Y.encodeStateAsUpdate(this.ydoc)
    } else {
      return Y.encodeStateAsUpdateV2(this.ydoc)
    }    
  }

  /**
   * @param {Array<Uint8Array>} updates
   * @return {Uint8Array}
   */
  mergeUpdates(updates) {
    return Y.mergeUpdates(updates)
  }

  /**
   * @param {Uint8Array} update
   */
  applyUpdate (update) {
    Y.applyUpdate(this.ydoc, update)
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
    if(val instanceof Y.AbstractType) {
      this.ymap.set(key, val)
    } else {
      // 包装,便于计时
      this.ymap.set(key, {v_:val, clientId_: this.provider?.awareness?.clientID, ts_: new Date().getTime()})
    }
  }

  /**
   * @return {Map<string,any> | Object<string, any>}
   */
  getMap () {
    return this.ymap.toJSON()
  }

  /**
   * 返回clientId
   * @return {number}
   */
  getClientId() {
    return this.provider?.awareness?.clientID || 0;
  }

  /**
   * 返回item个数
   * @return {number}
   */
  getItemSize() {
    let size = 0;
    this.ydoc.store.clients.forEach(v => size = size + v.length);
    return size;
  }

  /**
   * 返回同步延迟数组
   * @return {[]}
   */
  getSyncDelayTime() {
    // @ts-ignore
    return this.syncTime;
  }

  /**
   * @param {string} key
   * @param {any} val
   */
  setAwareness (key, val) {
    if(val instanceof Y.AbstractType) {
      //this.provider?.setAwarenessField(key, val);
      this.provider?.awareness.setLocalStateField(key, val);
    } else {
      // 包装,便于计时
      // this.provider?.setAwarenessField(key, {v_:val, clientId_: this.provider?.awareness?.clientID, ts_: new Date().getTime()})
      this.provider?.awareness.setLocalStateField(key, {v_:val, clientId_: this.provider?.awareness?.clientID, ts_: new Date().getTime()})
    }
  }

  /**
   * 返回Awareness同步延迟数组
   * @return {[]}
   */
  getAwarenessSyncDelayTime() {
    // @ts-ignore
    return this.awarenessSyncTime;
  }
}
