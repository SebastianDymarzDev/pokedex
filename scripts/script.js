let currentOffset = 0;
const limit = 20;
let loadedPokemon = [];

async function init() {
    initDialogScrollLock();
    await loadMorePokemon();
}

async function loadMorePokemon() {
    const btn = document.getElementById("loadMoreBtn");
    btn.disabled = true;
    btn.textContent = "Lädt...";

    const pokemonList = await fetchPokemonBatch(currentOffset, limit);
    const pokemonDetails = await fetchPokemonDetails(pokemonList);
    loadedPokemon = loadedPokemon.concat(pokemonDetails);
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
    const primaryType = pokemon.types[0].type.name;
    return getPokemonCardTemplate(pokemon.id, pokemon.name, image, typesHtml, primaryType);
}

function buildTypesHtml(types) {
    let typesHtml = "";
    for (const typeEntry of types) {
        const typeName = typeEntry.type.name;
        typesHtml += getTypeBadgeTemplate(typeName);
    }
    return typesHtml;
}

function openPokemonDialog(pokemonId) {
    const pokemon = findPokemonById(pokemonId);
    const dialogContent = document.getElementById("pokemonDialogContent");
    dialogContent.innerHTML = buildPokemonDetail(pokemon);

    const dialog = document.getElementById("pokemonDialog");
    setDialogTypeBackground(dialog, pokemon.types[0].type.name);
    dialog.showModal();
    document.body.style.overflow = "hidden";
}

function setDialogTypeBackground(dialog, primaryType) {
    dialog.className = `pokemon_dialog type_bg_${primaryType}`;
}

function closePokemonDialog() {
    const dialog = document.getElementById("pokemonDialog");
    dialog.close();
}

function initDialogScrollLock() {
    const dialog = document.getElementById("pokemonDialog");
    dialog.addEventListener("close", () => {
        document.body.style.overflow = "";
    });
}

function findPokemonById(pokemonId) {
    for (const pokemon of loadedPokemon) {
        if (pokemon.id === pokemonId) {
            return pokemon;
        }
    }
    return null;
}

function buildPokemonDetail(pokemon) {
    const image = pokemon.sprites.other["official-artwork"].front_default;
    const typesHtml = buildTypesHtml(pokemon.types);
    const statsHtml = buildStatsHtml(pokemon.stats);
    return getPokemonDetailTemplate(pokemon.name, image, typesHtml, statsHtml, pokemon.height, pokemon.weight);
}

function buildStatsHtml(stats) {
    let statsHtml = "";
    for (const statEntry of stats) {
        statsHtml += getStatRowTemplate(statEntry.stat.name, statEntry.base_stat);
    }
    return statsHtml;
}

function handleDialogClick(event) {
    if (event.target.id === "pokemonDialog") {
        closePokemonDialog();
    }
}