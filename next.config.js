const path = require("path");
const webpack = require("webpack");


function getFormattedFilename(fileName) {
  if (fileName.includes("?")) {
    return fileName.split("?").slice(0, -1).join("");
  }
  return fileName;
}

function isFileOfTypes(filename, extensions) {
  const extension = path.extname(getFormattedFilename(filename));
  return extensions.includes(extension);
}

class WebpackStylesOptimizationPlugin {
  // Define `apply` as its prototype method which is supplied with compiler as its argument
  apply(compiler) {
    // Specify the event hook to attach to
    compiler.hooks.compilation.tap(
      "WebpackStylesOptimizationPlugin",
      (compilation) => {
        compilation.hooks.additionalAssets.tapPromise(
          "WebpackStylesOptimizationPlugin",
          async () => {
            const assetsFromCompilation = Object.entries(
              compilation.assets
            ).filter(([name]) => {
              return isFileOfTypes(name, [".css"]);
            });
            for (const chunk of compilation.chunks) {
              const assets = assetsFromCompilation.filter(([name]) => {
                return chunk.files.has(name);
              });
              for (const [name, asset] of assets) {
                compilation.updateAsset(
                  name,
                  new webpack.sources.RawSource(asset.source().toString())
                );
                // create a custom style file with non-critical css
                compilation.emitAsset(
                  name.replace(/(.*)\/.*(\.css$)/i, "$1/custom-generated$2"),
                  new webpack.sources.RawSource(asset.source().toString())
                );
              }
            }

            await Promise.resolve();
          }
        );
      }
    );
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: false,
  webpack: (
    config,
  ) => {
    config.plugins.push(new WebpackStylesOptimizationPlugin())
    return config
  },
}


module.exports = nextConfig
