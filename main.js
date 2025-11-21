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
const music = new Audio("music.mp3");
music.loop = true;
music.volume = 0.4;

let firstCard = null;
let secondCard = null;
let lock = false;
let cards = [];
let musicStarted = false;

// Générer les cartes selon le level
function generateSymbols(level) {
    let pairs = 4 + level; // augmente le nombre de paires
    let emojis = ["🍎","🍌","🍇","🍒","🍉","🍋","🥝","🍓","🫐","🍍","🥥","🍑"];

    let chosen = emojis.slice(0, pairs);
    let finalSymbols = [...chosen, ...chosen]; // duplique pour faire des paires

    return finalSymbols.sort(() => Math.random() - 0.5);
}

// Mettre à jour le score
function updateScore() {
    scoreDisplay.textContent = "Score: " + score;
}

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

            soundWin.play(); // son victoire

        }, 500);
    }
}
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
//   LANCER LE JEUX
// =====================
function startGame() {
    game.innerHTML = "";
    cards = [];

    let symbols = generateSymbols(level);
    updateLevel();

    symbols.forEach(symbol => {
        const card = document.createElement("div");
        card.classList.add("card");
        card.dataset.symbol = symbol;
        card.textContent = "?";

        card.addEventListener("click", () => {
            if (lock || card === firstCard) return;
            startMusic();

            card.classList.add("flipped");
            card.textContent = symbol;

            if (!firstCard) {
                firstCard = card;
            } else {
                secondCard = card;
                lock = true;

                setTimeout(() => {
                    if (firstCard.dataset.symbol === secondCard.dataset.symbol) {
                        score++;
                        updateScore();
                        flashEffect("flash-success");

                        firstCard.style.visibility = "hidden";
                        secondCard.style.visibility = "hidden";

                        checkWin(); // 🏆 Vérifier si gagné

                    } else {
                        flashEffect("flash-fail");

                        firstCard.classList.remove("flipped");
                        secondCard.classList.remove("flipped");
                        firstCard.textContent = "?";
                        secondCard.textContent = "?";
                    }

                    firstCard = null;
                    secondCard = null;
                    lock = false;
                }, 700);
            }
        });

        cards.push(card);
        game.appendChild(card);
    });
}

startGame();
