const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const screenshot = require('screenshot-desktop');
const createTimerModal = require("../utils/timer");
const createChronometerModal = require('../utils/chrono');

async function softwareScript(message) {
    if (message.length < 2) {
        console.log("Message too short.");
        return "Message too short.";
    }

    const actionCode = message.substring(0, 2);
    let res = '-';

    switch (actionCode) {
        case '01':
            console.log("Action 01: Open application.");
            if (message.substring(2) === '0') {
                res = 'Sorry, I was not able to understand which application you want to open. Make sure that the request is complete and that the application name is emphasized.';
            } else {
                try {
                    const wasOpened = await openApplication(message.substring(2));
                    res = wasOpened ? '🚀 Opened **' + message.substring(2) + '**': 'Failed to open the application **'+ message.substring(2)  +'**. Ensure it is available on your computer.';
                } catch (error) {
                    console.error(`Error: ${error}`);
                    res = 'Encountered an error trying to open the application. *Ensure it is available on your computer*.';
                }
            }
            break;
        case '02':
            console.log("Action 02: Close application.");
            if (message.substring(2) === '0') {
                res = 'Sorry, I was not able to understand which application you want to close. Make sure that the request is complete and that the application name is emphasized.';
            } else {
                try {
                    const wasClosed = await closeApplication(message.substring(2));
                    res = wasClosed ? '❌ Closed **' + message.substring(2) + '**' : 'Failed to close the application **'+ message.substring(2)  +'**. Ensure it is the right name and is running on your computer.';
                } catch (error) {
                    console.error(`Error: ${error}`);
                    res = 'Encountered an error trying to close the application. *Ensure it is the right name and is running on your computer.*.';
                }
            }
            break;
        case '03':
            console.log("Action 03: Open file.");
            if (message.substring(2) === '0') {
                res = 'Sorry, I was not able to understand which file you want to open. Make sure that the request is complete and that the file name and the type is emphasized.';
            } else {
                try {
                    const correctedFileName = message.substring(2).replace('|', '.');
                    const fileOpened = await openFile(correctedFileName);
                    res = fileOpened ? '📄 Opened file on your desktop : **' + correctedFileName + '**': 'Failed to open the file. Ensure it is the **right name : ' + correctedFileName + '** and is **located on your desktop**.';
                } catch (error) {
                    console.error(`Error: ${error}`);
                    res = 'Encountered an error trying to open the file. Ensure it is the **right name : ' + correctedFileName + '** and is **located on your desktop**.';
                }
            }
            break;
        case '04':
            console.log("Action 04: Close file.");
            res = "Sorry, I'm not able to close a file for you since it is managed by another application."
            break;
        case '05':
            console.log("Action 05: Create file.");
            if (message.substring(2) === '0') {
                res = 'Sorry, I was not able to understand which file you want to create. *Make sure that the request is complete and that the file name and the type is emphasized*.';
            } else {
                try {
                    const correctedFileName = message.substring(2).replace('|', '.');
                    const fileCreated = await createFile(correctedFileName, "Hello");
                    res = fileCreated ? '🆕📄 Created file on your desktop : **' + correctedFileName + '**' : 'Failed to create the file.';
                } catch (error) {
                    console.error(`Error: ${error}`);
                    res = 'Encountered an error trying to create the file.';
                }
            }
            break;
        case '06':
            console.log("Action 06: Rename file.");
            if (message.substring(2) === '0') {
                res = 'Sorry, I was not able to understand which file you want to rename. *Make sure that the request is complete and that the file name, the type and the new name are emphasized*.';
            } else {
                try {
                    const fileRenamed = await renameFile(message.substring(2));
                    res = fileRenamed ? '✏️📄 Renamed file on your desktop.' : 'Failed to rename the file.';
                } catch (error) {
                    console.error(`Error: ${error}`);
                    res = 'Encountered an error trying to rename the file. *Make sure that the request is complete and that the file name, the type and the new name are emphasized./n example : rename old.pdf to new *';
                }
            }
            break;
        case '07':
            console.log("Action 07: Delete file.");
            if (message.substring(2) === '0') {
                res = 'Sorry, I was not able to understand which file you want to delete. *Make sure that the request is complete and that the file name and the type are emphasized*.';
            } else {
                try {
                    const correctedFileName = message.substring(2).replace('|', '.');
                    const fileDeleted = await deleteFile(correctedFileName);
                    res = fileDeleted ? '🗑️📄 Deleted file on your desktop : **' + correctedFileName + "**" : 'Failed to delete the file on your desktop, *Make sure a file named **' + correctedFileName + '** is in your desktop*.';
                } catch (error) {
                    console.error(`Error: ${error}`);
                    res = 'Encountered an error trying to delete the file. *Make sure a file named **' + correctedFileName + '** is in your desktop*.';
                }
            }
            break;
        case '08':
            console.log("Action 08: Create folder");
            if (message.substring(2) === '0') {
                res = 'Sorry, I was not able to understand what folder you want to create. *Make sure that the request is complete and that the folder name is emphasized*.';
            } else {
                try {
                    const folderCreated = await createFolder(message.substring(2));
                    res = folderCreated ? '🆕📁 Created folder on your desktop : **' + message.substring(2) + "**" : 'Failed to create the folder on your desktop, *Make sure that the request is complete and that the folder name is emphasized*.';
                } catch (error) {
                    console.error(`Error: ${error}`);
                    res = 'Encountered an error trying to create the folder. *Make sure that the request is complete and that the folder name is emphasized*.';
                }
            }
            break;
        case '09':
            console.log("Action 09: Rename folder");
            if (message.substring(2) === '0') {
                res = 'Sorry, I was not able to understand what folder you want to rename. *Make sure that the request is complete and that the folder old name and new name are emphasized*.';
            } else {
                try {
                    const folderRenamed = await renameFolder(message.substring(2));
                    res = folderRenamed ? '✏️📁 Renamed folder on your desktop **' : 'Failed to rename the folder on your desktop, *Make sure that the folder is located on the desktop and that the new name is emphasized*.';
                } catch (error) {
                    console.error(`Error: ${error}`);
                    res = 'Encountered an error trying to rename the folder. *Make sure that the folder is located on the desktop and that the new name is emphasized*';
                }
            }
            break;
        case '10':
            console.log("Action 10: Delete folder");
            if (message.substring(2) === '0') {
                res = 'Sorry, I was not able to understand what folder you want to delete. *Make sure that the request is comprehensive and that the folder name is emphasized*.';
            } else {
                try {
                    const folderDeleted = await deleteFolder(message.substring(2));
                    res = folderDeleted ? '🗑️📁 Deleted folder on your desktop **' : 'Failed to delete the folder on your desktop, *Make sure that the folder is located on the desktop*.';
                } catch (error) {
                    console.error(`Error: ${error}`);
                    res = 'Encountered an error trying to delete the folder. *Make sure that the folder is located on the desktop and there is no typo in your request*';
                }
            }
            break;
        case '11':
            console.log("Action 11: Take a screenshot");
            try {
                const tookScreenshot = await takeScreenshotAndSave();
                res = tookScreenshot ? '📸 The screenshot is save on your desktop **' : 'Failed to take the screenshot and save it on your desktop.';
            } catch (error) {
                console.error(`Error: ${error}`);
                res = 'Encountered an error trying to take the screenshot and save it on your desktop.';
            }
            break;
        case '12':
            console.log("Action 12: Play music on apple music on MacOS");
            try {
                const playMusic = await playMusicInApp(message.substring(2));
                res = playMusic ? '▶️🎵 Music Playing ' : 'Failed to play music on apple music.';
            } catch (error) {
                console.error(`Error: ${error}`);
                res = 'Encountered an error trying to play music on apple music.';
            }
            break;
        case '13':
            console.log("Action 13: Pause music on apple music on MacOS");
            try {
                const pausedMusic = await pauseMusic();
                res = pausedMusic ? '⏸️🎵 Music Paused ' : 'Failed to pause music on apple music.';
            } catch (error) {
                console.error(`Error: ${error}`);
                res = 'Encountered an error trying to pause music on apple music.';
            }
            break;
        case '14':
            console.log("Action 14: Open url");
            if (message.substring(2) === '0') {
                res = 'Sorry, I was not able to understand what url you want to open. *Make sure that the request is comprehensive and that the url is emphasized*. Example : open youtube.com';
            } else {
                try {
                    const urlOpened = await openURL(message.substring(2));
                    res = urlOpened ? '🔗 Opened url on your default browser **' : 'Failed to open the url on your browser, *Make sure that the request is comprehensive and that the url is emphasized*. Example : open youtube.com*';
                } catch (error) {
                    console.error(`Error: ${error}`);
                    res = 'Encountered an error trying to open the url. *Make sure that the request is comprehensive and that the url is emphasized*. Example : open youtube.com*';
                }
            }
            break;
        case '16':
            console.log("Action 16: Read PDF");
            res = message.substring(2);
            break;
        case '17':
            console.log("Action 17: Timer");
            res = "⏳ Opened timer";
            createTimerModal();
            break;
        case '18':
            console.log("Action 18: Chrono");
            res = "⏱️ Opened chronometer";
            createChronometerModal();
            break;
        default:
            console.log("Default case: No specific action found for this code.");
            res = "No specific action found for this code.";
    }

    return res;
}


