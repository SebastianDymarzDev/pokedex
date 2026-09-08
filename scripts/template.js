function getPokemonCardTemplate(name, image, typesHtml, primaryType) {
    return `
        <div class="pokemon_card type_bg_${primaryType}">
            <img class="pokemon_image" src="${image}" alt="${name}">
            <p class="pokemon_name">${name}</p>
            <div class="pokemon_types">${typesHtml}</div>
        </div>
    `;
}

function getTypeBadgeTemplate(typeName) {
    return `<span class="type_badge type_${typeName}">${typeName}</span>`;
}