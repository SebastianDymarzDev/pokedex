function getPokemonCardTemplate(id, name, image, typesHtml, primaryType, displayName, formattedNumber) {
    return `
        <div data-id="card" class="pokemon_card type_bg_${primaryType}" role="button" tabindex="0"
            aria-label="${displayName} anzeigen" onclick="openPokemonDialog(${id})" onkeydown="handleCardKeydown(event, ${id})">
            <span data-id="card-number" class="pokemon_number">${formattedNumber}</span>
            <img data-id="card-image" class="pokemon_image" src="${image}" alt="${name}">
            <p class="pokemon_name">${name}</p>
            <div class="pokemon_types">${typesHtml}</div>
        </div>
    `;
}

function getTypeBadgeTemplate(typeName) {
    return `<span class="type_badge type_${typeName}">${typeName}</span>`;
}

function getPokemonDetailTemplate(name, image, typesHtml, statsHtml, height, weight, formattedNumber) {
    return `
        <img data-id="dialog-image" class="pokemon_detail_image" src="${image}" alt="${name}">
        <span data-id="dialog-number" class="pokemon_detail_number">${formattedNumber}</span>
        <h2 class="pokemon_detail_name">${name}</h2>
        <div class="pokemon_types">${typesHtml}</div>
        <div class="pokemon_detail_meta">
            <span>Größe: ${height / 10} m</span>
            <span>Gewicht: ${weight / 10} kg</span>
        </div>
        <div class="pokemon_detail_stats">${statsHtml}</div>
    `;
}

function getStatRowTemplate(statName, statValue) {
    return `
        <div class="stat_row">
            <span class="stat_label">${statName}</span>
            <div class="stat_bar">
                <div class="stat_bar_fill" style="width: ${statValue}%"></div>
            </div>
            <span class="stat_value">${statValue}</span>
        </div>
    `;
}

function getSearchErrorTemplate(query) {
    return `<p data-id="not-found" class="search_error">Kein Pokémon namens "${query}" gefunden.</p>`;
}

function getMinLengthErrorTemplate(minLength) {
    return `<p data-id="min-length-error" class="search_error">Bitte mindestens ${minLength} Buchstaben eingeben.</p>`;
}