function execPromise(command) {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error || stderr) {
                resolve(false); 
            } else {
                resolve(true);
            }
        });
    });
}

function adjustAppNameForMacOS(appName) {
    return [appName[0].toUpperCase() + appName.slice(1), appName[0].toLowerCase() + appName.slice(1)];
}

async function openApplication(appName) {
    const platform = process.platform;

    let commands = [];
    if (platform === "win32") {
        commands.push(`start "" "${appName}://"`);
    } else if (platform === "darwin") {
        adjustAppNameForMacOS(appName).forEach(name => commands.push(`open -a "${name}"`));
    } else if (platform === "linux") {
        commands.push(`xdg-open ${appName}`);
    } else {
        console.error('Unsupported platform');
        return Promise.reject(new Error('Unsupported platform'));
    }

    for (let command of commands) {
        if (await execPromise(command)) {
            return true;
        }
    }

    console.error(`Could not open the application: ${appName}`);
    return false; 
}

async function closeApplication(appName) {
    const platform = process.platform;

    let commands = [];
    if (platform === "win32") {
        commands.push(`taskkill /IM "${appName}.exe" /F`);
    } else if (platform === "darwin") {
        adjustAppNameForMacOS(appName).forEach(name => commands.push(`pkill -x "${name}"`));
    } else if (platform === "linux") {
        commands.push(`pkill -x "${appName}"`);
    } else {
        console.error('Unsupported platform');
        return Promise.reject(new Error('Unsupported platform'));
    }

    for (let command of commands) {
        if (await execPromise(command)) {
            return true; 
        }
    }

    console.error(`Could not close the application: ${appName}`);
    return false; 
}


