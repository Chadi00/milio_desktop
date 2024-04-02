const { exec } = require('child_process');

function softwareScript(message) {

    let res = '-';

    if (message.length < 3) {
        console.log("Message too short.");
        return;
    }

    // Extract the first two characters of the message
    const actionCode = message.substring(0, 2);

    // Use a switch statement to handle different action codes
    switch (actionCode) {
        case '01':
            console.log("Action 01: Open application.");
            if (message.substring(2) === '0'){
                res = 'Sorry I was not able to understand which application you want to open, can you try again please.';
                break;
            }
            openApplication(message.substring(2));
            break;
        case '02':
            console.log("Action 02: Do something different for action 02.");
            // Add the code for action 02 here
            break;
        case '03':
            console.log("Action 03: Another distinct action for action 03.");
            // Add the code for action 03 here
            break;
        // Add more cases as needed for other action codes
        default:
            console.log("Default case: No specific action found for this code.");
            // Add the default action code here
    }
    return res;
}

function openApplication(appName) {
    // Determine the platform
    const platform = process.platform;

    // Construct the command based on the platform
    let command;
    if (platform === "win32") { // Windows
        command = `start ${appName}`;
    } else if (platform === "darwin") { // macOS
        command = `open -a "${appName}"`;
    } else if (platform === "linux") { // Linux
        command = `xdg-open ${appName}`; // This might need adjustments depending on the app
    } else {
        console.error('Unsupported platform');
        return;
    }

    // Execute the command
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Could not open the application: ${error}`);
            return;
        }
        if (stderr) {
            console.error(`Error: ${stderr}`);
            return;
        }
        console.log(`Application opened: ${stdout}`);
    });
}

module.exports = softwareScript;