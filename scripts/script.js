let currentOffset = 0;
const limit = 20;

async function init() {
    await loadMorePokemon();
}

async function loadMorePokemon() {
    const btn = document.getElementById("loadMoreBtn");
    btn.disabled = true;
    btn.textContent = "Lädt...";

    const pokemonList = await fetchPokemonBatch(currentOffset, limit);
    const pokemonDetails = await fetchPokemonDetails(pokemonList);
    renderPokemonBatch(pokemonDetails);

    currentOffset += limit;
    btn.disabled = false;
    btn.textContent = "Mehr laden";
}

async function fetchPokemonBatch(offset, limit) {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`);
    const data = await response.json();
    return data.results;
}

async function fetchPokemonDetails(pokemonList) {
    const detailPromises = pokemonList.map(pokemon => fetchSinglePokemon(pokemon.url));
    return Promise.all(detailPromises);
}

async function fetchSinglePokemon(url) {
    const response = await fetch(url);
    return response.json();
}

function renderPokemonBatch(pokemonDetails) {
    const grid = document.getElementById("pokedexGrid");
    for (const pokemon of pokemonDetails) {
        grid.innerHTML += buildPokemonCard(pokemon);
    }
}

function buildPokemonCard(pokemon) {
    const image = pokemon.sprites.other["official-artwork"].front_default;
    const typesHtml = buildTypesHtml(pokemon.types);
    return getPokemonCardTemplate(pokemon.name, image, typesHtml);
}

function buildTypesHtml(types) {
    let typesHtml = "";
    for (const typeEntry of types) {
        const typeName = typeEntry.type.name;
        typesHtml += getTypeBadgeTemplate(typeName);
    }
    return typesHtml;
}