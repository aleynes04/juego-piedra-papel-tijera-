// Variables globales para llevar el control de la puntuación
let victorias = 0;
let perdidas = 0;

// Diccionario de imágenes: Centraliza las URLs para que el código sea más limpio
const IMAGENES = {
    1: "https://raw.githubusercontent.com/googlefonts/noto-emoji/main/png/512/emoji_u1f91c.png", // Piedra
    2: "https://raw.githubusercontent.com/googlefonts/noto-emoji/main/png/512/emoji_u1f4c4.png", // Papel
    3: "https://raw.githubusercontent.com/googlefonts/noto-emoji/main/png/512/emoji_u2702.png"  // Tijera
};

/**
 * Función para generar la jugada de la computadora.
 * @param {number} min - Valor mínimo (1)
 * @param {number} max - Valor máximo (3)
 * @returns {number} - Un número aleatorio entre el rango definido.
 */
function aleatorio(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * Función principal que ejecuta la lógica de cada ronda.
 * @param {number} jugador - La opción elegida por el usuario (1, 2 o 3).
 */
function jugar(jugador) {
    // Si alguien ya alcanzó 3 victorias, bloqueamos el juego hasta que reinicie.
    if (victorias >= 3 || perdidas >= 3) return;

    // La computadora genera su jugada aleatoria (1, 2 o 3).
    let pc = aleatorio(1, 3);
    
    // Mostramos visualmente las elecciones inyectando la etiqueta <img> en el HTML.
    document.getElementById("user-choice").innerHTML = `<img src="${IMAGENES[jugador]}">`;
    document.getElementById("pc-choice").innerHTML = `<img src="${IMAGENES[pc]}">`;

    let resultado = "";
    const label = document.getElementById("result-label");

    /* LÓGICA DE COMBATE COMPLEJA:
       Usamos comparaciones booleanas para determinar el ganador.
       - Si son iguales: EMPATE.
       - Si el jugador elige una opción que vence a la de la PC: VICTORIA.
       - Caso contrario: DERROTA.
    */
    if (jugador === pc) {
        resultado = "EMPATE TÉCNICO";
    } else if (
        (jugador == 1 && pc == 3) || // Piedra vence a Tijera
        (jugador == 2 && pc == 1) || // Papel vence a Piedra
        (jugador == 3 && pc == 2)    // Tijera vence a Papel
    ) {
        resultado = "¡PUNTO JUGADOR!";
        victorias++;
    } else {
        resultado = "PUNTO COMPUTADORA";
        perdidas++;
    }

    // Actualizamos el texto de resultado y los números del marcador.
    label.innerText = resultado;
    document.getElementById("victorias").innerText = victorias;
    document.getElementById("perdidas").innerText = perdidas;

    // Verificamos si la partida ha terminado después de esta ronda.
    revisarFinal(label);
}

/**
 * Comprueba si el marcador llegó a 3 y muestra el mensaje de fin de juego.
 */
function revisarFinal(label) {
    if (victorias === 3 || perdidas === 3) {
        // Mensaje final basado en quién ganó.
        label.innerText = victorias === 3 ? "ACCESO TOTAL: ¡GANASTE!" : "SISTEMA BLOQUEADO: PERDISTE";
        // Mostramos el botón de reinicio que estaba oculto en CSS.
        document.getElementById("reset").style.display = "block";
    }
}

/**
 * Restablece todas las variables y la interfaz al estado inicial.
 */
function resetear() {
    victorias = 0;
    perdidas = 0;
    document.getElementById("victorias").innerText = "0";
    document.getElementById("perdidas").innerText = "0";
    document.getElementById("result-label").innerText = "ESPERANDO JUGADA...";
    document.getElementById("user-choice").innerText = "?";
    document.getElementById("pc-choice").innerText = "?";
    document.getElementById("reset").style.display = "none";
}