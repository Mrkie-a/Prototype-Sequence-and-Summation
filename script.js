let currentAnswer;
let score = 0;

function initGame() {
    const container = document.getElementById('sequence-container');
    container.innerHTML = ''; // Clear old numbers
    document.getElementById('guess').value = '';
    
    // 1. Choose a random pattern type
    const types = ['linear', 'square', 'double'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    let sequence = [];
    let start = Math.floor(Math.random() * 10) + 1;
    let step = Math.floor(Math.random() * 5) + 2;

    // 2. Build the array based on the type
    for (let i = 0; i < 5; i++) {
        if (type === 'linear') sequence.push(start + (i * step));
        if (type === 'square') sequence.push(Math.pow(i + start, 2));
        if (type === 'double') sequence.push(start * Math.pow(2, i));
    }

    // 3. Hide a random number
    const hideIdx = Math.floor(Math.random() * 5);
    currentAnswer = sequence[hideIdx];

    // 4. Create the HTML boxes
    sequence.forEach((num, idx) => {
        const div = document.createElement('div');
        div.className = 'num-box';
        div.innerText = (idx === hideIdx) ? '?' : num;
        container.appendChild(div);
    });
}

function checkAnswer() {
    let inputField = document.getElementById('guess');
    let msg = document.getElementById('message');
    
    // 1. Get the value as a string first to check for emptiness
    let rawValue = inputField.value.trim();
    
    // 2. The Validation Gatekeeper
    if (rawValue === "" || isNaN(rawValue)) {
        msg.innerText = "⚠️ Please enter a number!";
        msg.style.color = "#ffcc00"; // Warning yellow
        return; // Stop the function here! Don't reset the score.
    }

    // 3. Now convert to an actual number for comparison
    let userGuess = parseInt(rawValue);

    if (userGuess === currentAnswer) {
        score++;
        document.getElementById('score').innerText = score;
        msg.innerText = "Correct! Next one...";
        msg.style.color = "#4ee44e";
        setTimeout(initGame, 1000);
    } else {
        // GAME OVER flow: show modal to capture player's name for leaderboard
        msg.innerText = `Wrong! It was ${currentAnswer}. Game over!`;
        msg.style.color = "#e94560";
        // display final score in gameover modal and show it
        const finalScoreEl = document.getElementById('final-score');
        if (finalScoreEl) finalScoreEl.innerText = score;
        showGameoverModal();
    }
}

initGame();

// Theme toggle: default is light (colorful). Add night-mode toggle and persistence.
(function() {
    const toggle = document.getElementById('theme-toggle');
    if (!toggle) return;

    function applyTheme(theme) {
        if (theme === 'dark') document.body.classList.add('dark');
        else document.body.classList.remove('dark');
        toggle.setAttribute('aria-pressed', String(theme === 'dark'));
    }

    // Load saved preference (if any). Default is 'light' (colorful).
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') applyTheme('dark');

    toggle.addEventListener('click', () => {
        const isDark = document.body.classList.contains('dark');
        const next = isDark ? 'light' : 'dark';
        applyTheme(next);
        localStorage.setItem('theme', next);
    });

    // Keyboard support: toggle on Enter/Space
    toggle.addEventListener('keyup', (e) => {
        if (e.key === 'Enter' || e.key === ' ') toggle.click();
    });
})();

/* --- Leaderboard & Gameover modal logic --- */
const LEADERBOARD_KEY = 'seq_leaderboard_v1';
let _submittedThisGame = false;

function loadLeaderboard() {
    try {
        return JSON.parse(localStorage.getItem(LEADERBOARD_KEY) || '[]');
    } catch (e) { return []; }
}

function saveLeaderboardEntry(name, score) {
    const list = loadLeaderboard();
    list.push({ name: String(name).slice(0,20), score: Number(score) || 0, t: Date.now() });
    list.sort((a,b) => (b.score - a.score) || (a.t - b.t));
    if (list.length > 10) list.splice(10);
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(list));
}

function renderLeaderboard() {
    const ol = document.getElementById('leaderboard-list');
    if (!ol) return;
    const list = loadLeaderboard();
    ol.innerHTML = '';
    if (list.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'No scores yet. Be the first!';
        ol.appendChild(li);
        return;
    }
    list.forEach((entry, idx) => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${idx+1}. ${escapeHtml(entry.name)}</span><strong>${entry.score}</strong>`;
        ol.appendChild(li);
    });
}

function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"})[c]); }

function showLeaderboardModal(){
    const m = document.getElementById('leaderboard-modal');
    if (!m) return;
    renderLeaderboard();
    m.setAttribute('aria-hidden','false');
}
function hideLeaderboardModal(){
    const m = document.getElementById('leaderboard-modal');
    if (!m) return;
    m.setAttribute('aria-hidden','true');
}

function showGameoverModal(){
    _submittedThisGame = false;
    const m = document.getElementById('gameover-modal');
    const nameInput = document.getElementById('player-name');
    const submitBtn = document.getElementById('submit-score');
    if (!m || !nameInput || !submitBtn) {
        // fallback: just reset
        score = 0; document.getElementById('score').innerText = score; initGame();
        return;
    }
    m.setAttribute('aria-hidden','false');
    nameInput.value = '';
    submitBtn.disabled = true;
    nameInput.focus();
    // disable guess input while modal is active
    const guessInput = document.getElementById('guess'); if (guessInput) guessInput.disabled = true;
}

function hideGameoverModal(){
    const m = document.getElementById('gameover-modal');
    if (!m) return;
    m.setAttribute('aria-hidden','true');
    const guessInput = document.getElementById('guess'); if (guessInput) guessInput.disabled = false;
}

// wire up modal controls
(function(){
    const lbBtn = document.getElementById('leaderboard-btn');
    const lbClose = document.getElementById('close-leaderboard');
    const nameInput = document.getElementById('player-name');
    const submitBtn = document.getElementById('submit-score');
    const gameoverModal = document.getElementById('gameover-modal');

    if (lbBtn) lbBtn.addEventListener('click', showLeaderboardModal);
    if (lbClose) lbClose.addEventListener('click', hideLeaderboardModal);

    if (nameInput) {
        nameInput.addEventListener('input', () => {
            if (submitBtn) submitBtn.disabled = nameInput.value.trim().length === 0 || _submittedThisGame;
        });
        nameInput.addEventListener('keyup', (e)=>{ if (e.key === 'Enter' && !submitBtn.disabled) submitBtn.click(); });
    }

    if (submitBtn) {
        submitBtn.addEventListener('click', () => {
            if (_submittedThisGame) return;
            const nm = (nameInput && nameInput.value.trim()) || '';
            if (!nm) return;
            const finalScore = Number(document.getElementById('final-score')?.innerText || 0);
            saveLeaderboardEntry(nm, finalScore);
            _submittedThisGame = true;
            submitBtn.disabled = true;
            hideGameoverModal();
            // reset and start again
            score = 0; document.getElementById('score').innerText = score;
            initGame();
        });
    }

    // close leaderboard by clicking backdrop
    const lbModal = document.getElementById('leaderboard-modal');
    if (lbModal) lbModal.addEventListener('click', (e)=>{ if (e.target === lbModal) hideLeaderboardModal(); });
})();

