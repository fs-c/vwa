const fs = require('fs');
const path = require('path');

const { parseData } = require('./utils');

const generateBestData = (benchPath, outPath) => {
    const benchFilePaths = fs.readdirSync(benchPath);

    const out = {};

    for (const strategy of [ 'average', 'median' ]) {
        const rows = {};

        for (const filePath of benchFilePaths) {
            const [ algorithm, set ] = filePath.split('_');
    
            if (!algorithm || !set) {
                console.log('path', filePath, 'had invalid formatting, skipping');
    
                continue;
            }
    
            const data = parseData(fs.readFileSync(path.join(benchPath, filePath), 'utf8'));
            const value = strategy === 'median'
                ? data[Math.round(data.length / 2)].time
                : strategy === 'average'
                    ? data.reduce((p, c) => p += Number.parseFloat(c.time), 0) / data.length
                    : 0;
    
            if (!rows[algorithm]) {
                rows[algorithm] = {};
            }
    
            rows[algorithm][set] = value;
        }
    
        let file = '"algorithm"\t"inverted"\t"random"\t"sorted"\n';
    
        for (const row in rows) {
            const v = rows[row];
    
            file += `"${row}"\t${v.inverted}\t${v.random}\t${v.sorted}\n`;
        }

        fs.writeFileSync(outPath + `_${strategy}`, file);
    }
};

module.exports = generateBestData;
