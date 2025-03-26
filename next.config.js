const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: false,
  experimental:{
    // optimizeCss: true
  },
  webpack: (
    config,
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
            priority: 90,
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
    return config
  },
}


module.exports = nextConfig
