const fs = require('fs');
const path = require('path');

const getDataPath = (modelName) => {
    return path.join(__dirname, '..', '..', 'data', `${modelName}.json`);
};

const readData = (modelName) => {
    try {
        const filePath = getDataPath(modelName);
        if (!fs.existsSync(filePath)) {
            return [];
        }
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error(`Error reading data from ${modelName}.json:`, err);
        return [];
    }
};

const writeData = (modelName, data) => {
    try {
        const filePath = getDataPath(modelName);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (err) {
        console.error(`Error writing data to ${modelName}.json:`, err);
        return false;
    }
};

module.exports = {
    readData,
    writeData
};
