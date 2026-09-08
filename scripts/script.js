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
    renderPokemonBatch(pokemonList);

    currentOffset += limit;
    btn.disabled = false;
    btn.textContent = "Mehr laden";
}

async function fetchPokemonBatch(offset, limit) {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`);
    const data = await response.json();
    return data.results;
}

function renderPokemonBatch(pokemonList) {
    const grid = document.getElementById("pokedexGrid");
    for (const pokemon of pokemonList) {
        grid.innerHTML += getPokemonCardTemplate(pokemon);
    }
}