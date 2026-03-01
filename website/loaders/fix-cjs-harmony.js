/**
 * Webpack loader to prevent webpack 5 from switching TypeScript-compiled CJS modules
 * into Harmony mode when they contain `Object.defineProperty(exports, "__esModule", ...)`.
 *
 * webpack 5 detects both `Object.defineProperty(exports, "__esModule", ...)` and
 * `(function(e){e.__esModule=true})(exports)` via static analysis, switching the module
 * to Harmony mode. In Harmony mode `exports` is not provided to the factory, causing
 * any un-transformed `exports.X = Y` assignments to throw ReferenceError.
 *
 * Fix: replace the flag-setting call with a computed-key assignment that webpack's static
 * analysis can NOT resolve, so the module stays in CJS mode where `exports` is provided.
 * At runtime the expression still correctly sets exports.__esModule = true.
 */
module.exports = function fixCjsHarmony(source) {
  // Replace `Object.defineProperty(exports, "__esModule", { value: true });`
  // with an assignment using a computed string key that webpack can't statically resolve.
  // '__es'+'Module' evaluates to '__esModule' at runtime but is opaque to webpack's parser.
  return source.replace(
    /Object\.defineProperty\(exports,\s*["']__esModule["'],\s*\{[^}]*\}\s*\);/g,
    'exports["__es"+"Module"]=true;'
  );
};
