module.exports = {

    entry: {
      main: './index.js', // Основной файл приложения
      main_game: './index_game.js', // Файл для игры
    },
  
    output: {
      filename: '[name].js' // Используем [name], чтобы имя файла соответствовало имени точки входа
    },
  
};