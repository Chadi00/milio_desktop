const { exec } = require('child_process');

async function softwareScript(message) {
    if (message.length < 3) {
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
                    res = wasOpened ? 'Opened ' + message.substring(2) : 'Failed to open the application. Ensure it is available on your computer.';
                } catch (error) {
                    console.error(`Error: ${error}`);
                    res = 'Encountered an error trying to open the application.';
                }
            }
            break;
        case '02':
            console.log("Action 02: Do something different for action 02.");
            res = 'Action 2.';
            break;
        case '03':
            console.log("Action 03: Do something different for action 03.");
            res = 'Action 3.';
            break;
        default:
            console.log("Default case: No specific action found for this code.");
            res = "No specific action found for this code.";
    }

    return res;
}


function openApplication(appName) {
    return new Promise((resolve, reject) => {
        const platform = process.platform;

        let command;
        if (platform === "win32") { // Windows
            command = `start "" "${appName}://"`;
        } else if (platform === "darwin") { // macOS
            command = `open -a "${appName}"`;
        } else if (platform === "linux") { // Linux
            command = `xdg-open ${appName}`;
        } else {
            console.error('Unsupported platform');
            reject(new Error('Unsupported platform'));
            return;
        }

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Could not open the application: ${error}`);
                resolve(false); // Resolve to false instead of reject to indicate command failure, not function failure
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