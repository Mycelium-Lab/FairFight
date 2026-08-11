const path = require("path");
const webpack = require("webpack");

// One bundle per page-entry. `splitChunks: false` + `runtimeChunk: false` is
// load-bearing: the HTML pages reference bundles by literal filename, so any
// numbered async chunk would have to be hand-wired into a 780 KB HTML file and
// would be renumbered by the next unrelated code change.
module.exports = {

    mode: process.env.NODE_ENV === "development" ? "development" : "production",

    entry: {
      main: './index.js',            // EVM lobby           -> public/index.html
      main_game: './index_game.js',  // both matches        -> public/game.html
      main_ton: './index_ton.js',    // TON lobby           -> public/index_ton.html
    },

    plugins: [
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
      }),
    ],

    module: {
      parser: {
        javascript: {
          // @tonconnect/ui uses dynamic import(), which otherwise emits numbered
          // async chunks alongside the entry bundles - the numbers being exactly
          // what the HTML used to have to hardcode. 'eager' inlines them into the
          // parent bundle; import() still returns a Promise and modules still
          // execute lazily on first require, so this changes packaging only.
          dynamicImportMode: 'eager',
        },
      },
    },

    resolve: {
      extensions: [ '.ts', '.js' ],
      fallback: {
          "buffer": require.resolve("buffer")
      }
    },

    optimization: {
      splitChunks: false,
      runtimeChunk: false,
    },

    output: {
      path: path.resolve(__dirname, 'dist'),
      // server.js serves lib/ at the site root, so lib/dist is /dist/. Only
      // matters if an async chunk or asset module ever reappears - with the
      // old '' the URL was resolved against the page, which is wrong on /ton
      // and /game.
      publicPath: '/dist/',
      filename: '[name].js' // Используем [name], чтобы имя файла соответствовало имени точки входа
    },

};
