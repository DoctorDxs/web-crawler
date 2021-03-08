const {exec} = require("child_process");

const openBrowse =  url => {
    switch (process.platform) {
        case "darwin":
            exec(`open ${url}`);
        case "win32":
            exec(`start ${url}`);
        case 'linux':
            exec(`xdg-open ${url}`);
            break;
        default:
            exec(`open ${url}`);
    }
}

module.exports = openBrowse