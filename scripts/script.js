let currentOffset = 0;
const limit = 20;
let loadedPokemon = [];
let currentDialogIndex = null;
let allPokemonNames = [];
let searchDebounceTimer = null;
const maxSearchResults = 30;
const minSearchLength = 3;
let isSearchActive = false;

async function init() {
    showLoadingOverlay();
    initDialogScrollLock();
    await fetchAllPokemonNames();
    await loadMorePokemon();
}

async function loadMorePokemon() {
    const btn = document.getElementById("loadMoreBtn");
    btn.disabled = true;
    btn.textContent = "Lädt...";
    showLoadingOverlay();

    await fetchAndAppendPokemon();

    hideLoadingOverlay();
    btn.disabled = false;
    btn.textContent = "Mehr laden";
}

async function fetchPokemonBatch(offset, limit) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`);
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error("Fehler beim Laden der Pokemon-Liste:", error);
        return [];
    }
}

async function fetchPokemonDetails(pokemonList) {
    const detailPromises = pokemonList.map(pokemon => fetchSinglePokemon(pokemon.url));
    return Promise.all(detailPromises);
}

async function fetchAllPokemonNames() {
    try {
        const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=2000");
        const data = await response.json();
        allPokemonNames = data.results;
    } catch (error) {
        console.error("Fehler beim Laden aller Pokemon-Namen:", error);
        allPokemonNames = [];
    }
}

async function fetchSinglePokemon(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("Pokemon not found");
        }
        return await response.json();
    } catch (error) {
        console.error("Fehler beim Laden eines Pokemon:", error);
        return null;
    }
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
    const displayName = capitalize(pokemon.name);
    const formattedNumber = formatPokemonNumber(pokemon.id);
    return getPokemonCardTemplate(pokemon.id, pokemon.name, image, typesHtml, primaryType, displayName, formattedNumber);
}

function capitalize(name) {
    return name.charAt(0).toUpperCase() + name.slice(1);
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
    const index = findPokemonIndexById(pokemonId);
    showPokemonAtIndex(index);

    const dialog = document.getElementById("pokemonDialog");
    dialog.showModal();
    lockPageScroll();
}

function showPokemonAtIndex(index) {
    currentDialogIndex = index;
    const pokemon = loadedPokemon[index];

    const dialogContent = document.getElementById("pokemonDialogContent");
    dialogContent.innerHTML = buildPokemonDetail(pokemon);

    const dialog = document.getElementById("pokemonDialog");
    setDialogTypeBackground(dialog, pokemon.types[0].type.name);

    updateNavButtonState();
}

function showPreviousPokemon() {
    if (currentDialogIndex > 0) {
        showPokemonAtIndex(currentDialogIndex - 1);
    }
}

async function showNextPokemon() {
    if (currentDialogIndex === loadedPokemon.length - 1 && !isSearchActive) {
        await loadMoreForDialog();
    }

    if (currentDialogIndex < loadedPokemon.length - 1) {
        showPokemonAtIndex(currentDialogIndex + 1);
    }
}

function updateNavButtonState() {
    const prevBtn = document.getElementById("prevPokemonBtn");
    const nextBtn = document.getElementById("nextPokemonBtn");
    const isLastItem = currentDialogIndex === loadedPokemon.length - 1;

    prevBtn.disabled = currentDialogIndex === 0;
    nextBtn.disabled = isLastItem && isSearchActive;
}

function findPokemonIndexById(pokemonId) {
    for (let i = 0; i < loadedPokemon.length; i++) {
        if (loadedPokemon[i].id === pokemonId) {
            return i;
        }
    }
    return -1;
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
        unlockPageScroll();
    });
}

function buildPokemonDetail(pokemon) {
    const image = pokemon.sprites.other["official-artwork"].front_default;
    const typesHtml = buildTypesHtml(pokemon.types);
    const statsHtml = buildStatsHtml(pokemon.stats);
    const displayName = capitalize(pokemon.name);
    const formattedNumber = formatPokemonNumber(pokemon.id);
    return getPokemonDetailTemplate(displayName, image, typesHtml, statsHtml, pokemon.height, pokemon.weight, formattedNumber);
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

async function loadMoreForDialog() {
    const nextBtn = document.getElementById("nextPokemonBtn");
    nextBtn.disabled = true;
    nextBtn.textContent = "...";
    showLoadingOverlay();

    await fetchAndAppendPokemon();

    hideLoadingOverlay();
    nextBtn.disabled = false;
    nextBtn.textContent = "→";
}

async function fetchAndAppendPokemon() {
    const pokemonList = await fetchPokemonBatch(currentOffset, limit);
    const pokemonDetails = await fetchPokemonDetails(pokemonList);
    loadedPokemon = loadedPokemon.concat(pokemonDetails);
    renderPokemonBatch(pokemonDetails);
    currentOffset += limit;
}

async function searchPokemon() {
    const query = getSearchQuery();

    if (query === "") {
        await resetToDefaultList();
        return;
    }

    if (query.length < minSearchLength) {
        showMinLengthError();
        return;
    }

    await performSearch(query);
}

function showMinLengthError() {
    clearPokedexGrid();
    const grid = document.getElementById("pokedexGrid");
    grid.innerHTML = getMinLengthErrorTemplate(minSearchLength);
    toggleLoadMoreButton(false);
}

function getMatchingNames(query) {
    const matches = [];
    for (const entry of allPokemonNames) {
        if (entry.name.includes(query) && matches.length < maxSearchResults) {
            matches.push(entry);
        }
    }
    return matches;
}

function handleSearchKeydown(event) {
    if (event.key === "Enter") {
        clearTimeout(searchDebounceTimer);
        searchPokemon();
    }
}

function handleSearchInput() {
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(searchPokemon, 300);
}

function getSearchQuery() {
    const input = document.getElementById("searchInput");
    return input.value.trim().toLowerCase();
}

async function performSearch(query) {
    const searchBtn = document.querySelector(".searchBtn");
    searchBtn.disabled = true;

    const matches = getMatchingNames(query);

    if (matches.length === 0) {
        showSearchError(query);
    } else {
        await showSearchResults(matches);
    }

    searchBtn.disabled = false;
}

async function showSearchResults(matches) {
    showLoadingOverlay();
    const pokemonDetails = await fetchPokemonDetails(matches);
    loadedPokemon = pokemonDetails;
    isSearchActive = true;
    renderPokemonList(pokemonDetails);
    toggleLoadMoreButton(false);
    hideLoadingOverlay();
}

function showSearchError(query) {
    clearPokedexGrid();
    const grid = document.getElementById("pokedexGrid");
    grid.innerHTML = getSearchErrorTemplate(query);
    toggleLoadMoreButton(false);
}

async function resetToDefaultList() {
    currentOffset = 0;
    loadedPokemon = [];
    isSearchActive = false;
    clearPokedexGrid();
    toggleLoadMoreButton(true);
    await loadMorePokemon();
}

function clearPokedexGrid() {
    const grid = document.getElementById("pokedexGrid");
    grid.innerHTML = "";
}

function renderPokemonList(pokemonList) {
    clearPokedexGrid();
    renderPokemonBatch(pokemonList);
}

function toggleLoadMoreButton(show) {
    const btn = document.getElementById("loadMoreBtn");
    btn.classList.toggle("hidden", !show);
}

function showLoadingOverlay() {
    document.getElementById("loadingOverlay").classList.remove("hidden");
}

function hideLoadingOverlay() {
    document.getElementById("loadingOverlay").classList.add("hidden");
}

function handleCardKeydown(event, pokemonId) {
    if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openPokemonDialog(pokemonId);
    }
}

function formatPokemonNumber(id) {
    return "#" + String(id).padStart(3, "0");
}

function lockPageScroll() {
    document.body.classList.add("no-scroll");
    document.documentElement.classList.add("no-scroll");
}

function unlockPageScroll() {
    document.body.classList.remove("no-scroll");
    document.documentElement.classList.remove("no-scroll");
}