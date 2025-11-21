// Niveau actuel
let level = 1;
let score = 0;

// Mise à jour affichage niveau
function updateLevel() {
    document.querySelector(".level").textContent = "Level: " + level;
}

updateLevel();

const game = document.getElementById("game");
const scoreDisplay = document.getElementById("score");
const flash = document.getElementById("flash-overlay");

// 🎵 musique de fond
const music = new Audio("music.mp3");
music.loop = true;
music.volume = 0.4;

let musicStarted = false;

// Liste des cartes sélectionnées (3 cartes)
let selectedCards = [];
let lock = false;
let cards = [];

// Générer les cartes selon le level
function generateSymbols(level) {
    let triple = 6 + level; // augmente les symboles en fonction du niveau
    let emojis = ["🍎","🍌","🍇","🍒","🍉","🍋","🥝","🍓","🫐","🍍","🥥","🍑"];

    let chosen = emojis.slice(0, triple);
    let finalSymbols = [...chosen, ...chosen, ...chosen]; // 3 exemplaires

    return finalSymbols.sort(() => Math.random() - 0.5);
}

// Mettre à jour le score
function updateScore() {
    scoreDisplay.textContent = "Score: " + score;
}

// Lancer la musique au premier clic
function startMusic() {
    if (musicStarted) return;

    music.play().then(() => {
        musicStarted = true;
    }).catch(() => {
        const resume = () => {
            music.play().catch(() => {});
            musicStarted = true;
            document.removeEventListener("click", resume);
            document.removeEventListener("touchstart", resume);
        };
        document.addEventListener("click", resume);
        document.addEventListener("touchstart", resume);
    });
}

// Flash feedback
function flashEffect(type) {
    flash.classList.add(type);

    setTimeout(() => {
        flash.classList.remove(type);
    }, 600);
}

// =====================
//   FIN DU JEU
// =====================
function checkWin() {
    const remaining = cards.filter(c => c.style.visibility !== "hidden");

    if (remaining.length === 0) {
        setTimeout(() => {
            document.getElementById("win-level").textContent =
                "Level " + level + " Completed !";

            document.getElementById("win-screen").style.display = "flex";
        }, 500);
    }
}

// Bouton "Next level"
document.getElementById("next-level-btn").addEventListener("click", () => {

    document.getElementById("win-screen").style.display = "none";

    level++;
    if (level > 10) {
        alert("🔥 All levels completed ! Resetting...");
        level = 1;
    }

    startGame();
});

// =====================
//   LANCER LE JEU
// =====================
function startGame() {
    game.innerHTML = "";
    cards = [];
    selectedCards = [];

    let symbols = generateSymbols(level);
    updateLevel();

    symbols.forEach(symbol => {
        const card = document.createElement("div");
        card.classList.add("card");
        card.dataset.symbol = symbol;
        card.textContent = "?";

        card.addEventListener("click", () => {
            if (lock || card.classList.contains("flipped")) return;

            startMusic();

            card.classList.add("flipped");
            card.textContent = symbol;

            selectedCards.push(card);

            // ---------------------------
            // 🟦 1) Vérifier les 2 premières cartes
            // ---------------------------
            if (selectedCards.length === 2) {

                let s1 = selectedCards[0].dataset.symbol;
                let s2 = selectedCards[1].dataset.symbol;

                if (s1 !== s2) {
                    // ❌ Pas pareilles → on retourne immédiatement
                    lock = true;

                    setTimeout(() => {
                        flashEffect("flash-fail");

                        selectedCards.forEach(c => {
                            c.classList.remove("flipped");
                            c.textContent = "?";
                        });

                        selectedCards = [];
                        lock = false;

                    }, 700);
                }

                return; // On attend la 3ᵉ carte
            }

            // ---------------------------
            // 🟩 2) Vérification finale : 3 cartes
            // ---------------------------
            if (selectedCards.length === 3) {

                lock = true;

                setTimeout(() => {

                    let s1 = selectedCards[0].dataset.symbol;
                    let s2 = selectedCards[1].dataset.symbol;
                    let s3 = selectedCards[2].dataset.symbol;

                    // ✔ Toutes les 3 identiques
                    if (s1 === s2 && s2 === s3) {

                        score++;
                        updateScore();
                        flashEffect("flash-success");

                        selectedCards.forEach(c => {
                            c.style.visibility = "hidden";
                        });

                        checkWin();

                    } else {

                        // ❌ La 3eme ne correspond pas
                        flashEffect("flash-fail");

                        selectedCards.forEach(c => {
                            c.classList.remove("flipped");
                            c.textContent = "?";
                        });
                    }

                    selectedCards = [];
                    lock = false;

                }, 700);
            }

        });

        cards.push(card);
        game.appendChild(card);
    });
}


startGame();
