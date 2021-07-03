// canon/
//      anti-prediction/
//          linear/
//              md/
//                  heap_inverted
//                  heap_sorted
//                  ...
//              sm/
//                  ...
//              xs/
//                  ...
//          quadratic/
//              heap_inverted
//              ...
//      no-anti-prediction/
//          ...
// supplementary/
//      comparison/
//          heap_inverted_best_diff
//          heap_inverted_worst_diff
//          heap_sorted_best_diff
//          ...
//      sequential-runs/
//          run1/
//              ...
//          ...run8

const fs = require('fs');
const path = require('path');
const child = require('child_process');

const generateComparison = require('./reciprocal-approx');

// It is assumed that this points to the benchmark executable.
const benchBinary = path.resolve(process.argv[2]);

// It is assumed that this directory exists. It does not have to be empty, but
// when this script creates directories, it _replaces_ them.
const outPath = path.resolve(process.argv[3] || 'out');

console.log({ benchBinary, outPath });

const createDirectory = async (p) => {
    const stat = fs.statSync(p, { throwIfNoEntry: false });

    if (stat && stat.isDirectory) {
        fs.rmdirSync(p, { recursive: true });

        console.log('removed', p);
    }

    fs.mkdirSync(p, { recursive: true });

    console.log('created directory', p);

    return p;
};

const runBenchmark = (options) => {
    try {
        console.log('running bench with', { options });

        child.execSync(`${benchBinary} ${options}`);

        console.log('\t done');
    } catch (err) {
        console.error('failed running bench', { options, err });
    }
};

const generateCanon = async () => {
    const canonPath = await createDirectory(path.join(outPath, 'canon'));

    const generateDataset = async (basePath, options) => {
        const linearPath = await createDirectory(path.join(basePath, 'linear'));

        const linearTypes = [
            { name: 'xs', chunks: 16, size: Math.pow(2, 4) },
            { name: 'sm', chunks: 128, size: Math.pow(2, 8) },
            { name: 'md', chunks: 128,  size: Math.pow(2, 18) },
        ];

        for (const type of linearTypes) {
            const typePath = await createDirectory(path.join(linearPath, type.name));

            runBenchmark(`${options} -s ${type.size} -c ${type.chunks} -o ${typePath} -t linear`);
        }

        const quadraticPath = await createDirectory(path.join(basePath, 'quadratic'));

        runBenchmark(`${options} -c 256 -s ${Math.pow(2, 18)} -o ${quadraticPath} -t quadratic`);

        return quadraticPath;
    };

    await generateDataset(
        await createDirectory(path.join(canonPath, 'no-anti-prediction')),
    );

    return await generateDataset(
        await createDirectory(path.join(canonPath, 'anti-prediction')),
        '-r -m 8',
    );
};

const generateSupplementary = async ({ comparisonSource }) => {
    const supPath = await createDirectory(path.join(outPath, 'supplementary'));

    const sequentialPath = await createDirectory(path.join(supPath, 'sequential'));
    for (let i = 0; i < 8; i++) {
        const subPath = await createDirectory(sequentialPath, `run${i + 1}`);

        runBenchmark(`-s 512 -c 32 -t linear -o ${subPath}`);
    }

    const comparisonPath = await createDirectory(path.join(supPath, 'comparison'));
    generateComparison(comparisonSource, comparisonPath);
};

const main = async () => {
    const startTime = Date.now();

    const comparisonSource = await generateCanon();
    await generateSupplementary({ comparisonSource });

    console.log('took', (Date.now() - startTime) / 1000 / 60, 'minutes');
    console.log('bye');
};

main().catch(console.error);
