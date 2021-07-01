const fs = require('fs');
const path = require('path');

const cwd = require('process').cwd();
console.log('cwd is', cwd);

const filesPath = path.join(cwd, process.argv[2] || '');
console.log('files path is', filesPath);

const algorithms = [
        { name: 'insertion', best: (n) => n, worst: (n) => Math.pow(n, 2) },
        { name: 'quick', best: (n) => n * Math.log(n), worst: (n) => Math.pow(n, 2) },
        { name: 'merge', best: (n) => n * Math.log(n), worst: (n) => n * Math.log(n) },
        { name: 'heap', best: (n) => n * Math.log(n), worst: (n) => n * Math.log(n) },
];

const sets = [ 'sorted', 'random', 'inverted' ];

const parseData = (data) => data.split('\n')
        .filter((row) => row.length)
        .map((row) => ({ size: row.split(' ')[0], time: row.split(' ')[1] }));

for (const set of sets) {
        for (const algorithm of algorithms) {
                const fileName = `${algorithm.name}_${set}`;
                const filePath = path.join(filesPath, fileName);
                
                const data = parseData(fs.readFileSync(filePath, 'utf8'));
                const lastRow = data[data.length - 1];

                console.log({data});

                for (const type of [ 'best', 'worst' ]) {
                        const factor = lastRow.time / algorithm[type](lastRow.size);
                        const expected = (n) => algorithm[type](n) * factor;

                        let difference = '';

                        for (const row of data) {
                                difference += `${row.size} ${expected(row.size) - row.time}\n`;
                        }

                        const diffFileName = `${fileName}_${type}_diff`;
                        fs.writeFileSync(diffFileName, difference);
                }
        }
}