function openFile(fileName) {
    return new Promise((resolve, reject) => {

        const desktopPath = path.join(require('os').homedir(), 'Desktop'); 
        const filePath = path.join(desktopPath, fileName); 

        const platform = process.platform;
        let command;

        if (platform === "win32") { // Windows
            command = `start "" "${filePath}"`;
        } else if (platform === "darwin") { // macOS
            command = `open "${filePath}"`;
        } else if (platform === "linux") { // Linux
            command = `xdg-open "${filePath}"`;
        } else {
            console.error('Unsupported platform');
            reject(new Error('Unsupported platform'));
            return;
        }

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Could not open the file: ${error}`);
                resolve(false); 
                return;
            }
            if (stderr) {
                console.error(`Error: ${stderr}`);
                resolve(false);
                return;
            }
            resolve(true);
        });
    });
}

function createFile(fileName, content = '') {
    return new Promise(async (resolve, reject) => {
        
        const desktopPath = path.join(require('os').homedir(), 'Desktop'); 
        const filePath = path.join(desktopPath, fileName); 

        try {
            await fs.writeFile(filePath, content);
            console.log(`File ${fileName} has been created on the desktop.`);
            resolve(true);
        } catch (error) {
            console.error(`Error creating the file: ${error}`);
            reject(error); 
        }
    });
}



function renameFile(formattedFileName) {
    return new Promise(async (resolve, reject) => {
        const parts = formattedFileName.split('|');
        if (parts.length < 3) {
            return reject(new Error("Formatted file name does not contain enough parts."));
        }
        const oldFileName = parts[0];
        const extension = parts[1];
        const newFileName = parts.slice(2).join('|');

        const correctedOldFileName = `${oldFileName}.${extension}`;
        const correctedNewFileName = `${newFileName}.${extension}`;

        const desktopPath = path.join(require('os').homedir(), 'Desktop'); // Path to the user's Desktop
        const currentFilePath = path.join(desktopPath, correctedOldFileName); // Full path to the current file on the Desktop
        const newFilePath = path.join(desktopPath, correctedNewFileName); // Full path for the new file name on the Desktop

        try {
            await fs.rename(currentFilePath, newFilePath);
            console.log(`File has been renamed from ${correctedOldFileName} to ${correctedNewFileName}.`);
            resolve(true);
        } catch (error) {
            console.error(`Error renaming the file: ${error}`);
            reject(error);
        }
    });
}


function deleteFile(fileName) {
    return new Promise(async (resolve, reject) => {
       
        const desktopPath = path.join(require('os').homedir(), 'Desktop'); // Path to the user's Desktop
        const filePath = path.join(desktopPath, fileName); // Full path to the file on the Desktop

        try {
            await fs.unlink(filePath);
            console.log(`File ${fileName} has been deleted.`);
            resolve(true);
        } catch (error) {
            console.error(`Error deleting the file: ${error}`);
            resolve(false); 
        }
    });
}

function createFolder(folderName) {
    return new Promise(async (resolve, reject) => {
        const desktopPath = path.join(require('os').homedir(), 'Desktop'); // Path to the user's Desktop
        const folderPath = path.join(desktopPath, folderName); // Full path to the new folder on the Desktop

        try {
            await fs.mkdir(folderPath, { recursive: true });
            console.log(`Folder ${folderName} has been created on the desktop.`);
            resolve(true);
        } catch (error) {
            console.error(`Error creating the folder: ${error}`);
            reject(error); 
        }
    });
}



function renameFolder(formattedFolderName) {
    return new Promise(async (resolve, reject) => {
        const parts = formattedFolderName.split('|');
        if (parts.length < 2) {
            return reject(new Error("Formatted folder name does not contain enough parts."));
        }
        const currentFolderName = parts[0];
        const newFolderName = parts.slice(1).join('|'); 

        const desktopPath = path.join(require('os').homedir(), 'Desktop'); // Path to the user's Desktop
        const currentFolderPath = path.join(desktopPath, currentFolderName); // Full path to the current folder on the Desktop
        const newFolderPath = path.join(desktopPath, newFolderName); // Full path for the new folder name on the Desktop

        try {
            await fs.rename(currentFolderPath, newFolderPath);
            console.log(`Folder has been renamed from ${currentFolderName} to ${newFolderName}.`);
            resolve(true);
        } catch (error) {
            console.error(`Error renaming the folder: ${error}`);
            reject(error); 
        }
    });
}



function deleteFolder(folderName) {
    return new Promise(async (resolve, reject) => {
        const desktopPath = path.join(require('os').homedir(), 'Desktop'); // Path to the user's Desktop
        const folderPath = path.join(desktopPath, folderName); // Full path to the folder on the Desktop

        try {
            await fs.rm(folderPath, { recursive: true });
            console.log(`Folder ${folderName} has been deleted from the desktop.`);
            resolve(true);
        } catch (error) {
            console.error(`Error deleting the folder: ${error}`);
            if (error.code === 'ENOENT') {
                reject(new Error(`Folder "${folderName}" does not exist.`)); // Specifically handle the case where the folder does not exist
            } else {
                reject(error); 
            }
        }
    });
}

function takeScreenshotAndSave() {
    return new Promise((resolve, reject) => {
        const desktopPath = path.join(os.homedir(), 'Desktop'); // Path to the user's Desktop
        const fileName = `screenshot-${new Date().toISOString().replace(/[:.]/g, '-')}.png`; // Create a unique file name
        const filePath = path.join(desktopPath, fileName); // Full path for the screenshot file

        screenshot({ filename: filePath }).then(() => {
            console.log(`Screenshot saved: ${filePath}`);
            resolve(filePath); // Resolve with the file path of the screenshot
        }).catch((error) => {
            console.error(`Could not take screenshot: ${error}`);
            reject(new Error(`Could not take screenshot: ${error}`));
        });
    });
}




function playMusicInApp(input) {
    return new Promise((resolve, reject) => {
        let [nameOfMusic, nameOfPlaylist, musicApp] = input.split('-');

        // Preprocess the song name to remove "featuring" and anything that follows
        const featuringRegex = /\s+(feat\.|featuring)\s+.*/i;
        nameOfMusic = nameOfMusic.replace(featuringRegex, '');

        if (musicApp.toLowerCase() === 'applemusic') {
            const script = `
tell application "Music"
    set thePlaylist to the first playlist whose name is "${nameOfPlaylist}"
    if not exists thePlaylist then
        return false
    end if
    set theTracks to tracks of thePlaylist whose name contains "${nameOfMusic}"
    if theTracks is {} then
        return false
    else
        play item 1 of theTracks
        return true
    end if
end tell
`;
            exec(`osascript -e '${script}'`, (error, stdout, stderr) => {
                if (error || stderr) {
                    console.error(`Error playing the track: ${error || stderr}`);
                    resolve(false);
                    return;
                }
                if (stdout.trim() === 'true') {
                    console.log(`Playing ${nameOfMusic} from ${nameOfPlaylist} on Apple Music.`);
                    resolve(true);
                } else {
                    console.log(`Could not find ${nameOfMusic} in ${nameOfPlaylist} on Apple Music.`);
                    resolve(false);
                }
            });
        } else {
            console.error('Unsupported music app');
            resolve(false); 
        }
    });
}



function pauseMusic() {
    return new Promise((resolve, reject) => {
        const script = `
tell application "Music"
    pause
end tell
`;
        exec(`osascript -e '${script}'`, (error, stdout, stderr) => {
            if (error || stderr) {
                console.error(`Error pausing the music: ${error || stderr}`);
                resolve(false);
                return;
            }
            console.log("Music playback paused.");
            resolve(true); 
        });
    });
}





function openURL(url) {
    return new Promise((resolve, reject) => {
        if (!url) {
            console.error('No URL provided');
            reject(new Error('No URL provided'));
            return;
        }

        const platform = process.platform;
        let command;

        if (platform === "win32") { // Windows
            command = `start "" "${url}"`;
        } else if (platform === "darwin") { // macOS
            command = `open "${url}"`;
        } else if (platform === "linux") { // Linux
            command = `xdg-open "${url}"`;
        } else {
            console.error('Unsupported platform');
            reject(new Error('Unsupported platform'));
            return;
        }

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Could not open the URL: ${error}`);
                resolve(false); 
                return;
            }
            if (stderr) {
                console.error(`Error: ${stderr}`);
                resolve(false);
                return;
            }
            resolve(true);
        });
    });
}


  


module.exports = softwareScript;