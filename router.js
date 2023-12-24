// `класс` роутера
let Router = {
  // маршруты и соответствующие им обработчики
  routes: {
    "/": "index",
    "/pokemons/:id": "pokemon",
  },

  // url файла index.html
  getStaticUrl: function() {
    return window.location.pathname;
  },

  // метод проходиться по массиву routes и создает
  // создает объект на каждый маршрут
  init: function() {
    console.log('init router');
    // объявляем свойство _routes
    this._routes = [];
    for( let route in this.routes ) {
      // имя метода-обрботчика
      let method = this.routes[route];

      // добавляем в массив роутов объект
      this._routes.push({
        // регулярное выражение с которым будет сопоставляться ссылка
        // ее надо преобразовать из формата :tag в RegEx
        // модификатор g обязателен
        pattern: new RegExp('^' + route.replace(/:\w+/g,'(\\w+)') + '$'),

        // метод-обработчик
        // определяется в объекте Route
        // для удобства
        callback: this[method]
      });
    }

    // хэндлер который отлавливает переход между страницами по хэшу #
    window.addEventListener('hashchange', (e) => {
      // console.log('hashchange', e);
      // если переход осущетвляется по истории на один шаг назад - показываем главную страницу
      if (e.newURL.replace('file://', '') === this.getStaticUrl()) {
        ShowMainPage();
      } else {
        console.log(1234, e.newURL);
        const pokemonId = GetPokemonIdFromUrl(e.newURL);
        RenderPokemonPage({ id: pokemonId });
      }

    })
  },

  dispatch: function(path) {
    // количество маршрутов в массиве
    let i = this._routes.length;

    // цикл до конца
    while( i-- ) {
      // если запрошенный путь соответствует какому-либо
      // маршруту, смотрим есть ли маршруты
      let args = path.match(this._routes[i].pattern);

      // если есть аргументы
      if( args ) {
        // вызываем обработчик из объекта, передавая ему аргументы
        // args.slice(1) отрезает всю найденную строку
        this._routes[i].callback.call(this, Number(args.slice(1)), path)
      }
    }
  },

  // обработчик
  // главной страницы
  index: function() {
    console.log("Main page");
  },

  // контроллер статей
  pokemon: function(id, path) {
    // console.log(`pokemon #${id}-${path}`);

    RenderPokemonPage({ id, router: { path } });
  },
}