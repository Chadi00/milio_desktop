let chronometerId = null;
let elapsedSeconds = 0;
let isChronometerPaused = false;
let isChronometerRunning = false;

function createChronometerModal() {
    const modal = document.createElement('div');
    modal.id = 'chronometerModal';
    modal.style = "display:flex; position:fixed; left:0; top:0; width:100%; height:100%; background: rgba(0, 0, 0, 0.8); align-items: center; justify-content: center;";

    const modalContent = document.createElement('div');
    modalContent.style = "background: black; color: white; padding: 20px; border-radius: 10px; display: flex; flex-direction: column; align-items: center; width: 300px;";

    const chronometerDisplay = document.createElement('h1');
    chronometerDisplay.id = 'chronometerDisplay';
    chronometerDisplay.textContent = '00:00';
    chronometerDisplay.style = "font-size: 48px; margin-bottom: 20px;";

    const toggleButton = document.createElement('button');
    toggleButton.textContent = 'Pause';  
    toggleButton.id = 'toggleButton';
    toggleButton.onclick = toggleChronometer;

    const resetButton = document.createElement('button');
    resetButton.textContent = 'Reset';
    resetButton.onclick = resetChronometer;
    resetButton.style = "margin-top: 10px;";

    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.onclick = () => modal.style.display = 'none';
    closeButton.style = "position: absolute; top: 10px; right: 20px; color: white; background: red; border: none; font-size: 16px; padding: 10px 15px; cursor: pointer; border-radius: 5px;";

    modalContent.appendChild(chronometerDisplay);
    modalContent.appendChild(toggleButton);
    modalContent.appendChild(resetButton);
    modalContent.appendChild(closeButton);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    startChronometer();

    return modal;
}

function toggleChronometer() {
    if (!isChronometerRunning || isChronometerPaused) {
        continueChronometer();
    } else {
        pauseChronometer();
    }
}

function startChronometer() {
    chronometerId = setInterval(updateChronometer, 1000);
    isChronometerRunning = true;
    isChronometerPaused = false;
    document.getElementById('toggleButton').textContent = 'Pause';
}

function pauseChronometer() {
    clearInterval(chronometerId);
    isChronometerPaused = true;
    document.getElementById('toggleButton').textContent = 'Continue';
}

function continueChronometer() {
    if (!isChronometerRunning || isChronometerPaused) {
        chronometerId = setInterval(updateChronometer, 1000);
        isChronometerPaused = false;
        isChronometerRunning = true;
        document.getElementById('toggleButton').textContent = 'Pause';
    }
}

function resetChronometer() {
    clearInterval(chronometerId);
    elapsedSeconds = 0;
    isChronometerRunning = false;
    isChronometerPaused = false;
    document.getElementById('chronometerDisplay').textContent = '00:00';
    document.getElementById('toggleButton').textContent = 'Start';
}

function updateChronometer() {
    elapsedSeconds += 1;
    displayTime();
}

function displayTime() {
    const minutes = Math.floor(elapsedSeconds / 60);
    const seconds = elapsedSeconds % 60;
    document.getElementById('chronometerDisplay').textContent = `${pad(minutes)}:${pad(seconds)}`;
}

function pad(num) {
    return num.toString().padStart(2, '0');
}

document.addEventListener('DOMContentLoaded', function() {
    const modal = createChronometerModal();
    modal.style.display = 'none'; 
});

module.exports = createChronometerModal;
