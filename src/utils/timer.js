let timerId = null;
let timeLeft = 0;
let isPaused = false;
let isRunning = false;


const audio = new Audio('./media/timerUp.mp3');

function createTimerModal() {
    const modal = document.createElement('div');
    modal.id = 'timerModal';
    modal.style = "display:flex; position:fixed; left:0; top:0; width:100%; height:100%; background: rgba(0, 0, 0, 0.8); align-items: center; justify-content: center;";

    const modalContent = document.createElement('div');
    modalContent.style = "background: black; color: white; padding: 20px; border-radius: 10px; display: flex; flex-direction: column; align-items: center; width: 300px;";

    const timerDisplay = document.createElement('h1');
    timerDisplay.id = 'timerDisplay';
    timerDisplay.textContent = '00:00';
    timerDisplay.style = "font-size: 48px; margin-bottom: 20px;";

    const minuteInput = document.createElement('input');
    minuteInput.type = 'number';
    minuteInput.id = 'minuteInput';
    minuteInput.min = 0;
    minuteInput.placeholder = 'Minutes';
    minuteInput.style = "width: 80%; padding: 10px; margin-bottom: 5px;";
    
    const secondInput = document.createElement('input');
    secondInput.type = 'number';
    secondInput.id = 'secondInput';
    secondInput.placeholder = 'Seconds';
    secondInput.style = "width: 80%; padding: 10px; margin-bottom: 10px;";

    // Event listener for second input to handle real-time adjustments
    secondInput.addEventListener('input', () => {
        let seconds = parseInt(secondInput.value);
        if (seconds < 0) {
            secondInput.value = 59; // Wrap to 59 if user tries to go below 0
        } else if (seconds > 59) {
            secondInput.value = 0; // Wrap to 0 if user tries to go above 59
        }
    });

    const toggleButton = document.createElement('button');
    toggleButton.textContent = 'Start';
    toggleButton.id = 'toggleButton';
    toggleButton.onclick = toggleTimer;

    const resetButton = document.createElement('button');
    resetButton.textContent = 'Reset';
    resetButton.onclick = resetTimer;
    resetButton.style = "margin-top: 10px;";

    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.onclick = () => modal.style.display = 'none';
    closeButton.style = "position: absolute; top: 10px; right: 20px; color: white; background: red; border: none; font-size: 16px; padding: 10px 15px; cursor: pointer; border-radius: 5px;";

    modalContent.appendChild(timerDisplay);
    modalContent.appendChild(minuteInput);
    modalContent.appendChild(secondInput);
    modalContent.appendChild(toggleButton);
    modalContent.appendChild(resetButton);
    modalContent.appendChild(closeButton);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    return modal;
}


function toggleTimer() {
    const minutes = parseInt(document.getElementById('minuteInput').value) || 0;
    const seconds = parseInt(document.getElementById('secondInput').value) || 0;
    if (!isRunning) {
        startTimer(minutes, seconds);
    } else if (!isPaused) {
        pauseTimer();
    } else {
        continueTimer();
    }
}

function startTimer(minutes, seconds) {
    timeLeft = minutes * 60 + seconds;
    if (timeLeft <= 0) return;
    document.getElementById('minuteInput').style.display = 'none'; 
    document.getElementById('secondInput').style.display = 'none'; 
    timerId = setInterval(updateTimer, 1000);
    isRunning = true;
    isPaused = false;
    document.getElementById('toggleButton').textContent = 'Pause';
}

function pauseTimer() {
    clearInterval(timerId);
    isPaused = true;
    document.getElementById('toggleButton').textContent = 'Continue';
}

function continueTimer() {
    timerId = setInterval(updateTimer, 1000);
    isPaused = false;
    document.getElementById('toggleButton').textContent = 'Pause';
}

function resetTimer() {
    clearInterval(timerId);
    timeLeft = 0;
    isRunning = false;
    isPaused = false;
    document.getElementById('timerDisplay').textContent = '00:00';
    document.getElementById('minuteInput').style.display = 'block'; 
    document.getElementById('secondInput').style.display = 'block'; 
    document.getElementById('toggleButton').textContent = 'Start';
}

function updateTimer() {
    if (timeLeft <= 0) {
        clearInterval(timerId);
        audio.play(); 
        setTimeout(function() {
            alert('Time is up!');
            resetTimer();
        }, 100); // Delay alert to allow sound to start
        return;
    }
    timeLeft -= 1;
    displayTime();
}

function displayTime() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    document.getElementById('timerDisplay').textContent = `${pad(minutes)}:${pad(seconds)}`;
}

function pad(num) {
    return num.toString().padStart(2, '0');
}

document.addEventListener('DOMContentLoaded', function() {
    const modal = createTimerModal();
    modal.style.display = 'none'; 
});

module.exports = createTimerModal;
