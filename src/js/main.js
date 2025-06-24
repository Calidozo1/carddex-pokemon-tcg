// Datos de prueba (simulando respuesta de PokeAPI)
const testPokemon = [
    {
        id: 1,
        name: "Bulbasaur",
        types: [{ type: { name: "Planta" } }],
        weight: 69,  // hectogramos → 6.9 kg
        height: 7,   // decímetros → 0.7 m
        sprites: { front_default: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png" },
        moves: [
            { move: { name: "Placaje" } },
            { move: { name: "Gruñido" } }
        ]
    },
    {
        id: 4,
        name: "Charmander",
        types: [{ type: { name: "fire" } }],
        weight: 85,
        height: 6,
        sprites: { front_default: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png" },
        moves: [
            { move: { name: "Arañazo" } },
            { move: { name: "Ascuas" } }
        ]
    }
];

// Renderizar cartas en el grid
function renderCards() {
    const container = document.getElementById('card-container');
    container.innerHTML = testPokemon.map(pokemon => `
        <div class="pokemon-card" data-id="${pokemon.id}">
            <p>#${pokemon.id.toString().padStart(3, '0')}</p>
            <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
            <h3>${pokemon.name}</h3>
        </div>
    `).join('');

    // Event listeners para abrir modal
    document.querySelectorAll('.pokemon-card').forEach(card => {
        card.addEventListener('click', () => {
            const pokemonId = parseInt(card.dataset.id);
            const pokemonData = testPokemon.find(p => p.id === pokemonId);
            openModal(pokemonData);
        });
    });
}

// Abrir modal con datos del Pokémon
function openModal(pokemon) {
    const modal = document.getElementById('pokemon-modal');
    modal.classList.remove('modal-hidden');
    modal.style.display = 'flex';

    // Datos básicos
    document.getElementById('nombre-pokemon').textContent = pokemon.name;
    document.getElementById('sprite-pokemon').src = pokemon.sprites.front_default;
    document.getElementById('peso-pokemon').textContent = `${pokemon.weight / 10} kg`;
    document.getElementById('altura-pokemon').textContent = `${pokemon.height / 10} m`;

    // Tipos (badges)
    const tiposContainer = document.getElementById('tipos-pokemon');
    tiposContainer.innerHTML = pokemon.types.map(type => `
        <span class="badge tipo-${type.type.name}">${type.type.name.toUpperCase()}</span>
    `).join('');

    // Movimientos (badges)
    const movimientosContainer = document.getElementById('movimientos-pokemon');
    movimientosContainer.innerHTML = pokemon.moves.slice(0, 2).map(move => `
        <span class="movimiento-badge">${move.move.name.charAt(0).toUpperCase() + move.move.name.slice(1)}</span>
    `).join('');

    
}

// Cerrar modal
document.querySelector('.close-modal').addEventListener('click', () => {
    const modal = document.getElementById('pokemon-modal');
    modal.classList.add('modal-hidden');
    modal.style.display = 'none'; //  Para ocultarlo nuevamente

});

// Inicializar
renderCards();
