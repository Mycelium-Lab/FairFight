const path = require("path");
const webpack = require("webpack");

// `splitChunks: false` + `runtimeChunk: false` is load-bearing: the HTML pages
// reference bundles by literal filename, so any *numbered* chunk would have to
// be hand-wired into a 780 KB HTML file and would be renumbered by the next
// unrelated code change.
//
// The lobby's two family halves are the one deliberate exception. They are
// import()ed with an explicit webpackChunkName, so they emit as lobby-evm.js and
// lobby-tvm.js - names that no unrelated change renumbers - and webpack loads
// them itself off `output.publicPath`. No HTML references them.
module.exports = {

    mode: process.env.NODE_ENV === "development" ? "development" : "production",

    // Two entries, split by page and not by chain: the match page loads the
    // ImpactJS engine through 30 plain <script> tags and none of the lobby, and
    // the lobby loads none of the engine.
    //
    // `lobby` replaces main + main_ton. It picks its chain family at runtime and
    // import()s one of lobby/evm.js or lobby/tvm.js, which are the only two
    // named async chunks this build emits (lobby-evm.js, lobby-tvm.js). That is
    // what lets one <script> tag serve both pages - and what unblocks merging
    // the two lobby pages into one, since a merged page cannot choose between
    // two script tags.
    entry: {
      lobby: './lobby.js',           // both lobbies -> public/index.html, index_ton.html
      main_game: './index_game.js',  // both matches -> public/game.html
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
