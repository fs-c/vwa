const fs = require('fs');
const path = require('path');

const  { parseData } = require('./utils');

const n = (n) => n;
const n2 = (n) => Math.pow(n, 2);
const nlogn = (n) => n * Math.log(n);

const efficiencies = {
    N: { func: n, anti: n },
    N2: { func: n2, anti: (n) => Math.sqrt(n) },
    NlogN: { func: nlogn, anti: (n) => n + Math.log(n) },
}

const algorithms = [
    { name: 'insertion', best: efficiencies.N, worst: efficiencies.N2 },
    { name: 'quick', best: efficiencies.NlogN, worst: efficiencies.N2 },
    { name: 'merge', best: efficiencies.NlogN, worst: efficiencies.NlogN },
    { name: 'heap', best: efficiencies.NlogN, worst: efficiencies.NlogN },
];

const sets = [ 'sorted', 'random', 'inverted' ];

const generateComparison = (filesPath, outPath, { pivot }) => {
    for (const set of sets) {
        for (const algorithm of algorithms) {
            const fileName = `${algorithm.name}_${set}`;
            const filePath = path.join(filesPath, fileName);
    
            const data = parseData(fs.readFileSync(filePath, 'utf8'));
            const pivotIndex = pivot === 'end' ? data.length - 1 :
                pivot === 'middle' ? Math.round(data.length / 2) : 0;
            const pivotRow = data[pivotIndex];

            const generateResults = (efficiency, resultsFileName) => {
                const factor = pivotRow.time / efficiency.func(pivotRow.size);
                const expected = (n) => efficiency.func(n) * factor;

                let results = '';

                for (const row of data) {
                    const e = expected(row.size);

                    results += `${row.size} ${e / row.time} ${e} ${row.time} ${row.size / e}\n`;
                }

                fs.writeFileSync(path.join(outPath, resultsFileName), results);
            };

            for (const type of [ 'best', 'worst' ]) {
                generateResults(algorithm[type], `${fileName}_${type}_diff`);
            }

            for (const name in efficiencies) {
                generateResults(efficiencies[name], `${fileName}_${name}_comp`);
            }
        }
    }
};

module.exports = generateComparison;
