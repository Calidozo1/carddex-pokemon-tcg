                const usuario = localStorage.getItem('pokemonUsername') || "Usuario Desconocido"; // Valor por defecto si no hay usuario
                let cartaSeleccionadaPropia = null;
                let cartaSeleccionadaAjena = null;
                let sobres = JSON.parse(localStorage.getItem("sobres")) || [];
                let myUserId = usuario || ("user" + Math.floor(Math.random() * 10000));

                document.addEventListener("DOMContentLoaded", () => {
                  document.getElementById?.("nombreUsuario") && (document.getElementById("nombreUsuario").textContent = `Usuario: ${usuario}`);

                  // Lógica para mostrar cartas propias depende de tu HTML, aquí ejemplo de obtener y mostrar
                  const propiasDiv = document.getElementById?.("misCartasDisponibles");
                  if (propiasDiv && sobres.length) {
                    propiasDiv.innerHTML = "";
                    sobres.forEach((sobre, sobreIdx) => {
                      sobre.forEach((carta, idx) => {
                        const card = document.createElement("div");
                        card.classList.add("pokemon-card");

                        card.innerHTML = `
                          <img src="${carta.imagen}" alt="${carta.nombre}" />
                          <p>${carta.nombre.toUpperCase()}</p>
                        `;
                        card.addEventListener("click", () => {
                          cartaSeleccionadaPropia = { ...carta, sobreIdx, idx };
                          // Resaltar
                          [...propiasDiv.childNodes].forEach(n => n.classList.remove("seleccionada"));
                          card.classList.add("seleccionada");

                          // Ably: enviar carta seleccionada
                          tradeChannel.publish('trade-message', {
                            type: 'offer_card',
                            card: {
                              nombre: carta.nombre,
                              imagen: carta.imagen,
                              tipo: carta.tipo
                            }
                          });
                          verificarIntercambio();
                        });
                        propiasDiv.appendChild(card);
                      });
                    });
                  }
                });

                // --- ABLY ---

                const ABLY_API_KEY = '9gRSSQ.3s_Jvw:B_oro2fkpiBRRXpF_jxBsh3sirroNNnSgR2RNepUWWs';
                const ably = new Ably.Realtime({ key: ABLY_API_KEY });
                const tradeChannel = ably.channels.get('pokemon-trade-channel');

                ably.connection.on('connected', () => {
                  document.getElementById?.("mensajeExito") && (document.getElementById("mensajeExito").textContent = "Conectado al servicio de intercambio.");
                });

                ably.connection.on('failed', () => {
                  document.getElementById?.("mensajeExito") && (document.getElementById("mensajeExito").textContent = "Error: Fallo la conexión al servicio de intercambio.");
                });

                // Recibe mensaje del otro usuario
                tradeChannel.subscribe('trade-message', message => {
                  // Ignorar mensajes propios
                  if (message.connectionId && (ably.connection.id === message.connectionId)) return;

                  const data = message.data;
                  if (data.type === 'offer_card') {
                    cartaSeleccionadaAjena = data.card;
                    const otraDiv = document.getElementById?.("otraCartaSeleccionada");
                    if (otraDiv) {
                      otraDiv.innerHTML = '';
                      const cardAjena = document.createElement("div");
                      cardAjena.classList.add("pokemon-card");
                      cardAjena.innerHTML = `
                        <img src="${cartaSeleccionadaAjena.imagen}" alt="${cartaSeleccionadaAjena.nombre}" />
                        <p>${cartaSeleccionadaAjena.nombre.toUpperCase()}</p>
                      `;
                      otraDiv.appendChild(cardAjena);
                    }
                    verificarIntercambio();
                  } else if (data.type === 'trade_successful') {
                    document.getElementById?.("mensajeExito") && (document.getElementById("mensajeExito").textContent = `¡Intercambio completado!`);
                    document.getElementById?.("btnIntercambiar") && (document.getElementById("btnIntercambiar").disabled = true);

                    if (cartaSeleccionadaPropia && cartaSeleccionadaAjena) {
                      // Borra carta propia
                      sobres[cartaSeleccionadaPropia.sobreIdx].splice(cartaSeleccionadaPropia.idx, 1);
                      // Agrega carta ajena
                      sobres[0].push({
                        nombre: cartaSeleccionadaAjena.nombre,
                        imagen: cartaSeleccionadaAjena.imagen,
                        tipo: cartaSeleccionadaAjena.tipo
                      });
                      localStorage.setItem("sobres", JSON.stringify(sobres));
                    }
                  }
                });

                function verificarIntercambio() {
                  const btn = document.getElementById?.("btnIntercambiar");
                  if (btn) btn.disabled = !cartaSeleccionadaPropia || !cartaSeleccionadaAjena;
                }

                // Botón Intercambiar
                document.getElementById?.("btnIntercambiar")?.addEventListener("click", () => {
                  if (!cartaSeleccionadaPropia || !cartaSeleccionadaAjena) return;

                  // Enviar mensaje de éxito al canal
                  tradeChannel.publish('trade-message', {
                    type: 'trade_successful',
                    initiatorId: myUserId
                  });

                  // Borra carta propia y agrega ajena (para el usuario que hizo clic)
                  sobres[cartaSeleccionadaPropia.sobreIdx].splice(cartaSeleccionadaPropia.idx, 1);
                  sobres[0].push({
                    nombre: cartaSeleccionadaAjena.nombre,
                    imagen: cartaSeleccionadaAjena.imagen,
                    tipo: cartaSeleccionadaAjena.tipo
                  });
                  localStorage.setItem("sobres", JSON.stringify(sobres));

                  document.getElementById?.("mensajeExito") && (document.getElementById("mensajeExito").textContent = "¡Intercambio realizado exitosamente!");
                  document.getElementById?.("btnIntercambiar") && (document.getElementById("btnIntercambiar").disabled = true);
             });

