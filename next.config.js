const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const path = require("path");
const glob = require("glob");
const { PurgeCSSPlugin } = require("purgecss-webpack-plugin");
const webpack = require("webpack");


function getFormattedFilename(fileName) {
  if (fileName.includes("?")) {
    return fileName.split("?").slice(0, -1).join("");
  }
  return fileName;
}

/**
 * Returns true if the filename is of types of one of the specified extensions
 *
 * @param filename - file name
 * @param extensions - extensions
 */
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
        console.log("@@@This is an example plugin!");
        compilation.hooks.additionalAssets.tapPromise(
          "WebpackStylesOptimizationPlugin",
          async () => {
            const assetsFromCompilation = Object.entries(
              compilation.assets
            ).filter(([name]) => {
              return isFileOfTypes(name, [".css"]);
            });
            console.log("@@@assetsFromCompilation", assetsFromCompilation);
            for (const chunk of compilation.chunks) {
              const assetsToPurge = assetsFromCompilation.filter(([name]) => {
                return chunk.files.has(name);
              });
              console.log("@@@assetsToPurge", assetsToPurge);
              for (const [name, asset] of assetsToPurge) {
                console.log("@@@asset", name, asset.source().toString());
                compilation.updateAsset(
                  name,
                  new webpack.sources.RawSource(asset.source().toString())
                );
                compilation.emitAsset(
                  name.replace(/(.*)\/.*(\.css$)/i, "$1/generated$2"),
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
const PATHS = {
  src: path.join(__dirname, "pages"),
};
console.log("@@@@PATHS",PATHS)
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: false,
  experimental:{
    // optimizeCss: true
  },
  webpack: (
    config,
    { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }
  ) => {
    config.optimization = {
      // Default strategy used for chunk id generation
      // https://webpack.js.org/configuration/optimization/#optimizationchunkids
      splitChunks: {
        cacheGroups: {
          styles: {
            name: "wmstyles",
            "test": /global.css$/,
            type: "css/mini-extract",
            chunks: "all",
            enforce: true,
            priority: 100,
          },
          homestyles: {
            name: "wmhomestyles",
            "test": /home.css$/,
            type: "css/mini-extract",
            chunks: "all",
            enforce: true,
            priority: 100,
          },
        },
        
      },
      minimizer: [
        new TerserPlugin({
          parallel: true,
          terserOptions: {
            ecma: 5,
            mangle: true,
            compress: true,
            output: {
              comments: false,
              beautify: false,
            },
          },
        }),
        new CssMinimizerPlugin()
      ],
    };
    // config.plugins.push(new PurgeCSSPlugin({
    //   paths: glob.sync(`${PATHS.src}/**/*`, { nodir: true }),
    // }),)
    // config.plugins.push(new WebpackStylesOptimizationPlugin(),)
    return config
  },
}


module.exports = nextConfig
