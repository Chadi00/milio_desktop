const os = require('os');
const osascript = require('node-osascript');

async function hardwareScript(message) {
    if (message.length < 2) {
        console.log("Message too short.");
        return "Message too short.";
    }

    const actionCode = message.substring(0, 2);
    let res = '-';

    switch (actionCode) {
        case '01':
            console.log("Action 01: turn volume up.");
            if (message.substring(2) === '0') {
                res = 'Sorry, I was not able to understand by how much you want to increase the volume.';
            } else {
                try {
                    const volumeAdjustment = message.substring(2);
                    const turnedUp = await volumeUp(volumeAdjustment);
                    res = turnedUp ? 'Volume Up' : 'Failed to increase volume, make sure you authorized milio to adjust the volume.';
                } catch (error) {
                    console.error(`Error: ${error}`);
                    res = 'Encountered an error trying to increase the volume. *Make sure you authorized milio to adjust the volume.*';
                }
            }
            break;
        case '02':
            console.log("Action 02: turn volume down.");
            if (message.substring(2) === '0') {
                res = 'Sorry, I was not able to understand by how much you want to decrease the volume.';
            } else {
                try {
                    const volumeAdjustment = message.substring(2);
                    const turnedDown = await volumeDown(volumeAdjustment);
                    res = turnedDown ? 'Volume Down' : 'Failed to increase volume, make sure you authorized milio to adjust the volume.';
                } catch (error) {
                    console.error(`Error: ${error}`);
                    res = 'Encountered an error trying to decrease the volume. *Make sure you authorized milio to adjust the volume.*';
                }
            }
            break;
        default:
            console.log("Default case: No specific action found for this code.");
            res = "No specific action found for this code.";
    }

    return res;
}



function volumeUp(input) {
    return new Promise((resolve, reject) => {
        const isPercentage = input.startsWith('%');
        // Correctly parse the volume change based on whether it's a percentage
        const volumeChange = isPercentage ? parseInt(input.slice(1), 10) : parseInt(input, 10);

        if (isNaN(volumeChange)) {
            console.error('Error: Volume change input is not a number:', input);
            return resolve(false);
        }

        osascript.execute('output volume of (get volume settings)', (err, currentVolumeStr) => {
            if (err) {
                console.error('Error getting current volume:', err);
                return resolve(false);
            }

            const currentVolume = parseInt(currentVolumeStr, 10);
            let newVolume;

            if (isPercentage) {
                newVolume = Math.round(currentVolume + (currentVolume * volumeChange / 100));
            } else {
                newVolume = currentVolume + volumeChange;
            }

            newVolume = Math.max(0, Math.min(100, newVolume));

            osascript.execute(`set volume output volume ${newVolume}`, (err) => {
                if (err) {
                    console.error('Error setting volume:', err);
                    resolve(false);
                } else {
                    resolve(true);
                }
            });
        });
    });
}


 
function volumeDown(input) {
    return new Promise((resolve, reject) => {
        const isPercentage = input.startsWith('%');
        const volumeChange = isPercentage ? parseInt(input.slice(1), 10) : parseInt(input, 10);

        if (isNaN(volumeChange)) {
            console.error('Error: Volume change input is not a number:', input);
            return resolve(false);
        }

        osascript.execute('output volume of (get volume settings)', (err, currentVolumeStr) => {
            if (err) {
                console.error('Error getting current volume:', err);
                return resolve(false);
            }

            const currentVolume = parseInt(currentVolumeStr, 10);
            let newVolume;

            if (isPercentage) {
                newVolume = Math.round(currentVolume - (currentVolume * volumeChange / 100));
            } else {
                newVolume = currentVolume - volumeChange;
            }

            newVolume = Math.max(0, Math.min(100, newVolume));

            osascript.execute(`set volume output volume ${newVolume}`, (err) => {
                if (err) {
                    console.error('Error setting volume:', err);
                    resolve(false);
                } else {
                    resolve(true);
                }
            });
        });
    });
}


  

module.exports = hardwareScript;
