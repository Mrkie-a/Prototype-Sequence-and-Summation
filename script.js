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
        msg.innerText = `Wrong! It was ${currentAnswer}. Try again!`;
        msg.style.color = "#e94560";
        score = 0; 
        document.getElementById('score').innerText = score;
        setTimeout(initGame, 2000);
    }
}


// Start the first level on load
initGame();

