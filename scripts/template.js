function getPokemonCardTemplate(id, name, image, typesHtml, primaryType) {
    return `
        <div class="pokemon_card type_bg_${primaryType}" onclick="openPokemonDialog(${id})">
            <img class="pokemon_image" src="${image}" alt="${name}">
            <p class="pokemon_name">${name}</p>
            <div class="pokemon_types">${typesHtml}</div>
        </div>
    `;
}

function getTypeBadgeTemplate(typeName) {
    return `<span class="type_badge type_${typeName}">${typeName}</span>`;
}

function getPokemonDetailTemplate(name, image, typesHtml, statsHtml, height, weight) {
    return `
        <img class="pokemon_detail_image" src="${image}" alt="${name}">
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