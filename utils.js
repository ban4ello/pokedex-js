const GetPokemonIdFromUrl = (url) => {
  const index = url.match('=').index

  return Number(url.slice(index + 1));
}
