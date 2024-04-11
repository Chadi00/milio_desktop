const osascript = require('node-osascript');
const { exec } = require('child_process');

async function hardwareScript(message) {
    if (message.length < 2) {
        console.log("Message too short.");
        return "Message too short.";
    }

    const actionCode = message.substring(0, 2);
    let res = ':(';

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
        case '05':
            console.log("Action 05: put computer to sleep");
            if (message.substring(2) === '0') {
                res = 'Sorry, I was not able to understand.';
            } else {
                try {
                    const computerSleeping = await putComputerToSleep();
                    res = computerSleeping ? 'Computer sleeping...' : 'Failed to put the computer to sleep, make sure you authorized milio to put the computer to sleep.';
                } catch (error) {
                    console.error(`Error: ${error}`);
                    res = 'Encountered an error trying to put the computer to sleep. *make sure you authorized milio to put the computer to sleep.*';
                }
            }
            break;
        case '06':
            console.log("Action 06: Shut down Computer");
            if (message.substring(2) === '0') {
                res = 'Sorry, I was not able to understand.';
            } else {
                try {
                    const computerShutdown = await shutdownComputer();
                    res = computerShutdown ? 'Computer shut down.' : 'Failed to shut down the computer, make sure you authorized milio to shut down the computer.';
                } catch (error) {
                    console.error(`Error: ${error}`);
                    res = 'Encountered an error trying to shut down the computer. *make sure you authorized milio to shut down the computer.*';
                }
            }
            break;
        case '07':
            console.log("Action 07: Restart computer");
            if (message.substring(2) === '0') {
                res = 'Sorry, I was not able to understand.';
            } else {
                try {
                    const computerRestarting = await putComputerToSleep();
                    res = computerRestarting ? 'Computer restarting...' : 'Failed to restart the computer, make sure you authorized milio to restart the computer.';
                } catch (error) {
                    console.error(`Error: ${error}`);
                    res = 'Encountered an error trying to restart the computer. *make sure you authorized milio to restart the computer.*';
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


function putComputerToSleep() {
    return new Promise((resolve, reject) => {
      // Determine the command based on the operating system
      let command;
      if (process.platform === 'win32') {
        command = 'rundll32.exe powrprof.dll,SetSuspendState 0,1,0';
      } else if (process.platform === 'darwin') {
        command = 'pmset sleepnow';
      } else if (process.platform === 'linux') {
        command = 'systemctl suspend';
      } else {
        console.error('Unsupported platform:', process.platform);
        return resolve(false);
      }
  
      // Execute the command to put the computer to sleep
      exec(command, (err) => {
        if (err) {
          console.error('Error executing sleep command:', err);
          return resolve(false);
        } else {
          return resolve(true);
        }
      });
    });
}
  

function shutdownComputer() {
    return new Promise((resolve, reject) => {
      let command;
      if (process.platform === 'win32') {
        command = 'shutdown /s /t 0'; // Immediate shutdown
      } else if (process.platform === 'darwin' || process.platform === 'linux') {
        command = 'sudo shutdown -h now'; // Immediate shutdown for both macOS and Linux
      } else {
        console.error('Unsupported platform:', process.platform);
        return resolve(false);
      }
  
      exec(command, (err) => {
        if (err) {
          console.error('Error executing shutdown command:', err);
          return resolve(false);
        } else {
          return resolve(true);
        }
      });
    });
}


function restartComputer() {
    return new Promise((resolve, reject) => {
      let command;
      if (process.platform === 'win32') {
        command = 'shutdown /r /t 0'; // Immediate restart
      } else if (process.platform === 'darwin' || process.platform === 'linux') {
        command = 'sudo shutdown -r now'; // Immediate restart for both macOS and Linux
      } else {
        console.error('Unsupported platform:', process.platform);
        return resolve(false);
      }
  
      exec(command, (err) => {
        if (err) {
          console.error('Error executing restart command:', err);
          return resolve(false);
        } else {
          return resolve(true);
        }
      });
    });
}




module.exports = hardwareScript;
