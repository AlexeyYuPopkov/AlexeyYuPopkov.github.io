// Compiles a dart2wasm-generated main module from `source` which can then
// be instantiated via the `instantiate` method.
//
// `source` needs to be a `Response` object (or promise thereof) e.g. created
// via the `fetch()` JS API.
export async function compileStreaming(source) {
  const builtins = {builtins: ['js-string'], importedStringConstants: ''};
  return new CompiledApp(
      await _compileStreaming(source, builtins), builtins);
}

// Compiles a dart2wasm-generated wasm module from `bytes` which is then
// instantiable via the `instantiate` method.
export async function compile(bytes) {
  const builtins = {builtins: ['js-string'], importedStringConstants: ''};
  return new CompiledApp(await WebAssembly.compile(bytes, builtins), builtins);
}

let _isCompileStreamingSupported;
async function _compileStreaming(source, builtins) {
  _isCompileStreamingSupported ??= WebAssembly.compileStreaming(
    new Response(
      new Uint8Array([0,97,115,109,1,0,0,0,1,4,1,96,0,0,2,23,1,14,119,97,115,109,58,106,115,45,115,116,114,105,110,103,4,99,97,115,116,0,0]),
      {headers: {'Content-Type': 'application/wasm'}},
    ),
    builtins,
  ).then(() => false, (e) => e instanceof WebAssembly.CompileError);
  if (await _isCompileStreamingSupported) {
    return WebAssembly.compileStreaming(source, builtins);
  }
  return WebAssembly.compile(await (await source).arrayBuffer(), builtins);
}

class CompiledApp {
  constructor(module, builtins) {
    this.module = module;
    this.builtins = builtins;
  }

