let allPokemons = [];
const cardContainer = document.getElementById("card-container");
const coleccionContainer = document.getElementById("coleccion");
const grid = document.getElementById("grid");

window.onload = async () => {
    const savedPokemons = localStorage.getItem("pokemon-list");

    if (savedPokemons) {
        allPokemons = JSON.parse(savedPokemons);
        renderCards();
    } else {
        await loadAllPokemons();
    }

    const sobres = JSON.parse(localStorage.getItem("sobres")) || [];
    mostrarColeccion(sobres);
    generarGridPokemon();
};

async function fetchBasicPokemons(limit = 150) {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}`);
    const data = await res.json();
    return data.results;
}

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

async function loadAllPokemons() {
    try {
        const basicList = await fetchBasicPokemons();
        const detailedPromises = basicList.map(p => fetchPokemonDetails(p.url));
        allPokemons = await Promise.all(detailedPromises);
        localStorage.setItem("pokemon-list", JSON.stringify(allPokemons));
        renderCards();
    } catch (error) {
        console.error("Error al cargar los Pokémon:", error);
    }
}

function renderCards() {
    if (!cardContainer) return;
    const ownedPokemons = JSON.parse(localStorage.getItem("sobres")) || [];
    const ownedNames = ownedPokemons.flat().map(p => p.nombre.toLowerCase());

    const pokemonsDesbloqueados = allPokemons.filter(pokemon =>
        ownedNames.includes(pokemon.name.toLowerCase())
    );

    cardContainer.innerHTML = pokemonsDesbloqueados.map(pokemon => `
        <div class="pokemon-card unlocked" data-id="${pokemon.id}" data-nombre="${pokemon.name}" data-tipo="${pokemon.types.map(t => t.type.name).join(',')}">
            <p>#${pokemon.id.toString().padStart(3, '0')}</p>
            <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
            <h3>${pokemon.name}</h3>
        </div>
    `).join('');

    document.querySelectorAll('.pokemon-card').forEach(card => {
        card.addEventListener('click', () => {
            const id = parseInt(card.dataset.id);
            const data = allPokemons.find(p => p.id === id);
            openModal(data);
        });
    });
}

function openModal(pokemon) {
    const modal = document.getElementById("pokemon-modal");
    modal.classList.remove("modal-hidden");

    document.getElementById("nombre-pokemon").textContent = pokemon.name;
    document.getElementById("sprite-pokemon").src = pokemon.sprites.front_default;
    document.getElementById("peso-pokemon").textContent = `${pokemon.weight / 10} kg`;
    document.getElementById("altura-pokemon").textContent = `${pokemon.height / 10} m`;

    document.getElementById("tipos-pokemon").innerHTML = pokemon.types.map(t => `
        <span class="badge tipo-${t.type.name}">${t.type.name.toUpperCase()}</span>
    `).join("");

    document.getElementById("movimientos-pokemon").innerHTML = pokemon.moves.slice(0, 2).map(m => `
        <span class="movimiento-badge">${m.move.name.charAt(0).toUpperCase() + m.move.name.slice(1)}</span>
    `).join("");
}

document.querySelector(".close-modal")?.addEventListener("click", () => {
    const modal = document.getElementById("pokemon-modal");
    modal.classList.add("modal-hidden");
});

async function buscarPokemon() {
    const input = document.getElementById("pokemonInput");
    const resultado = document.getElementById("resultado");
    const nombre = input.value.trim().toLowerCase();

    if (!nombre) {
        resultado.innerHTML = `<p>Por favor, ingresa un nombre o ID válido.</p>`;
        return;
    }

    try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${nombre}`);
        if (!res.ok) throw new Error("Pokémon no encontrado");
        const data = await res.json();

        resultado.innerHTML = `
            <div class="resultado-pokemon">
                <h2>${data.name.toUpperCase()}</h2>
                <img src="${data.sprites.front_default}" alt="${data.name}">
                <p><strong>ID:</strong> #${data.id.toString().padStart(3, '0')}</p>
                <p><strong>Altura:</strong> ${data.height / 10} m</p>
                <p><strong>Peso:</strong> ${data.weight / 10} kg</p>
                <p><strong>Tipo(s):</strong> ${data.types.map(t => t.type.name).join(', ')}</p>
            </div>`;
    } catch (error) {
        resultado.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
    }
}

