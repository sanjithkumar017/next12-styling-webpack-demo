const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

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
        new CssMinimizerPlugin()
      ],
    };
    return config
  },
}


module.exports = nextConfig
