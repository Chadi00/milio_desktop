const { shell } = require('electron');



function searchGoogle(query) {
    const encodedQuery = encodeURIComponent(query).replace(/%20/g, '+');
    const url = `https://www.google.com/search?q=${encodedQuery}`;

    return shell.openExternal(url)
        .then(() => 'Opening search query on Google')
        .catch(err => {
            console.error('Failed to open browser:', err);
            return 'Not able to open search query on Google, try again.';
        });
}

module.exports = searchGoogle;