module.exports = {

  entry: {
    game: './game/main.js', // Основной файл приложения
  },

  output: {
    filename: '[name].js' // Используем [name], чтобы имя файла соответствовало имени точки входа
  },
  resolve: {
    extensions: ['.js'],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  }
};
