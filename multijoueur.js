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

// Symboles simples pour eviter les caracteres corrompus
const baseSymbols =["🍎","🍌","🍇","🍒","🍉","🍋","🥝","🍓","🫐","🍍","🥥","🍑"];

let cards = [];
let firstCard = null;
let secondCard = null;
let lock = false;
let musicStarted = false;

function updateUI() {
    if (score1Label) score1Label.textContent = "Joueur 1 : " + score1;
    if (score2Label) score2Label.textContent = "Joueur 2 : " + score2;
    if (turnLabel) turnLabel.textContent = "Tour : Joueur " + currentPlayer;
    if (levelLabel) levelLabel.textContent = "Level : " + level;
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

function generateSymbols(currentLevel) {
    const pairs = Math.min(4 + currentLevel, baseSymbols.length);
    const chosen = baseSymbols.slice(0, pairs);
    return [...chosen, ...chosen].sort(() => Math.random() - 0.5);
}

function showCardFace(card, faceUp) {
    card.textContent = faceUp ? card.dataset.symbol : "?";
}

function checkWin() {
    const remaining = cards.filter(c => c.style.visibility !== "hidden");
    if (remaining.length === 0) {
        let winner;
        if (score1 > score2) winner = "Joueur 1 gagne !";
        else if (score2 > score1) winner = "Joueur 2 gagne !";
        else winner = "Match Nul !";

        document.getElementById("win-level").textContent = "Level " + level + " termine !";
        document.getElementById("win-player").textContent = winner;
        document.getElementById("win-screen").style.display = "flex";
        soundWin.play();
    }
}

function nextPlayer() {
    currentPlayer = currentPlayer === 1 ? 2 : 1;
    updateUI();
}

function startGame() {
    game.innerHTML = "";
    score1 = 0;
    score2 = 0;
    currentPlayer = 1;

    cards = [];
    firstCard = null;
    secondCard = null;
    lock = false;

    updateUI();

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
                    soundWin.play();
                    flashEffect("flash-success");

                    if (currentPlayer === 1) score1++;
                    else score2++;

                    firstCard.style.visibility = "hidden";
                    secondCard.style.visibility = "hidden";

                    lock = false;
                    updateUI();
                    checkWin();
                } else {
                    soundFail.play();
                    flashEffect("flash-fail");

                    firstCard.classList.remove("flipped");
                    secondCard.classList.remove("flipped");
                    showCardFace(firstCard, false);
                    showCardFace(secondCard, false);

                    nextPlayer();
                    lock = false;
                }

                firstCard = null;
                secondCard = null;
            }, 600);
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
