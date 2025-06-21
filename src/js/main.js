// Conexión con elementos HTML
const cardContainer = document.getElementById('card-container');

// Datos de prueba (luego se reemplazarán por la API)
const testPokemon = [
    { id: 1, name: "Bulbasaur", type: "grass" },
    { id: 4, name: "Charmander", type: "fire" }
];

// Mostrar cartas de prueba
function renderCards() {
    cardContainer.innerHTML = testPokemon.map(pokemon => `
        <div class="card" data-id="${pokemon.id}">
            <h3>${pokemon.name}</h3>
            <p>Tipo: ${pokemon.type}</p>
        </div>
    `).join('');
}

// Inicializar
renderCards();