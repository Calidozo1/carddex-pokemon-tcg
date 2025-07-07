// Variables globales
let allPokemons = []; // Almacenará todos los Pokémon obtenidos desde la API
const cardContainer = document.getElementById("card-container");
const coleccionContainer = document.getElementById("coleccion");

// Cargar todos los Pokémon al iniciar la aplicación
window.onload = async () => {
    const savedPokemons = localStorage.getItem("pokemon-list");

    if (savedPokemons) {
        allPokemons = JSON.parse(savedPokemons);
        renderCards();
    } else {
        await loadAllPokemons(); // Descargar desde la API si no están guardados
    }

    const sobres = JSON.parse(localStorage.getItem("sobres")) || [];
    mostrarColeccion(sobres);
};

// Obtener lista básica de los primeros 150 Pokémon
async function fetchBasicPokemons(limit = 150) {
    const url = `https://pokeapi.co/api/v2/pokemon?limit=${limit}`;
    const res = await fetch(url);
    const data = await res.json();
    return data.results; // {name, url}
}

// Obtener detalles completos de un Pokémon por URL
async function fetchPokemonDetails(pokemonUrl) {
    const res = await fetch(pokemonUrl);
    const data = await res.json();

    return {
        id: data.id,
        name: data.name,
        types: data.types,
        weight: data.weight,
        height: data.height,
        sprites: data.sprites,
        moves: data.moves.slice(0, 6)
    };
}

// Cargar todos los Pokémon y guardarlos en memoria/localStorage
async function loadAllPokemons() {
    try {
        const basicList = await fetchBasicPokemons(); // Obtiene lista básica
        const detailedPromises = basicList.map(p => fetchPokemonDetails(p.url));
        allPokemons = await Promise.all(detailedPromises); // Espera todas las promesas

        // Guardar en localStorage para acelerar futuras cargas
        localStorage.setItem("pokemon-list", JSON.stringify(allPokemons));

        console.log("Pokémon cargados:", allPokemons);
        renderCards(); // Renderiza las cartas
    } catch (error) {
        console.error("Error al cargar los Pokémon:", error);
    }
}

function renderCards() {
    const container = document.getElementById("card-container");
    if (!container) return;

    // Obtener cartas desbloqueadas desde localStorage
    const ownedPokemons = JSON.parse(localStorage.getItem("sobres")) || [];
    const ownedNames = ownedPokemons.flat().map(p => p.nombre.toLowerCase());

    // Filtrar solo las cartas desbloqueadas
    const pokemonsDesbloqueados = allPokemons.filter(pokemon =>
        ownedNames.includes(pokemon.name.toLowerCase())
    );

    // Renderizar solo las desbloqueadas
    container.innerHTML = pokemonsDesbloqueados.map(pokemon => `
        <div class="pokemon-card unlocked" data-id="${pokemon.id}">
            <p>#${pokemon.id.toString().padStart(3, '0')}</p>
            <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
            <h3>${pokemon.name}</h3>
        </div>
    `).join('');

    // Agregar eventos a cada carta
    document.querySelectorAll('.pokemon-card').forEach(card => {
        card.addEventListener('click', () => {
            const pokemonId = parseInt(card.dataset.id);
            const pokemonData = allPokemons.find(p => p.id === pokemonId);
            openModal(pokemonData);
        });
    });
}

// Abrir modal con datos del Pokémon
function openModal(pokemon) {
    const modal = document.getElementById("pokemon-modal");
    modal.classList.remove("modal-hidden");

    // Datos básicos
    document.getElementById("nombre-pokemon").textContent = pokemon.name;
    document.getElementById("sprite-pokemon").src = pokemon.sprites.front_default;
    document.getElementById("peso-pokemon").textContent = `${pokemon.weight / 10} kg`;
    document.getElementById("altura-pokemon").textContent = `${pokemon.height / 10} m`;

    // Tipos (badges)
    const tiposContainer = document.getElementById("tipos-pokemon");
    tiposContainer.innerHTML = pokemon.types.map(type => `
        <span class="badge tipo-${type.type.name}">${type.type.name.toUpperCase()}</span>
    `).join("");

    // Movimientos (badges)
    const movimientosContainer = document.getElementById("movimientos-pokemon");
    movimientosContainer.innerHTML = pokemon.moves.slice(0, 2).map(move => `
        <span class="movimiento-badge">${move.move.name.charAt(0).toUpperCase() + move.move.name.slice(1)}</span>
    `).join("");
}

// Cerrar modal
document.querySelector(".close-modal").addEventListener("click", () => {
    const modal = document.getElementById("pokemon-modal");
    modal.classList.add("modal-hidden");
});

// Buscar Pokémon por nombre o ID
async function buscarPokemon() {
    const input = document.getElementById("pokemonInput");
    const resultado = document.getElementById("resultado");

    let nombre = input.value.trim().toLowerCase(); // Limpiar espacios y pasar a minúsculas

    if (!nombre) {
        resultado.innerHTML = `<p>Por favor, ingresa un nombre o ID válido.</p>`;
        return;
    }

    const url = `https://pokeapi.co/api/v2/pokemon/${nombre}`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Pokémon no encontrado");
        }

        const data = await response.json();

        // Mostrar detalles del Pokémon
        resultado.innerHTML = `
            <div class="resultado-pokemon">
                <h2>${data.name.toUpperCase()}</h2>
                <img src="${data.sprites.front_default}" alt="${data.name}">
                <p><strong>ID:</strong> #${data.id.toString().padStart(3, '0')}</p>
                <p><strong>Altura:</strong> ${data.height / 10} m</p>
                <p><strong>Peso:</strong> ${data.weight / 10} kg</p>
                <p><strong>Tipo(s):</strong> ${data.types.map(t => t.type.name).join(', ')}</p>
            </div>
        `;
    } catch (error) {
        console.error("Error al buscar el Pokémon:", error);
        resultado.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
    }
}

// Obtener un Pokémon aleatorio
async function obtenerPokemonRandom() {
    const id = Math.floor(Math.random() * allPokemons.length);
    const pokemon = allPokemons[id];
    return {
        nombre: pokemon.name,
        imagen: pokemon.sprites.front_default,
        tipo: pokemon.types.map(t => t.type.name)
    };
}

// Abrir sobre de Pokémon
async function abrirSobre() {
    const sobre = [];

    for (let i = 0; i < 6; i++) {
        const pokemon = await obtenerPokemonRandom();
        sobre.push(pokemon);
    }

    let sobres = JSON.parse(localStorage.getItem("sobres")) || [];
    sobres.push(sobre);
    localStorage.setItem("sobres", JSON.stringify(sobres));

    mostrarColeccion(sobres);
    renderCards(); // Actualizar índice
}

// Mostrar colección de cartas
function mostrarColeccion(sobres) {
    if (!coleccionContainer) return;
    coleccionContainer.innerHTML = "";

    sobres.forEach((sobre, index) => {
        sobre.forEach(p => {
            coleccionContainer.innerHTML += `
                <div style="display:inline-block; margin: 10px; text-align:center;">
                  <img src="${p.imagen}" alt="${p.nombre}" style="width:100px;"><br>
                  <strong>${p.nombre.toUpperCase()}</strong><br>
                  <small>${p.tipo.join(", ")}</small>
                </div>
            `;
        });
    });
}