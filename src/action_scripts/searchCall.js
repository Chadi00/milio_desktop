const { exec } = require('child_process');

function searchGoogle(query) {
    const encodedQuery = encodeURIComponent(query).replace(/%20/g, '+');
    const url = `https://www.google.com/search?q=${encodedQuery}`;

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
                reject(new Error(`Could not open the URL: ${error}`)); // Reject the promise if an error occurs
                return;
            }
            if (stderr) {
                console.error(`Error on opening URL: ${stderr}`);
                reject(new Error(`Error on opening URL: ${stderr}`)); // Reject the promise if there is stderr output
                return;
            }
            resolve('Opening search query on Google'); // Resolve successfully if the URL is opened without errors
        });
    });
}



module.exports = searchGoogle;