async function obtenerPokemonRandom() {
    const id = Math.floor(Math.random() * allPokemons.length);
    const pokemon = allPokemons[id];
    return {
        nombre: pokemon.name,
        imagen: pokemon.sprites.front_default,
        tipo: pokemon.types.map(t => t.type.name)
    };
}

async function abrirSobre() {
    const sobre = [];
    for (let i = 0; i < 6; i++) {
        sobre.push(await obtenerPokemonRandom());
    }

    let sobres = JSON.parse(localStorage.getItem("sobres")) || [];
    sobres.push(sobre);
    localStorage.setItem("sobres", JSON.stringify(sobres));
    mostrarColeccion(sobres);
    mostrarUltimoSobre(sobre);
    renderCards();
}

function mostrarUltimoSobre(sobre) {
    const container = document.getElementById("ultimoSobre");
    if (!container) return;

    container.innerHTML = ""; // limpiar anterior

    sobre.forEach(pokemon => {
        container.innerHTML += `
            <div class="pokemon-card">
                <img src="${pokemon.imagen}" alt="${pokemon.nombre}" />
                <h3>${pokemon.nombre.toUpperCase()}</h3>
                <p>${pokemon.tipo.join(", ")}</p>
            </div>
        `;
    });
}

function mostrarColeccion(sobres) {
    if (!coleccionContainer) return;
    coleccionContainer.innerHTML = "";
    sobres.forEach(sobre => {
        sobre.forEach(p => {
            coleccionContainer.innerHTML += `
                <div class="carta-mini">
                  <img src="${p.imagen}" alt="${p.nombre}">
                  <strong>${p.nombre.toUpperCase()}</strong><br>
                  <small>${p.tipo.join(", ")}</small>
                </div>`;
        });
    });
}

function generarGridPokemon() {
    if (!grid) return;
    grid.innerHTML = "";
    const sobres = JSON.parse(localStorage.getItem("sobres")) || [];
    const nombres = sobres.flat().map(p => p.nombre);

    for (let i = 1; i <= 150; i++) {
        const slot = document.createElement("div");
        slot.classList.add("carta");

        fetch(`https://pokeapi.co/api/v2/pokemon/${i}`)
            .then(res => res.json())
            .then(data => {
                if (nombres.includes(data.name)) {
                    slot.innerHTML = `<img src="${data.sprites.front_default}" alt="${data.name}" />`;
                    slot.addEventListener("click", () => openModal(data));
                } else {
                    slot.innerHTML = `<img src="${data.sprites.front_default}" alt="${data.name}" />`;
                    slot.classList.add("locked");
                }
                slot.dataset.nombre = data.name;
                slot.dataset.tipo = data.types.map(t => t.type.name).join(',');
                grid.appendChild(slot);
            });
    }
}

function mostrarModal(data) {
    const modal = document.getElementById("modal");
    if (!modal) return;
    modal.innerHTML = `
        <h2>${data.name}</h2>
        <img src="${data.sprites.front_default}" />
        <p>Tipo: ${data.types.map(t => t.type.name).join(", ")}</p>
        <p>Altura: ${data.height / 10} m</p>
        <p>Peso: ${data.weight / 10} kg</p>`;
    modal.style.display = "block";
}


document.getElementById("filtroInput")?.addEventListener("input", e => {
    const filtro = e.target.value.toLowerCase();

    document.querySelectorAll("#grid .carta").forEach(carta => {
        const nombre = carta.dataset.nombre?.toLowerCase() || "";
        const tipo = carta.dataset.tipo?.toLowerCase() || "";

        if (nombre.includes(filtro) || tipo.includes(filtro)) {
            carta.style.display = "block";
        } else {
            carta.style.display = "none";
        }
    });
});