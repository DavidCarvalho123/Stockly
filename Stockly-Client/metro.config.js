// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);
[("js","jsx","json","ts","tsx","cjs","mjs")].forEach((ext) => {
    if(config.resolver.sourceExts.indexOf(ext) === -1){
        config.resolver.sourceExts.push(ext);
    }
});

config.resolver.assetExts.push("gltf", "glb", "bin", "obj", "mtl");

[('browser', 'require', 'react-native')].forEach((info) => {
    config.resolver.unstable_conditionNames.push(info);
});
module.exports = config;