  // The second argument is an options object containing:
  // `loadDeferredModules` is a JS function that takes an array of module names
  //   matching wasm files produced by the dart2wasm compiler. It also takes a
  //   callback that should be invoked for each loaded module with 2 arguments:
  //   (1) the module name, (2) the loaded module in a format supported by
  //   `WebAssembly.compile` or `WebAssembly.compileStreaming`. The callback
  //   returns a Promise that resolves when the module is instantiated.
  //   loadDeferredModules should return a Promise that resolves when all the
  //   modules have been loaded and the callback promises have resolved.
  // `loadDeferredId` is a JS function that takes load ID produced by the
  //   compiler when the `use-load-ids` option is passed. Each load ID maps to
  //   one or more wasm files as specified in the emitted JSON file. It also
  //   takes a callback that should be invoked for each loaded module with 2
  //   arguments: (1) the module name, (2) the loaded module in a format
  //   supported by `WebAssembly.compile` or `WebAssembly.compileStreaming`.
  //   The callback returns a Promise that resolves when the module is
  //   instantiated.
  //   loadDeferredId should return a Promise that resolves when all the
  //   modules have been loaded and the callback promises have resolved.
  async instantiate(additionalImports, {loadDeferredModules, loadDeferredId} = {}) {
    let dartInstance;

    // Prints to the console
    function printToConsole(value) {
      if (typeof dartPrint == "function") {
        dartPrint(value);
        return;
      }
      if (typeof console == "object" && typeof console.log != "undefined") {
        console.log(value);
        return;
      }
      if (typeof print == "function") {
        print(value);
        return;
      }

      throw "Unable to print message: " + value;
    }

    // A special symbol attached to functions that wrap Dart functions.
    const jsWrappedDartFunctionSymbol = Symbol("JSWrappedDartFunction");

    function finalizeWrapper(dartFunction, wrapped) {
      wrapped.dartFunction = dartFunction;
      wrapped[jsWrappedDartFunctionSymbol] = true;
      return wrapped;
    }

    // Imports
    const dart2wasm = {
            AB: () => globalThis.Math,
      AC: Function.prototype.call.bind(DataView.prototype.setInt32),
      AD: x0 => x0.visualViewport,
      AE: (x0,x1) => x0.getComputedStyle(x1),
      AF: x0 => x0.right,
      AG: o => Object.keys(o),
      AH: (x0,x1) => x0.dispatchEvent(x1),
      AI: (ms, c) =>
      setInterval(() => dartInstance.exports.$invokeCallback(c), ms),
      AJ: x0 => x0.response,
      AK: x0 => x0.close(),
      AL: () => globalThis.window,
      AM: () => new MessageChannel(),
      AN: (x0,x1) => x0.dart_sqlite3_malloc(x1),
      AO: x0 => x0.byteLength,
      AP: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2) { return wasmFunction(f,arguments.length,x0,x1,x2) }),
      AQ: (x0,x1,x2) => x0.postMessage(x1,x2),
      AR: x0 => x0.sessionStorage,
      B: s => printToConsole(s),
      BB: (x0,x1,x2,x3) => x0.addEventListener(x1,x2,x3),
      BC: Function.prototype.call.bind(DataView.prototype.setUint32),
      BD: x0 => x0.devicePixelRatio,
      BE: x0 => x0.documentElement,
      BF: x0 => x0.clientY,
      BG: x0 => x0.state,
      BH: (x0,x1) => x0.createEvent(x1),
      BI: () => Date.now(),
      BJ: (x0,x1) => { x0.responseType = x1 },
      BK: x0 => x0.naturalHeight,
      BL: (x0,x1) => { x0.innerText = x1 },
      BM: x0 => new BroadcastChannel(x0),
      BN: (x0,x1,x2,x3,x4) => x0.dart_sqlite3_bind_text(x1,x2,x3,x4),
      BO: x0 => x0.synchronizationBuffer,
      BP: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      BQ: x0 => x0.randomUUID(),
      BR: (x0,x1,x2,x3) => x0.decrypt(x1,x2,x3),
      C: Function.prototype.call.bind(Number.prototype.toString),
      CB: b => !!b,
      CC: Function.prototype.call.bind(DataView.prototype.setInt16),
      CD: x0 => x0.height,
      CE: x0 => x0.computedStyleMap(),
      CF: x0 => x0.clientX,
      CG: x0 => x0.hash,
      CH: (x0,x1,x2,x3) => x0.initEvent(x1,x2,x3),
      CI: (x0,x1,x2) => x0.insertBefore(x1,x2),
      CJ: x0 => x0.vendor,
      CK: x0 => x0.naturalWidth,
      CL: x0 => x0.offsetY,
      CM: x0 => globalThis.Array.isArray(x0),
      CN: (x0,x1,x2,x3) => x0.sqlite3_bind_double(x1,x2,x3),
      CO: (x0,x1,x2) => x0.postMessage(x1,x2),
      CP: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      CQ: () => globalThis.crypto,
      CR: x0 => x0.subtle,
      D: Function.prototype.call.bind(BigInt.prototype.toString),
      DB: () => globalThis.document,
      DC: Function.prototype.call.bind(DataView.prototype.setUint16),
      DD: x0 => x0.width,
      DE: (x0,x1) => x0.get(x1),
      DF: x0 => x0.changedTouches,
      DG: x0 => x0.state,
      DH: x0 => x0.readText(),
      DI: x0 => x0.id,
      DJ: x0 => x0.navigator,
      DK: (x0,x1) => { x0.src = x1 },
      DL: x0 => x0.offsetX,
      DM: x0 => x0.table,
      DN: (x0,x1,x2,x3) => x0.sqlite3_bind_int64(x1,x2,x3),
      DO: x0 => new SharedArrayBuffer(x0),
      DP: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      DQ: x0 => x0.port2,
      DR: x0 => x0.crypto,
      E: (exn) => {
        let stackString = exn.toString();
        let frames = stackString.split('\n');
        let drop = 4;
        if (frames[0].startsWith('Error')) {
            drop += 1;
        }
        return frames.slice(drop).join('\n');
      },
      EB: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      EC: Function.prototype.call.bind(DataView.prototype.setUint8),
      ED: x0 => x0.screen,
      EE: (o, p) => p in o,
      EF: x0 => x0.key,
      EG: (x0,x1) => x0.go(x1),
      EH: x0 => x0.clipboard,
      EI: x0 => x0.offsetHeight,
      EJ: () => globalThis.window,
      EK: x0 => x0.displayHeight,
      EL: x0 => x0.button,
      EM: x0 => x0.kind,
      EN: x0 => globalThis.BigInt(x0),
      EO: (x0,x1,x2,x3) => ({clientVersion: x0,root: x1,synchronizationBuffer: x2,communicationBuffer: x3}),
      EP: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3,x4) { return wasmFunction(f,arguments.length,x0,x1,x2,x3,x4) }),
      EQ: x0 => x0.terminate(),
      ER: x0 => x0.isSecureContext,
      F: () => new Error().stack,
      FB: (x0,x1) => x0.focus(x1),
      FC: Function.prototype.call.bind(DataView.prototype.setInt8),
      FD: o => {
        if (o === null || o === undefined) return 0;
        if (typeof(o) === 'string') return 1;
        return 2;
      },
      FE: (x0,x1) => { x0.textContent = x1 },
      FF: x0 => x0.identifier,
      FG: (x0,x1) => x0.querySelectorAll(x1),
      FH: (x0,x1) => x0.writeText(x1),
      FI: x0 => x0.offsetWidth,
      FJ: x0 => globalThis.URL.createObjectURL(x0),
      FK: x0 => x0.displayWidth,
      FL: x0 => x0.classList,
      FM: (x0,x1) => x0.postMessage(x1),
      FN: (x0,x1,x2) => x0.sqlite3_bind_null(x1,x2),
      FO: x0 => x0.close(),
      FP: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3) { return wasmFunction(f,arguments.length,x0,x1,x2,x3) }),
      FQ: (x0,x1) => new SharedWorker(x0,x1),
      FR: (x0,x1,x2,x3,x4,x5,x6,x7) => x0.unwrapKey(x1,x2,x3,x4,x5,x6,x7),
      G: s => JSON.stringify(s),
      GB: () => ({}),
      GC: Function.prototype.call.bind(DataView.prototype.getInt8),
      GD: x0 => x0.tabIndex,
      GE: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      GF: x0 => x0.touches,
      GG: (x0,x1) => x0.requestAnimationFrame(x1),
      GH: x0 => x0.unlock(),
      GI: x0 => x0.stopPropagation(),
      GJ: Function.prototype.call.bind(DataView.prototype.getBigUint64),
      GK: x0 => x0.duration,
      GL: x0 => x0.sheet,
      GM: (x0,x1) => ({kind: x0,table: x1}),
      GN: (x0,x1) => x0.sqlite3_bind_parameter_count(x1),
      GO: x0 => x0.getSize(),
      GP: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3) { return wasmFunction(f,arguments.length,x0,x1,x2,x3) }),
      GQ: x0 => x0.start(),
      GR: (x0,x1,x2,x3,x4,x5) => x0.importKey(x1,x2,x3,x4,x5),
      H: Function.prototype.call.bind(Number.prototype.toString),
      HB: (o, p, v) => o[p] = v,
      HC: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Int8Array) return 1;
        return 2;
      },
      HD: (x0,x1) => x0.contains(x1),
      HE: x0 => x0.matches,
      HF: x0 => x0.pressure,
      HG: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      HH: (x0,x1) => x0.lock(x1),
      HI: x0 => x0.disabled,
      HJ: (x0,x1) => ({name: x0,iv: x1}),
      HK: (x0,x1) => ({frameIndex: x0,completeFramesOnly: x1}),
      HL: x0 => x0.head,
      HM: () => ({}),
      HN: (x0,x1) => x0.sqlite3_stmt_isexplain(x1),
      HO: (x0,x1) => x0.truncate(x1),
      HP: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3) { return wasmFunction(f,arguments.length,x0,x1,x2,x3) }),
      HQ: x0 => x0.port,
      HR: (x0,x1,x2,x3) => x0.generateKey(x1,x2,x3),
      I: Function.prototype.call.bind(String.prototype.indexOf),
      IB: () => [],
      IC: (o, start, length) => new Float64Array(o.buffer, o.byteOffset + start, length),
      ID: x0 => x0.activeElement,
      IE: (x0,x1) => x0.matchMedia(x1),
      IF: x0 => x0.tiltY,
      IG: x0 => x0.now(),
      IH: x0 => x0.orientation,
      II: (x0,x1) => { x0.min = x1 },
      IJ: (x0,x1,x2) => globalThis.crypto.subtle.encrypt(x0,x1,x2),
      IK: (x0,x1) => x0.decode(x1),
      IL: x0 => x0.tee(),
      IM: (wasmFunction,f) => finalizeWrapper(f, function() { return wasmFunction(f,arguments.length) }),
      IN: (x0,x1) => x0.dart_sqlite3_free(x1),
      IO: x0 => ({at: x0}),
      IP: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3) { return wasmFunction(f,arguments.length,x0,x1,x2,x3) }),
      IQ: (x0,x1,x2,x3,x4,x5,x6,x7,x8,x9) => x0.drawImage(x1,x2,x3,x4,x5,x6,x7,x8,x9),
      IR: (x0,x1,x2,x3,x4) => x0.wrapKey(x1,x2,x3,x4),
      J: (s, p, i) => s.lastIndexOf(p, i),
      JB: (a, i) => a.push(i),
      JC: (o, start, length) => new Float32Array(o.buffer, o.byteOffset + start, length),
      JD: x0 => x0.parentNode,
      JE: x0 => x0.matches,
      JF: x0 => x0.tiltX,
      JG: x0 => x0.performance,
      JH: (x0,x1) => x0.querySelector(x1),
      JI: (x0,x1) => { x0.max = x1 },
      JJ: (x0,x1,x2,x3,x4) => globalThis.crypto.subtle.importKey(x0,x1,x2,x3,x4),
      JK: x0 => x0.image,
      JL: x0 => x0.getReader(),
      JM: (x0,x1,x2,x3) => x0.request(x1,x2,x3),
      JN: (x0,x1,x2,x3,x4,x5,x6) => x0.sqlite3_prepare_v3(x1,x2,x3,x4,x5,x6),
      JO: x0 => x0.flush(),
      JP: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      JQ: (x0,x1) => x0.getContext(x1),
      JR: (x0,x1,x2) => x0.exportKey(x1,x2),
      K: o => o,
      KB: x0 => new Int8Array(x0),
      KC: (o, start, length) => new Uint32Array(o.buffer, o.byteOffset + start, length),
      KD: x0 => x0.tagName,
      KE: o => typeof o === 'function' && o[jsWrappedDartFunctionSymbol] === true,
      KF: x0 => x0.pointerType,
      KG: (d, digits) => d.toFixed(digits),
      KH: (x0,x1) => { x0.title = x1 },
      KI: (x0,x1) => { x0.disabled = x1 },
      KJ: () => globalThis.window.isSecureContext,
      KK: x0 => x0.close(),
      KL: x0 => x0.length,
      KM: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      KN: (x0,x1,x2,x3,x4,x5) => x0.sqlite3_exec(x1,x2,x3,x4,x5),
      KO: (x0,x1) => x0.write(x1),
      KP: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      KQ: (x0,x1) => { x0.height = x1 },
      KR: (x0,x1) => x0.getRandomValues(x1),
      L: o => {
        if (o === undefined || o === null) return 0;
        if (typeof o === 'number') return 1;
        return 2;
      },
      LB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI8ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      LC: (o, start, length) => new Int32Array(o.buffer, o.byteOffset + start, length),
      LD: x0 => x0.target,
      LE: f => f.dartFunction,
      LF: x0 => x0.pointerId,
      LG: x0 => x0.maxHeight,
      LH: (x0,x1) => x0.vibrate(x1),
      LI: (x0,x1) => { x0.scrollLeft = x1 },
      LJ: () => globalThis.crypto.subtle,
      LK: (x0,x1,x2,x3,x4) => ({type: x0,data: x1,premultiplyAlpha: x2,colorSpaceConversion: x3,preferAnimation: x4}),
      LL: x0 => x0.value,
      LM: (o,s,v) => o[s] = v,
      LN: (x0,x1) => x0.sqlite3_changes(x1),
      LO: (x0,x1,x2) => x0.write(x1,x2),
      LP: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3,x4) { return wasmFunction(f,arguments.length,x0,x1,x2,x3,x4) }),
      LQ: (x0,x1) => { x0.width = x1 },
      LR: (x0,x1,x2,x3) => x0.encrypt(x1,x2,x3),
      M: x0 => x0.index,
      MB: x0 => new Uint8Array(x0),
      MC: (o, start, length) => new Uint16Array(o.buffer, o.byteOffset + start, length),
      MD: x0 => x0.clientY,
      ME: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      MF: x0 => x0.getCoalescedEvents(),
      MG: x0 => x0.maxWidth,
      MH: x0 => x0.arrayBuffer(),
      MI: (x0,x1) => { x0.spellcheck = x1 },
      MJ: (x0,x1,x2) => globalThis.crypto.subtle.sign(x0,x1,x2),
      MK: x0 => new window.ImageDecoder(x0),
      ML: x0 => x0.done,
      MM: () => Symbol("jsBoxedDartObjectProperty"),
      MN: (x0,x1) => x0.sqlite3_last_insert_rowid(x1),
      MO: x0 => x0.createSyncAccessHandle(),
      MP: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      MQ: (x0,x1) => x0.transferFromImageBitmap(x1),
      MR: (x0,x1) => { x0.id = x1 },
      N: o => String(o),
      NB: x0 => new Uint8ClampedArray(x0),
      NC: (o, start, length) => new Int16Array(o.buffer, o.byteOffset + start, length),
      ND: x0 => x0.clientX,
      NE: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      NF: s => s.trimLeft(),
      NG: x0 => x0.minHeight,
      NH: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof ArrayBuffer) return 1;
        if (globalThis.SharedArrayBuffer !== undefined &&
            o instanceof SharedArrayBuffer) {
          return 2;
        }
        return 3;
      },
      NI: (x0,x1) => { x0.disabled = x1 },
      NJ: (x0,x1) => ({name: x0,hash: x1}),
      NK: x0 => x0.name,
      NL: x0 => x0.read(),
      NM: (x0,x1) => x0.call(x1),
      NN: x0 => globalThis.Number(x0),
      NO: x0 => ({create: x0}),
      NP: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      NQ: x0 => x0.rasterEndMilliseconds,
      NR: (x0,x1,x2) => x0.addEventListener(x1,x2),
      O: o => o === undefined,
      OB: x0 => new Int16Array(x0),
      OC: (o, start, length) => new Uint8ClampedArray(o.buffer, o.byteOffset + start, length),
      OD: (x0,x1,x2) => x0.addEventListener(x1,x2),
      OE: (p, s, f) => p.then(s, (e) => f(e, e === undefined)),
      OF: s => s.toUpperCase(),
      OG: x0 => x0.minWidth,
      OH: x0 => x0.status,
      OI: (a, i) => a.splice(i, 1),
      OJ: (x0,x1,x2,x3) => ({name: x0,hash: x1,salt: x2,iterations: x3}),
      OK: x0 => x0.repetitionCount,
      OL: x0 => x0.cancel(),
      OM: x0 => x0.locks,
      ON: (x0,x1,x2) => x0.sqlite3_column_name(x1,x2),
      OO: (x0,x1,x2) => x0.getFileHandle(x1,x2),
      OP: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2) { return wasmFunction(f,arguments.length,x0,x1,x2) }),
      OQ: x0 => x0.rasterStartMilliseconds,
      OR: (x0,x1) => x0.removeChild(x1),
      P: (x0,x1) => x0.exec(x1),
      PB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI16ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      PC: (o, start, length) => new Uint8Array(o.buffer, o.byteOffset + start, length),
      PD: (x0,x1,x2) => x0.setAttribute(x1,x2),
      PE: (o, i) => o[i],
      PF: x0 => x0.pop(),
      PG: (x0,x1) => x0.removeProperty(x1),
      PH: (x0,x1) => x0.fetch(x1),
      PI: a => a.pop(),
      PJ: (x0,x1,x2) => globalThis.crypto.subtle.deriveBits(x0,x1,x2),
      PK: x0 => x0.frameCount,
      PL: x0 => x0.body,
      PM: () => globalThis.navigator,
      PN: (x0,x1,x2) => x0.sqlite3_column_blob(x1,x2),
      PO: x0 => ({create: x0}),
      PP: (x0,x1) => x0.getBigInt64(x1),
      PQ: x0 => x0.imageBitmaps,
      PR: x0 => x0.firstChild,
      Q: (x0,x1) => { x0.lastIndex = x1 },
      QB: x0 => new Uint16Array(x0),
      QC: (o, start, length) => new Int8Array(o.buffer, o.byteOffset + start, length),
      QD: (x0,x1) => x0.closest(x1),
      QE: o => o.length,
      QF: x0 => x0.flags,
      QG: (x0,x1) => x0.add(x1),
      QH: x0 => x0.content,
      QI: x0 => new WeakRef(x0),
      QJ: (x0,x1,x2) => globalThis.crypto.subtle.decrypt(x0,x1,x2),
      QK: x0 => x0.selectedTrack,
      QL: (x0,x1) => x0.get(x1),
      QM: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      QN: (x0,x1,x2) => x0.sqlite3_column_bytes(x1,x2),
      QO: (x0,x1,x2) => x0.getDirectoryHandle(x1,x2),
      QP: (x0,x1) => x0.getInt32(x1),
      QQ: x0 => x0.canvasKitMaximumSurfaces,
      QR: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      R: o => o,
      RB: x0 => new Int32Array(x0),
      RC: (x0,x1) => x0.querySelector(x1),
      RD: (ms, c) =>
      setTimeout(() => dartInstance.exports.$invokeCallback(c),ms),
      RE: o => {
        if (o === undefined) return 1;
        var type = typeof o;
        if (type === 'boolean') return 2;
        if (type === 'number') return 3;
        if (type === 'string') return 4;
        if (o instanceof Array) return 5;
        if (ArrayBuffer.isView(o)) {
          if (o instanceof Int8Array) return 6;
          if (o instanceof Uint8Array) return 7;
          if (o instanceof Uint8ClampedArray) return 8;
          if (o instanceof Int16Array) return 9;
          if (o instanceof Uint16Array) return 10;
          if (o instanceof Int32Array) return 11;
          if (o instanceof Uint32Array) return 12;
          if (o instanceof Float32Array) return 13;
          if (o instanceof Float64Array) return 14;
          if (o instanceof DataView) return 15;
        }
        if (o instanceof ArrayBuffer) return 16;
        // Feature check for `SharedArrayBuffer` before doing a type-check.
        if (globalThis.SharedArrayBuffer !== undefined &&
            o instanceof SharedArrayBuffer) {
            return 17;
        }
        if (o instanceof Promise) return 18;
        return 19;
      },
      RF: (a, s) => a.join(s),
      RG: x0 => x0.data,
      RH: x0 => x0.document,
      RI: x0 => x0.deref(),
      RJ: (x0,x1,x2,x3) => x0.slice(x1,x2,x3),
      RK: x0 => x0.completed,
      RL: x0 => x0.headers,
      RM: (x0,x1) => x0.postMessage(x1),
      RN: (x0,x1,x2) => x0.sqlite3_column_text(x1,x2),
      RO: (x0,x1) => new URL(x0,x1),
      RP: (x0,x1) => x0.read(x1),
      RQ: x0 => x0.nextSibling,
      RR: (x0,x1) => x0.item(x1),
      S: (s, m) => {
        try {
          return new RegExp(s, m);
        } catch (e) {
          return String(e);
        }
      },
      SB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI32ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      SC: (x0,x1) => x0.item(x1),
      SD: (handle) => clearTimeout(handle),
      SE: x0 => x0.language,
      SF: (x0,x1) => x0.error(x1),
      SG: (x0,x1) => x0.removeAttribute(x1),
      SH: () => typeof dartUseDateNowForTicks !== "undefined",
      SI: () => globalThis.WeakRef,
      SJ: x0 => x0.type,
      SK: x0 => x0.ready,
      SL: x0 => x0.toString(),
      SM: x0 => x0.close(),
      SN: (x0,x1,x2) => x0.sqlite3_column_double(x1,x2),
      SO: x0 => x0.pathname,
      SP: (x0,x1,x2) => x0.read(x1,x2),
      SQ: (x0,x1) => x0.debug(x1),
      SR: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      T: o => o instanceof RegExp,
      TB: x0 => new Uint32Array(x0),
      TC: x0 => x0.length,
      TD: x0 => x0.maxTouchPoints,
      TE: (x0,x1,x2,x3) => x0.register(x1,x2,x3),
      TF: () => globalThis.console,
      TG: (x0,x1) => { x0.value = x1 },
      TH: () => Date.now(),
      TI: x0 => x0.protocol,
      TJ: x0 => x0.size,
      TK: x0 => x0.tracks,
      TL: (x0,x1,x2,x3) => x0.call(x1,x2,x3),
      TM: (x0,x1) => ({i: x0,p: x1}),
      TN: (x0,x1,x2) => x0.sqlite3_column_int64(x1,x2),
      TO: x0 => x0.getDirectory(),
      TP: () => globalThis.WebAssembly,
      TQ: x0 => x0.hostElement,
      TR: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      U: (string, times) => string.repeat(times),
      UB: x0 => new Float32Array(x0),
      UC: (x0,x1) => x0.querySelectorAll(x1),
      UD: x0 => x0.platform,
      UE: () => globalThis.window.FinalizationRegistry,
      UF: s => s.trimRight(),
      UG: (x0,x1) => { x0.value = x1 },
      UH: () => 1000 * performance.now(),
      UI: (x0,x1,x2) => x0.close(x1,x2),
      UJ: x0 => globalThis.fetch(x0),
      UK: () => globalThis.window.ImageDecoder,
      UL: x0 => globalThis.BigInt(x0),
      UM: (x0,x1) => ({c: x0,r: x1}),
      UN: (x0,x1,x2) => x0.sqlite3_column_type(x1,x2),
      UO: x0 => x0.storage,
      UP: x0 => x0.href,
      UQ: x0 => x0.location,
      UR: x0 => x0.name,
      V: o => o,
      VB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmF32ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      VC: (x0,x1) => x0.getAttribute(x1),
      VD: s => new Date(s * 1000).getTimezoneOffset() * 60,
      VE: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      VF: x0 => x0.blur(),
      VG: x0 => x0.value,
      VH: x0 => new Uint8Array(x0),
      VI: x0 => x0.close(),
      VJ: x0 => x0.blob(),
      VK: x0 => x0.naturalHeight,
      VL: x0 => x0.length,
      VM: (x0,x1) => { x0.onmessage = x1 },
      VN: (x0,x1) => x0.sqlite3_column_count(x1),
      VO: () => globalThis.navigator,
      VP: (x0,x1) => x0.openCursor(x1),
      VQ: (x0,x1) => x0.getModifierState(x1),
      VR: x0 => x0.parentNode,
      W: o => {
        if (o === undefined || o === null) return 0;
        if (typeof o === 'boolean') return 1;
        return 2;
      },
      WB: x0 => new Float64Array(x0),
      WC: x0 => x0.remove(),
      WD: Date.now,
      WE: x0 => new window.FinalizationRegistry(x0),
      WF: x0 => x0.button,
      WG: x0 => x0.selectionDirection,
      WH: (x0,x1,x2) => x0.slice(x1,x2),
      WI: (x0,x1) => x0.send(x1),
      WJ: (x0,x1,x2) => x0.slice(x1,x2),
      WK: x0 => x0.naturalWidth,
      WL: x0 => x0.name,
      WM: (o, a) => o == a,
      WN: (x0,x1) => x0.sqlite3_close_v2(x1),
      WO: (x0,x1) => globalThis.fetch(x0,x1),
      WP: () => globalThis.Blob,
      WQ: x0 => x0.metaKey,
      WR: x0 => x0.length,
      X: x0 => x0.dotAll,
      XB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmF64ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      XC: (x0,x1) => x0.appendChild(x1),
      XD: (x0,x1) => x0.contains(x1),
      XE: (x0,x1) => x0.unregister(x1),
      XF: (x0,x1) => x0.prepend(x1),
      XG: x0 => x0.selectionStart,
      XH: (x0,x1) => x0.decode(x1),
      XI: () => new Array(),
      XJ: x0 => x0.arrayBuffer(),
      XK: (x0,x1) => x0.createElement(x1),
      XL: x0 => x0.buffer,
      XM: x0 => x0.r,
      XN: (x0,x1,x2,x3,x4,x5,x6) => x0.dart_sqlite3_create_function_v2(x1,x2,x3,x4,x5,x6),
      XO: (x0,x1) => x0.sqlite3session_delete(x1),
      XP: x0 => x0.value,
      XQ: x0 => x0.altKey,
      XR: x0 => x0.files,
      Y: x0 => x0.unicode,
      YB: x0 => new ArrayBuffer(x0),
      YC: (x0,x1) => x0.append(x1),
      YD: (decoder, codeUnits) => decoder.decode(codeUnits),
      YE: x0 => x0.preventDefault(),
      YF: x0 => x0.parentElement,
      YG: x0 => x0.selectionEnd,
      YH: (x0,x1) => x0.adoptText(x1),
      YI: (x0,x1) => new WebSocket(x0,x1),
      YJ: () => {
        return typeof process != "undefined" &&
               Object.prototype.toString.call(process) == "[object process]" &&
               process.platform == "win32"
      },
      YK: (x0,x1) => { x0.pointerEvents = x1 },
      YL: (x0,x1) => globalThis.WebAssembly.instantiate(x0,x1),
      YM: x0 => x0.c,
      YN: (x0,x1,x2,x3) => x0.sqlite3_result_error(x1,x2,x3),
      YO: (x0,x1,x2,x3) => x0.register(x1,x2,x3),
      YP: x0 => x0.key,
      YQ: x0 => x0.ctrlKey,
      YR: (x0,x1,x2) => x0.removeEventListener(x1,x2),
      Z: x0 => x0.ignoreCase,
      ZB: (x0,x1,x2) => new Uint8Array(x0,x1,x2),
      ZC: (x0,x1,x2,x3) => x0.setProperty(x1,x2,x3),
      ZD: () => new TextDecoder("utf-8", {fatal: true}),
      ZE: x0 => x0.parent,
      ZF: x0 => x0.innerHeight,
      ZG: x0 => x0.value,
      ZH: x0 => x0.first(),
      ZI: x0 => x0.reason,
      ZJ: () => {
        // On browsers return `globalThis.location.href`
        if (globalThis.location != null) {
          return globalThis.location.href;
        }
        return null;
      },
      ZK: (x0,x1) => { x0.height = x1 },
      ZL: x0 => x0.call(),
      ZM: x0 => x0.p,
      ZN: (x0,x1,x2) => x0.sqlite3_result_subtype(x1,x2),
      ZO: (x0,x1) => x0.unregister(x1),
      ZP: x0 => x0.continue(),
      ZQ: x0 => x0.isComposing,
      ZR: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      a: x0 => x0.multiline,
      aB: (x0,x1,x2) => new DataView(x0,x1,x2),
      aC: x0 => x0.style,
      aD: () => new TextDecoder("utf-8", {fatal: false}),
      aE: x0 => x0.timeStamp,
      aF: x0 => x0.innerWidth,
      aG: x0 => x0.selectionDirection,
      aH: x0 => x0.next(),
      aI: x0 => x0.code,
      aJ: x0 => x0.abort(),
      aK: (x0,x1) => { x0.width = x1 },
      aL: x0 => globalThis.Object.keys(x0),
      aM: x0 => x0.i,
      aN: (x0,x1,x2,x3,x4) => x0.sqlite3_result_blob64(x1,x2,x3,x4),
      aO: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      aP: x0 => x0.error,
      aQ: x0 => x0.code,
      aR: x0 => x0.target,
      b: (exn) => {
        if (exn instanceof Error) {
          return exn.stack;
        } else {
          return null;
        }
      },
      bB: (o, p) => o[p],
      bC: x0 => x0.debugShowSemanticsNodes,
      bD: (a, i, v) => a[i] = v,
      bE: (x0,x1) => x0.hasAttribute(x1),
      bF: x0 => x0.height,
      bG: x0 => x0.selectionStart,
      bH: x0 => x0.current(),
      bI: (x0,x1,x2,x3) => x0.addEventListener(x1,x2,x3),
      bJ: () => new AbortController(),
      bK: x0 => x0.style,
      bL: () => globalThis.WebAssembly.Table,
      bM: x0 => x0.port1,
      bN: (x0,x1,x2,x3,x4) => x0.sqlite3_result_text(x1,x2,x3,x4),
      bO: x0 => new FinalizationRegistry(x0),
      bP: x0 => x0.result,
      bQ: x0 => x0.repeat,
      bR: (x0,x1) => { x0.accept = x1 },
      c: () => globalThis.Promise.resolve(),
      cB: (o) => new DataView(o.buffer, o.byteOffset, o.byteLength),
      cC: (x0,x1) => x0.warn(x1),
      cD: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI8ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      cE: x0 => x0.type,
      cF: x0 => x0.width,
      cG: x0 => x0.selectionEnd,
      cH: (x0,x1) => new Intl.v8BreakIterator(x0,x1),
      cI: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      cJ: (x0,x1,x2,x3,x4,x5) => ({method: x0,headers: x1,body: x2,credentials: x3,redirect: x4,signal: x5}),
      cK: (x0,x1) => { x0.src = x1 },
      cL: () => globalThis.WebAssembly.Memory,
      cM: (x0,x1,x2) => x0.transaction(x1,x2),
      cN: (x0,x1,x2) => x0.sqlite3_result_double(x1,x2),
      cO: () => globalThis.FinalizationRegistry,
      cP: (x0,x1) => globalThis.IDBKeyRange.bound(x0,x1),
      cQ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      cR: (x0,x1) => { x0.multiple = x1 },
      d: (x0,x1) => x0.then(x1),
      dB: Function.prototype.call.bind(Object.getOwnPropertyDescriptor(DataView.prototype, 'byteLength').get),
      dC: x0 => x0.console,
      dD: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI16ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      dE: (x0,x1) => x0.getModifierState(x1),
      dF: x0 => x0.clientHeight,
      dG: (x0,x1) => { x0.name = x1 },
      dH: x0 => x0.v8BreakIterator,
      dI: (x0,x1,x2,x3) => x0.removeEventListener(x1,x2,x3),
      dJ: (x0,x1) => globalThis.fetch(x0,x1),
      dK: () => globalThis.document,
      dL: () => globalThis.WebAssembly.Global,
      dM: x0 => x0.close(),
      dN: (x0,x1,x2) => x0.sqlite3_result_int64(x1,x2),
      dO: x0 => x0.exports,
      dP: x0 => x0.length,
      dQ: (x0,x1) => x0.canShare(x1),
      dR: (x0,x1) => { x0.draggable = x1 },
      e: (c) =>
      queueMicrotask(() => dartInstance.exports.$invokeCallback(c)),
      eB: o => o.byteOffset,
      eC: () => globalThis.window,
      eD: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI32ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      eE: x0 => x0.buttons,
      eF: x0 => x0.clientWidth,
      eG: (x0,x1) => { x0.placeholder = x1 },
      eH: () => globalThis.Intl,
      eI: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      eJ: (x0,x1) => x0.get(x1),
      eK: x0 => x0.src,
      eL: x0 => x0.module,
      eM: (wasmFunction,f) => finalizeWrapper(f, function() { return wasmFunction(f,arguments.length) }),
      eN: (x0,x1) => x0.sqlite3_result_null(x1),
      eO: x0 => x0.instance,
      eP: (x0,x1) => x0.get(x1),
      eQ: (x0,x1) => x0.share(x1),
      eR: (x0,x1) => { x0.type = x1 },
      f: (x0,x1) => x0.didCreateEngineInitializer(x1),
      fB: o => o.buffer,
      fC: (o, c) => o instanceof c,
      fD: (s) => +s,
      fE: x0 => x0.ctrlKey,
      fF: x0 => x0.isConnected,
      fG: (x0,x1) => { x0.autocomplete = x1 },
      fH: (x0,x1) => x0.segment(x1),
      fI: (o, t) => typeof o === t,
      fJ: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2) { return wasmFunction(f,arguments.length,x0,x1,x2) }),
      fK: x0 => x0.decode(),
      fL: x0 => x0.exports,
      fM: x0 => x0.commit(),
      fN: (x0,x1) => x0.sqlite3_value_blob(x1),
      fO: (x0,x1,x2) => x0.instantiateStreaming(x1,x2),
      fP: (x0,x1) => x0.index(x1),
      fQ: x0 => x0.message,
      fR: x0 => x0.extraAssets,
      g: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      gB: Function.prototype.call.bind(DataView.prototype.getUint8),
      gC: (x0,x1) => x0[x1],
      gD: s => {
        if (!/^\s*[+-]?(?:Infinity|NaN|(?:\.\d+|\d+(?:\.\d*)?)(?:[eE][+-]?\d+)?)\s*$/.test(s)) {
          return NaN;
        }
        return parseFloat(s);
      },
      gE: x0 => x0.getBoundingClientRect(),
      gF: x0 => x0.head,
      gG: (x0,x1) => { x0.type = x1 },
      gH: x0 => x0.index,
      gI: x0 => x0.data,
      gJ: (x0,x1) => x0.forEach(x1),
      gK: (x0,x1,x2,x3) => x0.open(x1,x2,x3),
      gL: x0 => x0.instance,
      gM: x0 => x0.abort(),
      gN: (x0,x1) => x0.sqlite3_value_bytes(x1),
      gO: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      gP: x0 => x0.openKeyCursor(),
      gQ: (x0,x1,x2,x3) => x0.open(x1,x2,x3),
      gR: x0 => x0.fontManifest,
      h: (wasmFunction,f) => finalizeWrapper(f, function() { return wasmFunction(f,arguments.length) }),
      hB: (b, o) => new DataView(b, o),
      hC: x0 => x0.length,
      hD: s => s.trim(),
      hE: x0 => x0.y,
      hF: (x0,x1) => { x0.content = x1 },
      hG: (x0,x1) => { x0.name = x1 },
      hH: x0 => x0.next(),
      hI: x0 => x0.readyState,
      hJ: x0 => x0.name,
      hK: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      hL: (o, p, v) => o[p] = v,
      hM: (wasmFunction,f) => finalizeWrapper(f, function() { return wasmFunction(f,arguments.length) }),
      hN: (x0,x1) => x0.sqlite3_value_text(x1),
      hO: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      hP: x0 => x0.primaryKey,
      hQ: x0 => x0.click(),
      hR: x0 => x0.assetManifest,
      i: (x0,x1) => ({initializeEngine: x0,autoStart: x1}),
      iB: (b, o, l) => new DataView(b, o, l),
      iC: (string, token) => string.split(token),
      iD: x0 => x0.classList,
      iE: x0 => x0.x,
      iF: (x0,x1) => { x0.name = x1 },
      iG: (x0,x1) => { x0.placeholder = x1 },
      iH: x0 => x0.value,
      iI: (x0,x1) => { x0.binaryType = x1 },
      iJ: x0 => x0.statusText,
      iK: (x0,x1,x2) => x0.addEventListener(x1,x2),
      iL: x0 => globalThis.Object.entries(x0),
      iM: (wasmFunction,f) => finalizeWrapper(f, function() { return wasmFunction(f,arguments.length) }),
      iN: (x0,x1) => x0.sqlite3_value_double(x1),
      iO: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3,x4) { return wasmFunction(f,arguments.length,x0,x1,x2,x3,x4) }),
      iP: (x0,x1,x2) => x0.open(x1,x2),
      iQ: x0 => x0.remove(),
      iR: x0 => x0.buildConfig,
      j: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      jB: Function.prototype.call.bind(DataView.prototype.getFloat64),
      jC: o => o instanceof Array,
      jD: x0 => x0.relatedTarget,
      jE: x0 => x0.top,
      jF: (x0,x1) => x0.removeChild(x1),
      jG: (x0,x1) => { x0.scrollTop = x1 },
      jH: x0 => x0.done,
      jI: (x0,x1) => x0.getRandomValues(x1),
      jJ: x0 => x0.url,
      jK: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      jL: x0 => x0.memory,
      jM: (wasmFunction,f) => finalizeWrapper(f, function() { return wasmFunction(f,arguments.length) }),
      jN: (x0,x1) => x0.sqlite3_value_int64(x1),
      jO: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2) { return wasmFunction(f,arguments.length,x0,x1,x2) }),
      jP: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      jQ: (o, a) => o + a,
      jR: (x0,x1) => new OffscreenCanvas(x0,x1),
      k: x0 => new Promise(x0),
      kB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Float64Array) return 1;
        return 2;
      },
      kC: (a, i) => a[i],
      kD: x0 => x0.hasFocus(),
      kE: x0 => x0.left,
      kF: x0 => x0.firstChild,
      kG: (x0,x1,x2) => x0.setSelectionRange(x1,x2),
      kH: (o, m, a) => o[m].apply(o, a),
      kI: () => globalThis.crypto,
      kJ: x0 => x0.status,
      kK: x0 => x0.send(),
      kL: x0 => x0.HEAPU8,
      kM: (x0,x1) => { x0.onerror = x1 },
      kN: (x0,x1) => x0.sqlite3_value_type(x1),
      kO: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3) { return wasmFunction(f,arguments.length,x0,x1,x2,x3) }),
      kP: (x0,x1) => { x0.onupgradeneeded = x1 },
      kQ: x0 => x0.body,
      kR: x0 => x0.assetBase,
      l: (x0,x1,x2) => x0.call(x1,x2),
      lB: Function.prototype.call.bind(DataView.prototype.setFloat64),
      lC: a => a.length,
      lD: x0 => x0.shiftKey,
      lE: x0 => x0.scrollTop,
      lF: x0 => x0.viewConstraints,
      lG: (x0,x1,x2) => x0.setSelectionRange(x1,x2),
      lH: x0 => x0.iterator,
      lI: l => new DataView(new ArrayBuffer(l)),
      lJ: x0 => x0.getReader(),
      lK: x0 => x0.status,
      lL: (o) => Array.isArray(o) || o instanceof Array,
      lM: x0 => new DOMException(x0),
      lN: (x0,x1,x2) => x0.sqlite3_extended_result_codes(x1,x2),
      lO: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3) { return wasmFunction(f,arguments.length,x0,x1,x2,x3) }),
      lP: x0 => ({autoIncrement: x0}),
      lQ: (x0,x1) => { x0.download = x1 },
      lR: x0 => x0.loader,
      m: (constructor, args) => {
        const factoryFunction = constructor.bind.apply(
            constructor, [null, ...args]);
        return new factoryFunction();
      },
      mB: (t, s) => t.set(s),
      mC: (x0,x1) => x0.test(x1),
      mD: x0 => x0.body,
      mE: x0 => x0.offsetTop,
      mF: x0 => x0.hostElement,
      mG: s => {
        if (/[[\]{}()*+?.\\^$|]/.test(s)) {
            s = s.replace(/[[\]{}()*+?.\\^$|]/g, '\\$&');
        }
        return s;
      },
      mH: () => globalThis.Symbol,
      mI: (o, offsetInBytes, lengthInBytes) => {
        var dst = new ArrayBuffer(lengthInBytes);
        new Uint8Array(dst).set(new Uint8Array(o, offsetInBytes, lengthInBytes));
        return new DataView(dst);
      },
      mJ: x0 => x0.read(),
      mK: x0 => x0.response,
      mL: x0 => x0.asm,
      mM: x0 => x0.error,
      mN: (x0,x1,x2,x3,x4) => x0.sqlite3_open_v2(x1,x2,x3,x4),
      mO: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2) { return wasmFunction(f,arguments.length,x0,x1,x2) }),
      mP: (x0,x1,x2) => x0.createObjectStore(x1,x2),
      mQ: (x0,x1) => { x0.display = x1 },
      mR: () => globalThis._flutter,
      n: x0 => new Array(x0),
      nB: Function.prototype.call.bind(DataView.prototype.setFloat32),
      nC: x0 => x0.userAgent,
      nD: x0 => x0.visibilityState,
      nE: x0 => x0.scrollLeft,
      nF: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      nG: x0 => x0.keyCode,
      nH: (x0,x1) => new Intl.Segmenter(x0,x1),
      nI: (a, s, e) => a.slice(s, e),
      nJ: x0 => x0.value,
      nK: (x0,x1,x2) => x0.setRequestHeader(x1,x2),
      nL: x0 => x0.wasmExports,
      nM: (x0,x1) => { x0.onabort = x1 },
      nN: x0 => x0.sqlite3_initialize(),
      nO: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      nP: x0 => ({unique: x0}),
      nQ: x0 => x0.style,
      o: o => [o],
      oB: Function.prototype.call.bind(DataView.prototype.getFloat32),
      oC: x0 => x0.navigator,
      oD: (x0,x1,x2) => x0.removeEventListener(x1,x2),
      oE: x0 => x0.offsetLeft,
      oF: x0 => ({runApp: x0}),
      oG: (x0,x1) => x0.scrollIntoView(x1),
      oH: x0 => x0.Segmenter,
      oI: (o, p) => p in o,
      oJ: x0 => x0.done,
      oK: (x0,x1) => { x0.responseType = x1 },
      oL: (o) => {
        const typeofValue = typeof o;
        return (typeofValue === 'object') ||
            typeofValue === 'function';
      },
      oM: (x0,x1) => { x0.oncomplete = x1 },
      oN: (x0,x1,x2,x3) => x0.dart_sqlite3_register_vfs(x1,x2,x3),
      oO: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      oP: (x0,x1,x2,x3) => x0.createIndex(x1,x2,x3),
      oQ: (x0,x1) => { x0.href = x1 },
      p: (o0, o1) => [o0, o1],
      pB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Float32Array) return 1;
        return 2;
      },
      pC: Function.prototype.call.bind(String.prototype.toLowerCase),
      pD: x0 => x0.disconnect(),
      pE: x0 => x0.offsetParent,
      pF: Function.prototype.call.bind(DataView.prototype.getBigInt64),
      pG: x0 => x0.multiViewEnabled,
      pH: x0 => x0.buffer,
      pI: x0 => x0.groups,
      pJ: x0 => x0.cancel(),
      pK: () => new XMLHttpRequest(),
      pL: (x0,x1) => x0.appendChild(x1),
      pM: (x0,x1) => x0.objectStore(x1),
      pN: (x0,x1) => globalThis.Atomics.load(x0,x1),
      pO: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      pP: (x0,x1) => x0.createObjectStore(x1),
      pQ: x0 => ({files: x0}),
      q: (o0, o1, o2) => [o0, o1, o2],
      qB: Function.prototype.call.bind(DataView.prototype.getUint32),
      qC: Object.is,
      qD: x0 => new Intl.Locale(x0),
      qE: x0 => x0.offsetY,
      qF: Function.prototype.call.bind(DataView.prototype.setBigInt64),
      qG: (x0,x1) => x0.replaceWith(x1),
      qH: x0 => x0.wasmMemory,
      qI: x0 => new Blob(x0),
      qJ: x0 => x0.body,
      qK: (x0,x1) => x0.append(x1),
      qL: (x0,x1) => { x0.src = x1 },
      qM: (x0,x1) => x0.sqlite3_get_autocommit(x1),
      qN: (x0,x1,x2) => globalThis.Atomics.wait(x0,x1,x2),
      qO: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3) { return wasmFunction(f,arguments.length,x0,x1,x2,x3) }),
      qP: x0 => x0.oldVersion,
      qQ: () => ({}),
      r: (o0, o1, o2, o3) => [o0, o1, o2, o3],
      rB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Uint32Array) return 1;
        return 2;
      },
      rC: x0 => x0.vendor,
      rD: x0 => x0.region,
      rE: x0 => x0.offsetX,
      rF: (o, start, length) => new BigInt64Array(o.buffer, o.byteOffset + start, length),
      rG: (x0,x1) => { x0.className = x1 },
      rH: () => globalThis.window._flutter_skwasmInstance,
      rI: x0 => ({type: x0}),
      rJ: x0 => x0.headers,
      rK: (x0,x1,x2) => x0.insertRule(x1,x2),
      rL: (x0,x1) => { x0.async = x1 },
      rM: (x0,x1) => x0.sqlite3_finalize(x1),
      rN: (x0,x1,x2) => globalThis.Atomics.notify(x0,x1,x2),
      rO: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3) { return wasmFunction(f,arguments.length,x0,x1,x2,x3) }),
      rP: () => globalThis.indexedDB,
      rQ: (x0,x1,x2) => new File(x0,x1,x2),
      s: (x0,x1,x2) => { x0[x1] = x2 },
      sB: Function.prototype.call.bind(DataView.prototype.getInt32),
      sC: (x0,x1) => x0.createTextNode(x1),
      sD: x0 => x0.script,
      sE: (o, p, r) => o.replace(p, () => r),
      sF: o => o.byteLength,
      sG: (x0,x1) => { x0.tabIndex = x1 },
      sH: () => new TextDecoder(),
      sI: (x0,x1) => new Blob(x0,x1),
      sJ: x0 => x0.signal,
      sK: (x0,x1) => x0.add(x1),
      sL: (x0,x1) => { x0.charset = x1 },
      sM: (x0,x1) => x0.sqlite3_reset(x1),
      sN: (x0,x1,x2) => globalThis.Atomics.store(x0,x1,x2),
      sO: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      sP: (x0,x1) => ({name: x0,length: x1}),
      sQ: (x0,x1) => { x0.type = x1 },
      t: (o, p) => o[p],
      tB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Int32Array) return 1;
        return 2;
      },
      tC: (x0,x1) => { x0.id = x1 },
      tD: x0 => x0.language,
      tE: (o, p, r) => o.replaceAll(p, () => r),
      tF: (x0,x1,x2,x3) => x0.pushState(x1,x2,x3),
      tG: (x0,x1) => { x0.action = x1 },
      tH: (map, o, v) => map.set(o, v),
      tI: () => new FileReader(),
      tJ: (d, precision) => d.toPrecision(precision),
      tK: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      tL: (x0,x1) => { x0.type = x1 },
      tM: x0 => x0.buffer,
      tN: (x0,x1,x2) => x0.setInt32(x1,x2),
      tO: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      tP: (x0,x1) => x0.update(x1),
      tQ: x0 => x0.userAgent,
      u: () => globalThis,
      uB: o => o instanceof Uint16Array,
      uC: (x0,x1) => { x0.nonce = x1 },
      uD: x0 => x0.languages,
      uE: x0 => x0.deltaMode,
      uF: x0 => x0.history,
      uG: (x0,x1) => { x0.method = x1 },
      uH: (map, o) => map.get(o),
      uI: (x0,x1) => x0.readAsArrayBuffer(x1),
      uJ: x0 => x0.close(),
      uK: x0 => x0.preventDefault(),
      uL: (x0,x1) => x0.createElement(x1),
      uM: (x0,x1) => x0.sqlite3_errstr(x1),
      uN: (x0,x1,x2) => x0.setBigInt64(x1,x2),
      uO: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      uP: x0 => x0.name,
      uQ: (x0,x1) => x0.getItem(x1),
      v: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      vB: Function.prototype.call.bind(DataView.prototype.getUint16),
      vC: x0 => x0.nonce,
      vD: (x0,x1) => x0.observe(x1),
      vE: x0 => x0.deltaY,
      vF: x0 => x0.search,
      vG: (x0,x1) => { x0.noValidate = x1 },
      vH: () => new WeakMap(),
      vI: x0 => x0.result,
      vJ: x0 => x0.height,
      vK: x0 => x0.createRange(),
      vL: () => globalThis.document,
      vM: (x0,x1) => x0.sqlite3_errmsg(x1),
      vN: x0 => new Worker(x0),
      vO: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      vP: x0 => globalThis.IDBKeyRange.only(x0),
      vQ: x0 => x0.localStorage,
      w: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      wB: o => o instanceof Int16Array,
      wC: () => globalThis.window.flutterConfiguration,
      wD: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      wE: x0 => x0.deltaX,
      wF: x0 => x0.location,
      wG: x0 => x0.click(),
      wH: x0 => x0.debugSkipFontRetryDelay,
      wI: () => new XMLHttpRequest(),
      wJ: x0 => x0.width,
      wK: (x0,x1) => x0.selectNode(x1),
      wL: (x0,x1) => x0.item(x1),
      wM: (x0,x1) => x0.sqlite3_error_offset(x1),
      wN: (x0,x1,x2) => new DataView(x0,x1,x2),
      wO: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      wP: (x0,x1,x2) => x0.put(x1,x2),
      wQ: (x0,x1) => x0.key(x1),
      x: (x0,x1) => ({addView: x0,removeView: x1}),
      xB: Function.prototype.call.bind(DataView.prototype.getInt16),
      xC: (x0,x1) => x0.attachShadow(x1),
      xD: x0 => new ResizeObserver(x0),
      xE: x0 => x0.wheelDeltaY,
      xF: x0 => x0.pathname,
      xG: (x0,x1) => x0.getElementsByClassName(x1),
      xH: (x0,x1,x2) => x0.set(x1,x2),
      xI: (x0,x1,x2,x3) => x0.open(x1,x2,x3),
      xJ: (x0,x1,x2,x3,x4,x5) => x0.createImageBitmap(x1,x2,x3,x4,x5),
      xK: x0 => x0.getSelection(),
      xL: x0 => x0.length,
      xM: (x0,x1) => x0.sqlite3_extended_errcode(x1),
      xN: () => globalThis.Uint8Array,
      xO: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      xP: (x0,x1) => x0.getKey(x1),
      xQ: x0 => x0.length,
      y: (l, r) => l === r,
      yB: o => o instanceof Uint8ClampedArray,
      yC: (x0,x1) => x0.createElement(x1),
      yD: (x0,x1) => x0.getPropertyValue(x1),
      yE: x0 => x0.wheelDeltaX,
      yF: (x0,x1,x2,x3) => x0.replaceState(x1,x2,x3),
      yG: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmF32ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      yH: x0 => x0.fontFallbackBaseUrl,
      yI: x0 => x0.send(),
      yJ: (x0,x1) => x0.createImageBitmap(x1),
      yK: x0 => x0.removeAllRanges(),
      yL: x0 => x0.children,
      yM: (x0,x1) => x0.sqlite3_step(x1),
      yN: x0 => x0.communicationBuffer,
      yO: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      yP: (x0,x1) => x0.delete(x1),
      yQ: (x0,x1) => x0.removeItem(x1),
      z: x0 => x0.random(),
      zB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Uint8Array) return 1;
        return 2;
      },
      zC: x0 => x0.scale,
      zD: x0 => globalThis.parseFloat(x0),
      zE: x0 => x0.bottom,
      zF: o => {
        const proto = Object.getPrototypeOf(o);
        return proto === Object.prototype || proto === null;
      },
      zG: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmF64ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      zH: (handle) => clearInterval(handle),
      zI: x0 => x0.type,
      zJ: x0 => new Blob(x0),
      zK: (x0,x1) => x0.addRange(x1),
      zL: (x0,x1) => x0.querySelector(x1),
      zM: (x0,x1,x2,x3,x4) => x0.dart_sqlite3_bind_blob(x1,x2,x3,x4),
      zN: () => globalThis.Int32Array,
      zO: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      zP: (x0,x1) => x0.put(x1),
      zQ: (x0,x1,x2) => x0.setItem(x1,x2),

    };

    const baseImports = {
      _: dart2wasm,
      Math: Math,
      Date: Date,
      Object: Object,
      Array: Array,
      Reflect: Reflect,
      WebAssembly: {
        JSTag: WebAssembly.JSTag,
      },
      "": new Proxy({}, { get(_, prop) { return prop; } }),

    };

    

    dartInstance = await WebAssembly.instantiate(this.module, {
      ...baseImports,
      ...additionalImports,
      
    });

    return new InstantiatedApp(this, dartInstance);
  }
}

class InstantiatedApp {
  constructor(compiledApp, instantiatedModule) {
    this.compiledApp = compiledApp;
    this.instantiatedModule = instantiatedModule;
  }

  // Call the main function with the given arguments.
  invokeMain(...args) {
    this.instantiatedModule.exports.$invokeMain(args);
  }
}
