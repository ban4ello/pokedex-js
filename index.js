const POKEMON_API = 'https://pokeapi.co/api/v2';
const POKEMON_API_LIMIT = 12;

let appContainer = document.getElementById('app');
let allPokemonContainer = document.getElementById('poke-container');
let innerPokemonData = null;
let allPokemonsData = [];
let offset = 12;

// обработчик нажатий на ссылки
let linksHandler = event =>  {
  // получаем запрошенный url
  let url = new URL(event.currentTarget.href);
  
  // запускаем роутер, предавая ему path
  Router.dispatch(url.pathname);
  
  // запрещаем дальнейший переход по ссылке
  event.preventDefault();
}

const GetAllPokemons = async ({ offset = 12 }) => {
  const response = await fetch(`${POKEMON_API}/pokemon?limit=${POKEMON_API_LIMIT}&offset=${offset}`)
  const allpokemon = await response.json()
  // console.log('allpokemon', allpokemon);
  
  await Promise.allSettled(allpokemon.results.map(async (pokemon) => {
    await FetchPokemonData(pokemon);
  }));
  
  allPokemonsData = allPokemonsData.sort((a, b) => a.id - b.id)
  
  allPokemonsData.forEach(pokeData => {
    RenderPokemon(pokeData);
  })
}

const GetAdditionslPokemons = async ({ offset = 12 }) => {
  let newPokemons = [];
  const response = await fetch(`${POKEMON_API}/pokemon?limit=${POKEMON_API_LIMIT}&offset=${offset}`)
  const allpokemon = await response.json()
  
  await Promise.allSettled(allpokemon.results.map(async (pokemon) => {
    const newPokemonData = await FetchAdditionalPokemonData(pokemon);

    newPokemons.push(newPokemonData);
  }));

  newPokemons = newPokemons.sort((a, b) => a.id - b.id);

  newPokemons.forEach(pokeData => {
    RenderPokemon(pokeData);
  })

  allPokemonsData.push(...newPokemons);
}

const GetPokemonData = async (id) => {
  console.log('GetPokemonData', id);

  const response = await fetch(`${POKEMON_API}/pokemon/${id}`);
  return await response.json();
}

const FetchAdditionalPokemonData = async (pokemon) => {
  let url = pokemon.url
  const response = await fetch(url);
  return await response.json();
}

const FetchPokemonData = async (pokemon) => {
  let url = pokemon.url
  const response = await fetch(url);
  const pokeData = await response.json();

  allPokemonsData.push(pokeData);
}

const createTypes = (types, ul) => {
  types.forEach((type) => {
    let typeLi = document.createElement('li');
    typeLi.innerText = type['type']['name'];
    ul.append(typeLi)
  })
}

const RenderPokemon = (pokeData) => {
  let pokeContainer = document.createElement('div');
  let pokeLink = document.createElement('a');

  let pokeName = document.createElement('h4');
  pokeName.innerText = pokeData.name;
  let pokeNumber = document.createElement('p');
  pokeNumber.innerText = `#${pokeData.id}`;
  let pokeTypes = document.createElement('ul');
  //ul list will hold the pokemon types
  createTypes(pokeData.types, pokeTypes);
  // helper function to go through the types array and create li tags for each one
  pokeLink.style.textDecoration = 'none';
  pokeLink.append(pokeName, pokeNumber, pokeTypes);
  pokeLink.href = `/pokemons/${pokeData.id}`;
  pokeContainer.append(pokeLink);
  pokeContainer.className = 'pokemon-item';
  createPokeImage(pokeData.sprites.other['official-artwork'].front_default, pokeLink);

  //appending all details to the pokeContainer div
  allPokemonContainer.appendChild(pokeContainer);

  // вешаем на событие onclick обработчик
  pokeLink.onclick = linksHandler;
}

const createPokeImage = (pokemonImgUrl, containerDiv) => {
  let pokeImage = document.createElement('img');
  pokeImage.className = 'pokemon-img';
  pokeImage.srcset = pokemonImgUrl;
  containerDiv.append(pokeImage);
}

const RenderMainPage = async () => {
  // console.log('RenderMainPage');
  const button = document.createElement('button');
  button.innerHTML = 'Load more pokemons';
  button.classList.add('load-btn');

  appContainer.append(button);

  button.addEventListener('click', (event) => {
    getMorePokemons();
  })
}

const RenderPokemonPage = async ({ id }) => {
  console.log('RenderPokemonPage', id);
  // если хэша нет - добавляем его в историю
  if (!window.location.href.match('#')) {
    history.pushState({}, null, window.location.href + `#pokemonId=${id}`);
  }
  if (allPokemonsData.length) {
    innerPokemonData = allPokemonsData.find(item => item.id === id)
  }

  if (!innerPokemonData) {
    innerPokemonData = await GetPokemonData(id);
  }

  let newElement = document.createElement('div');
  newElement.id = 'inner-pokemon-container';

  let pokeName = document.createElement('h4');
  pokeName.innerText = innerPokemonData.name;
  let pokeNumber = document.createElement('p');
  pokeNumber.innerText = `#${innerPokemonData.id}`;
  let pokeTypes = document.createElement('ul');
  createTypes(innerPokemonData.types, pokeTypes);
  newElement.append(pokeName, pokeNumber, pokeTypes);
  createPokeImage(innerPokemonData.sprites.other['official-artwork'].front_default, newElement);

  let theFirstChild = appContainer.firstElementChild;
  theFirstChild.style.display = 'none';

  appContainer.insertBefore(newElement, theFirstChild);
}

const ShowMainPage = () => {
  console.log('ShowMainPage');
  let innerPokemonContainer = document.getElementById('inner-pokemon-container');
  innerPokemonContainer.remove();
  innerPokemonData = null;

  allPokemonContainer.style.display = 'flex';

  if (!allPokemonsData.length) {
    GetAllPokemons({ offset: 0 });
  }
}

const getMorePokemons = () => {
  GetAdditionslPokemons({ offset });
  offset += POKEMON_API_LIMIT;
}

if (window.location.href.match('#')) {
  const pokemonId = GetPokemonIdFromUrl(window.location.href);

  RenderPokemonPage({ id: pokemonId });
} else {
  GetAllPokemons({ offset: 0 });
}

RenderMainPage();