let level = 1;
let score1 = 0;
let score2 = 0;
let currentPlayer = 1;

const game = document.getElementById("game");
const flash = document.getElementById("flash-overlay");
const score1Label = document.getElementById("score1");
const score2Label = document.getElementById("score2");
const turnLabel = document.getElementById("turn");
const levelLabel = document.querySelector(".level");

const soundFlip = new Audio("flip.mp3");
const soundWin = new Audio("win.mp3");
const soundFail = new Audio("fail.mp3");
const music = new Audio("music.mp3");
music.loop = true;
music.volume = 0.4;

const baseSymbols =["🍎","🍌","🍇","🍒","🍉","🍋","🥝","🍓","🫐","🍍","🥥","🍑"];

let cards = [];
let selectedCards = [];
let lock = false;
let musicStarted = false;

// =====================================
// 🟦 MISE À JOUR UI
// =====================================
function updateUI() {
    score1Label.textContent = "Joueur 1 : " + score1;
    score2Label.textContent = "Joueur 2 : " + score2;
    turnLabel.textContent = "Tour : Joueur " + currentPlayer;
    levelLabel.textContent = "Level : " + level;
}

function flashEffect(type) {
    flash.classList.remove("flash-success", "flash-fail");
    void flash.offsetWidth;
    flash.classList.add(type);
    setTimeout(() => flash.classList.remove(type), 600);
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


// =====================================
// 🟦 GÉNÉRATION DES SYMBOLES (Triple)
// =====================================
function generateSymbols(currentLevel) {
    const triple = Math.min(6 + currentLevel, baseSymbols.length);
    const chosen = baseSymbols.slice(0, triple);
    return [...chosen, ...chosen, ...chosen].sort(() => Math.random() - 0.5);
}

function showCardFace(card, faceUp) {
    card.textContent = faceUp ? card.dataset.symbol : "?";
}


// =====================================
// 🟦 VÉRIFIER FIN DU NIVEAU
// =====================================
function checkWin() {
    const remaining = cards.filter(c => c.style.visibility !== "hidden");

    if (remaining.length === 0) {
        let winner;
        if (score1 > score2) winner = "Joueur 1 gagne !";
        else if (score2 > score1) winner = "Joueur 2 gagne !";
        else winner = "Match Nul !";

        document.getElementById("win-level").textContent = "Level " + level + " terminé !";
        document.getElementById("win-player").textContent = winner;
        document.getElementById("win-screen").style.display = "flex";

        soundWin.play();
    }
}

function nextPlayer() {
    currentPlayer = currentPlayer === 1 ? 2 : 1;
    updateUI();
}


// =====================================
// 🟦 LANCER LE NIVEAU
// =====================================
function startGame() {
    game.innerHTML = "";
    score1 = 0;
    score2 = 0;
    currentPlayer = 1;

    cards = [];
    selectedCards = [];
    lock = false;

    updateUI();

    const symbols = generateSymbols(level);

    symbols.forEach(symbol => {

        const card = document.createElement("div");
        card.classList.add("card");
        card.dataset.symbol = symbol;
        showCardFace(card, false);

        // 🟩 AU CLICK
        card.addEventListener("click", () => {
            if (lock || card.classList.contains("flipped")) return;

            startMusic();
            soundFlip.play();

            card.classList.add("flipped");
            showCardFace(card, true);

            selectedCards.push(card);

            // ================================
            // 🟦 1) Vérification des DEUX premières cartes
            // ================================
            if (selectedCards.length === 2) {

                let s1 = selectedCards[0].dataset.symbol;
                let s2 = selectedCards[1].dataset.symbol;

                if (s1 !== s2) {

                    lock = true;
                    setTimeout(() => {

                        soundFail.play();
                        flashEffect("flash-fail");

                        selectedCards.forEach(c => {
                            c.classList.remove("flipped");
                            showCardFace(c, false);
                        });

                        selectedCards = [];
                        lock = false;

                        nextPlayer();

                    }, 600);
                }

                return;
            }

            // ================================
            // 🟩 2) Vérification finale des 3 cartes
            // ================================
            if (selectedCards.length === 3) {

                lock = true;

                setTimeout(() => {

                    let s1 = selectedCards[0].dataset.symbol;
                    let s2 = selectedCards[1].dataset.symbol;
                    let s3 = selectedCards[2].dataset.symbol;

                    if (s1 === s2 && s2 === s3) {

                        soundWin.play();
                        flashEffect("flash-success");

                        if (currentPlayer === 1) score1++;
                        else score2++;

                        selectedCards.forEach(c => {
                            c.style.visibility = "hidden";
                        });

                        updateUI();
                        checkWin();

                    } else {

                        soundFail.play();
                        flashEffect("flash-fail");

                        selectedCards.forEach(c => {
                            c.classList.remove("flipped");
                            showCardFace(c, false);
                        });

                        nextPlayer();
                    }

                    selectedCards = [];
                    lock = false;

                }, 600);
            }

        });

        cards.push(card);
        game.appendChild(card);
    });
}


// =====================================
// 🟦 BOUTON NEXT LEVEL
// =====================================
document.getElementById("next-level-btn").addEventListener("click", () => {

    document.getElementById("win-screen").style.display = "none";

    level++;
    if (level > 10) level = 1;

    startGame();
});

startGame();
