class GameController {
    constructor() {
        // Estado del juego
        this.victorias = 0;
        this.perdidas = 0;
        this.meta = 3;
        this.enBatalla = false;

        // Historial persistente local
        this.historial = {
            ganadas: parseInt(localStorage.getItem('historialGanadas')) || 0,
            perdidas: parseInt(localStorage.getItem('historialPerdidas')) || 0
        };

        // Referencias a UI
        this.ui = {
            userChoice: document.getElementById("user-choice"),
            pcChoice: document.getElementById("pc-choice"),
            label: document.getElementById("result-label"),
            battleField: document.getElementById("battle-field"),
            victorias: document.getElementById("victorias"),
            perdidas: document.getElementById("perdidas"),
            resetBtn: document.getElementById("reset"),
            metaSelect: document.getElementById("meta-select"),
            historialGanadas: document.getElementById("hist-ganadas"),
            historialPerdidas: document.getElementById("hist-perdidas")
        };

        // Assets Locales (Etapa 3.2)
        this.IMAGENES = {
            1: "assets/images/piedra.png",
            2: "assets/images/papel.png",
            3: "assets/images/tijera.png",
            pregunta: "assets/images/pregunta.png"
        };

        // Sintetizador
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        
        this.initEventListeners();
        this.actualizarUIHistorial();
    }

    initEventListeners() {
        this.ui.metaSelect.addEventListener('change', (e) => {
            if (this.victorias > 0 || this.perdidas > 0) {
                // reset if game is ongoing
                this.resetear();
            }
            this.meta = parseInt(e.target.value);
            this.playSound('click');
        });
        
        this.ui.resetBtn.addEventListener('click', () => this.resetear());
        
        document.getElementById("btn-piedra").addEventListener('click', () => this.jugar(1));
        document.getElementById("btn-papel").addEventListener('click', () => this.jugar(2));
        document.getElementById("btn-tijera").addEventListener('click', () => this.jugar(3));
    }

    playSound(type) {
        if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        
        const now = this.audioCtx.currentTime;
        if (type === 'click') {
            osc.type = 'sine'; osc.frequency.setValueAtTime(600, now);
            osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc.start(); osc.stop(now + 0.1);
        } else if (type === 'win') {
            osc.type = 'square'; osc.frequency.setValueAtTime(400, now);
            osc.frequency.setValueAtTime(600, now + 0.1);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            osc.start(); osc.stop(now + 0.3);
        } else if (type === 'lose') {
            osc.type = 'sawtooth'; osc.frequency.setValueAtTime(300, now);
            osc.frequency.exponentialRampToValueAtTime(100, now + 0.3);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            osc.start(); osc.stop(now + 0.3);
        } else if (type === 'tie') {
            osc.type = 'triangle'; osc.frequency.setValueAtTime(200, now);
            gain.gain.setValueAtTime(0.05, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
            osc.start(); osc.stop(now + 0.2);
        } else if (type === 'gameover') {
            osc.type = 'sawtooth'; osc.frequency.setValueAtTime(150, now);
            osc.frequency.exponentialRampToValueAtTime(50, now + 0.8);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
            osc.start(); osc.stop(now + 0.8);
        } else if (type === 'gamewin') {
            osc.type = 'square'; osc.frequency.setValueAtTime(400, now);
            osc.frequency.setValueAtTime(800, now + 0.2);
            osc.frequency.setValueAtTime(1200, now + 0.4);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.linearRampToValueAtTime(0.15, now + 0.4);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
            osc.start(); osc.stop(now + 0.8);
        }
    }

    aleatorio(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    jugar(jugador) {
        // Bloquear si la partida terminó o hay una animación en curso
        if (this.victorias >= this.meta || this.perdidas >= this.meta || this.enBatalla) return;
        
        this.enBatalla = true;
        this.playSound('click');

        let pc = this.aleatorio(1, 3);
        
        // Limpiar bordes de rondas anteriores
        this.ui.battleField.classList.remove("win-border", "lose-border", "tie-border");

        // Animación de combate (suspenso)
        this.ui.userChoice.innerHTML = `<img src="${this.IMAGENES[jugador]}" class="shake">`;
        this.ui.pcChoice.innerHTML = `<img src="${this.IMAGENES.pregunta}" class="shake">`; 
        this.ui.label.innerText = "SINTETIZANDO JUGADA...";
        
        setTimeout(() => {
            this.resolverRonda(jugador, pc);
        }, 1200); // 1.2 segundos de suspenso
    }

    resolverRonda(jugador, pc) {
        // Revelar resultado y remover shakes
        this.ui.userChoice.innerHTML = `<img src="${this.IMAGENES[jugador]}">`;
        this.ui.pcChoice.innerHTML = `<img src="${this.IMAGENES[pc]}">`;

        let resultado = "";

        if (jugador === pc) {
            resultado = "EMPATE TÉCNICO";
            this.ui.battleField.classList.add("tie-border");
            this.playSound('tie');
        } else if (
            (jugador == 1 && pc == 3) || 
            (jugador == 2 && pc == 1) || 
            (jugador == 3 && pc == 2)    
        ) {
            resultado = "¡PUNTO JUGADOR!";
            this.victorias++;
            this.ui.battleField.classList.add("win-border");
            this.playSound('win');
        } else {
            resultado = "PUNTO COMPUTADORA";
            this.perdidas++;
            this.ui.battleField.classList.add("lose-border");
            this.playSound('lose');
        }

        this.actualizarUIMarcador(resultado);
        this.enBatalla = false; // Desbloqueamos interacción
        
        this.revisarFinal();
    }

    actualizarUIMarcador(resultadoText) {
        this.ui.label.innerText = resultadoText;
        this.ui.victorias.innerText = this.victorias;
        this.ui.perdidas.innerText = this.perdidas;
    }

    actualizarUIHistorial() {
        this.ui.historialGanadas.innerText = this.historial.ganadas;
        this.ui.historialPerdidas.innerText = this.historial.perdidas;
    }

    guardarHistorial() {
        localStorage.setItem('historialGanadas', this.historial.ganadas);
        localStorage.setItem('historialPerdidas', this.historial.perdidas);
        this.actualizarUIHistorial();
    }

    revisarFinal() {
        if (this.victorias === this.meta || this.perdidas === this.meta) {
            if (this.victorias === this.meta) {
                this.ui.label.innerText = "ACCESO TOTAL: ¡GANASTE!";
                this.playSound('gamewin');
                this.historial.ganadas++;
            } else {
                this.ui.label.innerText = "SISTEMA BLOQUEADO: PERDISTE";
                this.playSound('gameover');
                this.historial.perdidas++;
            }
            this.guardarHistorial();
            this.ui.resetBtn.style.display = "block";
        }
    }

    resetear() {
        this.playSound('click');
        this.victorias = 0;
        this.perdidas = 0;
        this.actualizarUIMarcador("ESPERANDO JUGADA...");
        this.ui.userChoice.innerHTML = "?";
        this.ui.pcChoice.innerHTML = "?";
        this.ui.battleField.classList.remove("win-border", "lose-border", "tie-border");
        this.ui.resetBtn.style.display = "none";
    }
}

// Inicializar el controlador cuando cargue el DOM
document.addEventListener('DOMContentLoaded', () => {
    window.game = new GameController();
});