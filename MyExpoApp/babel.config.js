module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { 
        jsxImportSource: "nativewind",
        unstable_transformImportMeta: true, // 关键：开启 import.meta polyfill 
       }],
      "nativewind/babel",
    ],
  };
};