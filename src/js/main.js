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

// Funciones para buscar Pokémon por nombre y mostrar tipo
    async function buscarPokemon() {
      const nombre = document.getElementById('pokemonInput').value.toLowerCase();
      const url = `https://pokeapi.co/api/v2/pokemon/${nombre}`;

      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Pokémon no encontrado');
        const data = await response.json();
        document.getElementById('resultado').innerHTML = `
          <h2>${data.name.toUpperCase()}</h2>
          <img src="${data.sprites.front_default}" alt="${data.name}">
          <p>Altura: ${data.height}</p>
          <p>Peso: ${data.weight}</p>
          <p>Tipo: ${data.types.map(t => t.type.name).join(', ')}</p>
        `;
      } catch (error) {
        document.getElementById('resultado').innerHTML = `<p>Error: ${error.message}</p>`;
      }
    }

        async function mostrarTipoPokemon() {
      const nombre = document.getElementById('pokemonInput').value.toLowerCase();
      const url = `https://pokeapi.co/api/v2/pokemon/${nombre}`;

      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Pokémon no encontrado');
        const data = await response.json();
        document.getElementById('resultado').innerHTML = `
          <h2>${data.name.toUpperCase()}</h2>
          <img src="${data.sprites.front_default}" alt="${data.name}">
          <p>Altura: ${data.height}</p>
          <p>Peso: ${data.weight}</p>
          <p>Tipo: ${data.types.map(t => t.type.name).join(', ')}</p>
        `;
      } catch (error) {
        document.getElementById('resultado').innerHTML = `<p>Error: ${error.message}</p>`;
      }
    }

// Funciones para abrir sobres de Pokémon
    async function obtenerPokemonRandom() {
      const id = Math.floor(Math.random() * 898) + 1; // 1 a 898 (hasta Gen 8)
      const url = `https://pokeapi.co/api/v2/pokemon/${id}`;
      const res = await fetch(url);
      const data = await res.json();
      return {
        nombre: data.name,
        imagen: data.sprites.front_default,
        tipo: data.types.map(t => t.type.name)
      };
    }

 async function abrirSobre() {
  const sobre = [];

  for (let i = 0; i < 3; i++) {
    const pokemon = await obtenerPokemonRandom();
    sobre.push(pokemon);
  }

  // Obtener sobres existentes del localStorage
  let sobres = JSON.parse(localStorage.getItem("sobres")) || [];

  // Agregar el nuevo sobre
  sobres.push(sobre);

  // Guardar en localStorage
  localStorage.setItem("sobres", JSON.stringify(sobres));

  // Mostrar toda la colección
  mostrarColeccion(sobres);
}

    function mostrarSobre(sobre) {
      const contenedor = document.getElementById("ultimoSobre");
      contenedor.innerHTML = "";
      sobre.forEach(p => {
        contenedor.innerHTML += `
          <div style="margin-bottom: 1em;">
            <h3>${p.nombre.toUpperCase()}</h3>
            <img src="${p.imagen}" alt="${p.nombre}">
            <p>Tipo: ${p.tipo.join(", ")}</p>
          </div>
        `;
      });
    }

        // Mostrar sobre guardado al cargar
    window.onload = () => {
      const guardado = localStorage.getItem("ultimoSobre");
      if (guardado) {
        mostrarSobre(JSON.parse(guardado));
      }
    };

function mostrarColeccion(sobres) {
  const contenedor = document.getElementById("coleccion");
  contenedor.innerHTML = "";

  sobres.forEach((sobre, index) => {
    contenedor.innerHTML += `<h2>Sobre #${index + 1}</h2>`;
    sobre.forEach(p => {
      contenedor.innerHTML += `
        <div style="display:inline-block; margin: 10px; text-align:center;">
          <img src="${p.imagen}" alt="${p.nombre}" style="width:100px;"><br>
          <strong>${p.nombre.toUpperCase()}</strong><br>
          <small>${p.tipo.join(", ")}</small>
        </div>
      `;
    });
  });
}