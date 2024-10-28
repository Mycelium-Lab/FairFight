const webpack = require("webpack");

module.exports = {

    entry: {
      // main: './index.js', // Основной файл приложения
      // main_game: './index_game.js', // Файл для игры
      main_ton: './index_ton.js',
      // main_game_ton: './index_game_ton.js'
    },

    plugins: [
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
      }),
    ],

    resolve: {
      extensions: [ '.ts', '.js' ],
      fallback: {
          "buffer": require.resolve("buffer")
      }
    },
  
    output: {
      publicPath: '',
      filename: '[name].js' // Используем [name], чтобы имя файла соответствовало имени точки входа
    },
  
};