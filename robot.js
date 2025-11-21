let level = 1;
let playerScore = 0;
let robotScore = 0;
let selectedCards = [];
let lock = false;
let musicStarted = false;

const soundFlip = new Audio("flip.mp3");
const soundWin = new Audio("win.mp3");
const soundFail = new Audio("fail.mp3");
const music = new Audio("music.mp3");
music.loop = true;
music.volume = 0.4;

const game = document.getElementById("game");
const flash = document.getElementById("flash-overlay");
const levelLabel = document.querySelector(".level");
const playerScoreLabel = document.getElementById("score");
const robotScoreLabel = document.getElementById("robot-score");
const turnIndicator = document.getElementById("turn-indicator");

let cards = [];

// Symboles simples pour éviter corruption
const baseSymbols = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N"];

function updateLevel() {
    levelLabel.textContent = "Level: " + level;
}

function updateScores() {
    playerScoreLabel.textContent = "Player Score: " + playerScore;
    robotScoreLabel.textContent = "Robot Score: " + robotScore;
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

function flashEffect(type) {
    flash.classList.remove("flash-success", "flash-fail");
    void flash.offsetWidth;
    flash.classList.add(type);
    setTimeout(() => flash.classList.remove(type), 600);
}

function showCardFace(card, up) {
    card.textContent = up ? card.dataset.symbol : "?";
}

function setTurn(turn) {
    turnIndicator.classList.remove("player-turn", "robot-turn");
    if (turn === "player") {
        turnIndicator.textContent = "Tour : Joueur";
        turnIndicator.classList.add("player-turn");
    } else {
        turnIndicator.textContent = "Tour : Robot";
        turnIndicator.classList.add("robot-turn");
    }
}

/* ==========================================================
    GÉNÉRATION SYMBOLS (TRIPLE)
========================================================== */
function generateSymbols(level) {
    const triple = 6 + level;
    const chosen = baseSymbols.slice(0, triple);
    return [...chosen, ...chosen, ...chosen].sort(() => Math.random() - 0.5);
}

/* ==========================================================
    FIN DU NIVEAU
========================================================== */
function checkWin() {
    const remaining = cards.filter(c => c.style.visibility !== "hidden");
    if (remaining.length === 0) {
        document.getElementById("win-level").textContent = "Level " + level + " Completed!";
        document.getElementById("win-who").textContent =
            playerScore > robotScore ? "Winner: PLAYER" :
            robotScore > playerScore ? "Winner: ROBOT" :
            "Match Nul !";

        document.getElementById("win-screen").style.display = "flex";
        soundWin.play();
    }
}

/* ==========================================================
    TOUR DU ROBOT — VERSION 3 CARTES
========================================================== */
function robotTurn() {
    lock = true;heckoiu
    setTurn("robot");

    setTimeout(() => {
        const visible = cards.filter(c => c.style.visibility !== "hidden");

        if (visible.length < 3) {
            lock = false;
            setTurn("player");
            return;
        }

        // Choix de 3 cartes aléatoires
        let c1 = visible.splice(Math.floor(Math.random() * visible.length), 1)[0];
        let c2 = visible.splice(Math.floor(Math.random() * visible.length), 1)[0];
        let c3 = visible[Math.floor(Math.random() * visible.length)];

        // Montrer c1 & c2
        [c1, c2, c3].forEach(c => {
            c.classList.add("flipped");
            showCardFace(c, true);
        });

        soundFlip.play();

        // Vérifier 2 premières
        setTimeout(() => {
            if (c1.dataset.symbol !== c2.dataset.symbol) {
                // ❌ Robot échoue dès les deux premières
                flashEffect("flash-fail");
                soundFail.play();

                [c1, c2, c3].forEach(c => {
                    c.classList.remove("flipped");
                    showCardFace(c, false);
                });

                lock = false;
                setTurn("player");
                return;
            }

            // Vérifier les 3
            if (c1.dataset.symbol === c3.dataset.symbol) {
                // ✔ Robot triple réussi
                robotScore++;
                updateScores();
                flashEffect("flash-success");
                soundWin.play();

                [c1, c2, c3].forEach(c => c.style.visibility = "hidden");
                lock = false;
                checkWin();
                setTurn("player");

            } else {
                // ❌ Échec final
                soundFail.play();
                flashEffect("flash-fail");

                [c1, c2, c3].forEach(c => {
                    c.classList.remove("flipped");
                    showCardFace(c, false);
                });

                lock = false;
                setTurn("player");
            }

        }, 900);

    }, 800);
}

/* ==========================================================
    LANCER LE JEU
========================================================== */
function startGame() {
    game.innerHTML = "";
    cards = [];
    selectedCards = [];
    playerScore = 0;
    robotScore = 0;
    lock = false;

    updateScores();
    updateLevel();
    setTurn("player");

    const symbols = generateSymbols(level);

    symbols.forEach(symbol => {
        const card = document.createElement("div");
        card.classList.add("card");
        card.dataset.symbol = symbol;
        showCardFace(card, false);

        card.addEventListener("click", () => {

            if (lock || card.classList.contains("flipped")) return;

            startMusic();
            soundFlip.play();

            card.classList.add("flipped");
            showCardFace(card, true);

            selectedCards.push(card);

            // -----------------------------
            // 1) Vérifier les deux premières
            // -----------------------------
            if (selectedCards.length === 2) {

                let s1 = selectedCards[0].dataset.symbol;
                let s2 = selectedCards[1].dataset.symbol;

                if (s1 !== s2) {
                    // ❌ Échec direct
                    lock = true;

                    setTimeout(() => {
                        flashEffect("flash-fail");
                        soundFail.play();

                        selectedCards.forEach(c => {
                            c.classList.remove("flipped");
                            showCardFace(c, false);
                        });

                        selectedCards = [];
                        lock = false;

                        robotTurn();
                    }, 600);
                }

                return;
            }

            // -----------------------------
            // 2) Vérifier les 3 cartes
            // -----------------------------
            if (selectedCards.length === 3) {

                lock = true;

                setTimeout(() => {

                    let s1 = selectedCards[0].dataset.symbol;
                    let s2 = selectedCards[1].dataset.symbol;
                    let s3 = selectedCards[2].dataset.symbol;

                    if (s1 === s2 && s2 === s3) {
                        // ✔ Joueur réussit triple
                        playerScore++;
                        updateScores();
                        flashEffect("flash-success");
                        soundWin.play();

                        selectedCards.forEach(c => c.style.visibility = "hidden");

                        checkWin();

                    } else {
                        // ❌ Échec joueur → robot joue
                        flashEffect("flash-fail");
                        soundFail.play();

                        selectedCards.forEach(c => {
                            c.classList.remove("flipped");
                            showCardFace(c, false);
                        });

                        robotTurn();
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

document.getElementById("next-level-btn").addEventListener("click", () => {
    document.getElementById("win-screen").style.display = "none";
    level++;
    if (level > 10) level = 1;
    startGame();
});

startGame();
