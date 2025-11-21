let level = 1;
let playerScore = 0;
let robotScore = 0;

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
let firstCard = null;
let secondCard = null;
let lock = false;
let musicStarted = false;

// Symboles simples pour eviter les caracteres corrompus
const baseSymbols = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P"];

function updateLevel() {
    if (levelLabel) levelLabel.textContent = "Level: " + level;
}

function updateScores() {
    if (playerScoreLabel) playerScoreLabel.textContent = "Player Score: " + playerScore;
    if (robotScoreLabel) robotScoreLabel.textContent = "Robot Score: " + robotScore;
}

function generateSymbols(currentLevel) {
    const pairs = Math.min(4 + currentLevel, baseSymbols.length);
    const chosen = baseSymbols.slice(0, pairs);
    return [...chosen, ...chosen].sort(() => Math.random() - 0.5);
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

function setTurn(turn) {
    if (!turnIndicator) return;
    turnIndicator.classList.remove("player-turn", "robot-turn");
    if (turn === "player") {
        turnIndicator.textContent = "Tour : Joueur";
        turnIndicator.classList.add("player-turn");
    } else {
        turnIndicator.textContent = "Tour : Robot";
        turnIndicator.classList.add("robot-turn");
    }
}

function showCardFace(card, faceUp) {
    card.textContent = faceUp ? card.dataset.symbol : "?";
}

function robotTurn() {
    lock = true;
    setTurn("robot");

    setTimeout(() => {
        const visible = cards.filter(c => c.style.visibility !== "hidden");
        if (visible.length < 2) {
            lock = false;
            setTurn("player");
            return;
        }

        const c1 = visible[Math.floor(Math.random() * visible.length)];
        let c2;
        do {
            c2 = visible[Math.floor(Math.random() * visible.length)];
        } while (c1 === c2);

        c1.classList.add("flipped");
        c2.classList.add("flipped");
        showCardFace(c1, true);
        showCardFace(c2, true);
        soundFlip.play();

        setTimeout(() => {
            if (c1.dataset.symbol === c2.dataset.symbol) {
                robotScore++;
                updateScores();
                flashEffect("flash-success");
                soundWin.play();
                c1.style.visibility = "hidden";
                c2.style.visibility = "hidden";
            } else {
                soundFail.play();
                c1.classList.remove("flipped");
                c2.classList.remove("flipped");
                showCardFace(c1, false);
                showCardFace(c2, false);
            }

            lock = false;
            checkWin();
            setTurn("player");
        }, 700);
    }, 800);
}

function checkWin() {
    const remaining = cards.filter(c => c.style.visibility !== "hidden");
    if (remaining.length === 0) {
        document.getElementById("win-level").textContent = "Level " + level + " Completed!";

        if (playerScore > robotScore) {
            document.getElementById("win-who").textContent = "Winner: PLAYER";
        } else if (robotScore > playerScore) {
            document.getElementById("win-who").textContent = "Winner: ROBOT";
        } else {
            document.getElementById("win-who").textContent = "Match Nul !";
        }

        document.getElementById("win-screen").style.display = "flex";
        soundWin.play();
    }
}

document.getElementById("next-level-btn").addEventListener("click", () => {
    document.getElementById("win-screen").style.display = "none";
    level++;
    if (level > 10) level = 1;
    startGame();
});

function startGame() {
    game.innerHTML = "";
    cards = [];
    firstCard = null;
    secondCard = null;
    lock = false;
    playerScore = 0;
    robotScore = 0;

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

            if (!firstCard) {
                firstCard = card;
                return;
            }

            secondCard = card;
            lock = true;

            setTimeout(() => {
                if (firstCard.dataset.symbol === secondCard.dataset.symbol) {
                    playerScore++;
                    updateScores();
                    flashEffect("flash-success");
                    soundWin.play();
                    firstCard.style.visibility = "hidden";
                    secondCard.style.visibility = "hidden";
                    lock = false;
                    checkWin();
                    firstCard = null;
                    secondCard = null;
                    setTurn("player");
                    return;
                }

                soundFail.play();
                flashEffect("flash-fail");
                firstCard.classList.remove("flipped");
                secondCard.classList.remove("flipped");
                showCardFace(firstCard, false);
                showCardFace(secondCard, false);

                firstCard = null;
                secondCard = null;
                robotTurn();
            }, 600);
        });

        cards.push(card);
        game.appendChild(card);
    });
}

startGame();
