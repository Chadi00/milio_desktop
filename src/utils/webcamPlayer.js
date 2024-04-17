const { ipcRenderer, dialog } = require('electron');
const { writeFile } = require('fs');


const style = document.createElement('style');
style.textContent = `
    #webcamModal {
        display: flex;
        position: fixed;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        align-items: center;
        justify-content: center;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 1000;
        animation: fadeIn 0.3s;
    }
    .modal-content {
        position: relative;
        width: 60%;
        height: 80%;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.5);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        padding: 0;
        overflow: hidden;
    }
    #webcamVideo {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    .control-buttons {
        position: absolute;
        bottom: 10px;
        display: flex;
        justify-content: center;
        width: auto;
    }
    .icon-button {
        color: white;
        border: none;
        background: none;
        padding: 10px;
        cursor: pointer;
        font-size: 24px;
        display: flex;
        justify-content: center;
        align-items: center;
        transition: background-color 0.3s;
    }
    .recording {
        border: 2px solid red;
    }
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    @keyframes flash {
        from { background-color: rgba(255, 255, 255, 0.75); }
        to { background-color: transparent; }
    }    
`;
document.head.appendChild(style);




function createWebcamModal() {
    const modal = document.createElement('div');
    modal.id = 'webcamModal';
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';

    const videoElement = document.createElement('video');
    videoElement.id = 'webcamVideo';
    videoElement.autoplay = true;

    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'control-buttons';

    const pictureButton = document.createElement('button');
    pictureButton.innerHTML = '📸'; // Use a suitable icon here
    pictureButton.className = 'icon-button';
    pictureButton.onclick = () => takePicture(modalContent);

    const recordButton = document.createElement('button');
    recordButton.innerHTML = '⏺️'; // Use a suitable icon here
    recordButton.className = 'icon-button';
    recordButton.onclick = () => toggleRecording(videoElement, recordButton);

    buttonsContainer.appendChild(pictureButton);
    buttonsContainer.appendChild(recordButton);
    modalContent.appendChild(videoElement);
    modalContent.appendChild(buttonsContainer);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    setupWebcam(videoElement);

    modal.onclick = function(event) {
        if (event.target === modal) {
            stopWebcam(videoElement);
            modal.style.display = 'none';
            modalContent.classList.remove('recording');
        }
    };
}

let mediaRecorder;
const recordedChunks = [];

function toggleRecording(videoElement, button) {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
        videoElement.parentNode.classList.remove('recording');
        button.innerHTML = '⏺️'; // Change icon if needed
    } else {
        const options = { mimeType: 'video/webm; codecs=vp9' };
        mediaRecorder = new MediaRecorder(videoElement.srcObject, options);
        mediaRecorder.ondataavailable = handleDataAvailable;
        mediaRecorder.onstop = handleStop;
        mediaRecorder.start();
        videoElement.parentNode.classList.add('recording');
        button.innerHTML = '⏹️'; // Change icon if needed
    }
}


function stopWebcam(videoElement) {
    const stream = videoElement.srcObject;
    const tracks = stream.getTracks();

    tracks.forEach(function(track) {
        track.stop();
    });

    videoElement.srcObject = null;
}


async function setupWebcam(videoElement) {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoElement.srcObject = stream;
    } catch (error) {
        console.error('Error accessing the webcam', error);
    }
}

function takePicture(modalContent) {
    // Ensure the animation is reset if quickly taking another picture
    modalContent.style.animation = 'none'; // Reset animation to ensure it can retrigger
    setTimeout(() => {
        modalContent.style.animation = 'flash 0.5s';
    }, 10); // Delay the flash slightly to reset the animation
    
    const video = document.getElementById('webcamVideo');
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(async blob => {
        const arrayBuffer = await blob.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const options = {
            defaultPath: `${require('os').homedir()}/Desktop/photo.png`
        };
        ipcRenderer.invoke('show-save-dialog', options).then(file => {
            if (!file.canceled) {
                const fs = require('fs');
                fs.writeFile(file.filePath, buffer, err => {
                    if (err) alert('Error saving the picture');
                    else alert('Picture saved');
                });
            }
        });
    }, 'image/png');
}



function handleDataAvailable(event) {
    if (event.data.size > 0) {
        recordedChunks.push(event.data);
    }
}

async function handleStop() {
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const buffer = Buffer.from(await blob.arrayBuffer());
    
    ipcRenderer.invoke('show-save-dialog', {
        defaultPath: `${require('os').homedir()}/Desktop/video.webm`
    }).then(file => {
        if (!file.canceled) {
            const fs = require('fs');
            fs.writeFile(file.filePath, buffer, err => {
                if (err) alert('Error saving the video');
                else alert('Video saved');
            });
        }
    }).catch(error => {
        console.error('Failed to save file:', error);
    });
}

module.exports = { createWebcamModal };
