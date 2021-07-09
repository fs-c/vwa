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
// things might turn into a mess if it's not.
const outPath = path.resolve(process.argv[3] || 'out');

console.log({ benchBinary, outPath });

const _createDirectory = async (_dry, p) => {
    if (_dry) {
        console.log('dry directory creation', p);

        return p;
    }

    const stat = fs.statSync(p, { throwIfNoEntry: false });

    if (stat && stat.isDirectory) {
        console.log('already existed', p);

        return p;
    }

    fs.mkdirSync(p, { recursive: true });

    console.log('created directory', p);

    return p;
};

const _runBenchmark = (_dry, options, debugPath) => {
    if (_dry) {
        console.log('dry bench with', options);

        return;
    }

    try {
        console.log('running bench with', { options });

        const logs = child.execSync(`${benchBinary} ${options}`);
        if (debugPath) {
            fs.writeFileSync(path.join(debugPath, 'debug.log'), logs.toString());
        }

        console.log('\t done');
    } catch (err) {
        console.error('failed running bench', { options, err });
    }
};

const generateCanon = async ({ createDirectory, runBenchmark }, _, { antiPred, noAntiPred, quadratic, linear }) => {
    const canonPath = await createDirectory(path.join(outPath, 'canon'));

    const generateDataset = async (basePath, options) => {
        if (linear) {
            const linearPath = await createDirectory(path.join(basePath, 'linear'));

            const linearTypes = [
                { name: 'xs', chunks: 16, size: Math.pow(2, 4) },
                { name: 'sm', chunks: 128, size: Math.pow(2, 8) },
                { name: 'md', chunks: 128,  size: Math.pow(2, 18) },
            ];

            for (const type of linearTypes) {
                const typePath = await createDirectory(path.join(linearPath, type.name));

                runBenchmark(`${options} -s ${type.size} -c ${type.chunks} -o ${typePath} -t linear`,
                    typePath);
            }
        }

        if (quadratic) {
            const quadraticPath = await createDirectory(path.join(basePath, 'quadratic'));

            runBenchmark(`${options} -c 256 -s ${Math.pow(2, 18)} -o ${quadraticPath} -t quadratic`,
                quadraticPath);

            return quadraticPath;
        }
    };

    if (noAntiPred) {
        await generateDataset(
            await createDirectory(path.join(canonPath, 'no-anti-prediction')),
            '-m 8'
        );
    }

    if (antiPred) {
        const antiPredictionPath = await generateDataset(
            await createDirectory(path.join(canonPath, 'anti-prediction')),
            '-r -m 8',
        );
    
        return { antiPredictionPath };
    }
};

const generateSupplementary = async ({ createDirectory, runBenchmark }, data) => {
    const supplementaryPath = await createDirectory(path.join(outPath, 'supplementary'));

    const sequentialPath = await createDirectory(path.join(supplementaryPath, 'sequential'));
    for (let i = 0; i < 8; i++) {
        const subpath = await createDirectory(path.join(sequentialPath, `run${i + 1}`));

        runBenchmark(`-s 512 -c 32 -t linear -o ${subpath}`);
    }

    return { path: supplementaryPath };
};

const generateSupplementaryDistortion = async (
    { createDirectory, runBenchmark }, { supplementary }
) => {
    const distortionPath = await createDirectory(path.join(supplementary.path, 'distortion'));

    runBenchmark(`-s 512 -c 32 -o ${path.join(distortionPath, '1')}`);
    runBenchmark(`-s 512 -c 32 -m 8 -o ${path.join(distortionPath, '8')}`);
    runBenchmark(`-s 512 -c 32 -m 32 -o ${path.join(distortionPath, '32')}`);
    runBenchmark(`-s 512 -c 32 -m 128 -o ${path.join(distortionPath, '128')}`);
    runBenchmark(`-s 512 -c 32 -m 512 -o ${path.join(distortionPath, '512')}`);
};

const generateSupplementaryComparison = async ({ createDirectory, runBenchmark }, data) => {
    const { antiPredictionPath } = data['canon/ap/quadratic'];
    const { path: supplementaryPath } = data['supplementary'];

    console.log('generating comparison with', antiPredictionPath);

    const comparisonPath = await createDirectory(
        path.join(supplementaryPath, 'comparison'));
    generateComparison(antiPredictionPath, comparisonPath);
};

const tasks = [
    { name: 'canon/ap/quadratic', run: generateCanon, options: { antiPred: true, quadratic: true } },
    { name: 'canon/nap/quadratic', run: generateCanon, options: { noAntiPred: true, quadratic: true } },
    { name: 'canon/ap/linear', run: generateCanon, options: { antiPred: true, linear: true } },
    { name: 'canon/nap/linear', run: generateCanon, options: { noAntiPred: true, linear: true } },
    { name: 'supplementary', run: generateSupplementary },
    { name: 'supplementary/distortion', run: generateSupplementaryDistortion },
    { name: 'supplementary/comparison', run: generateSupplementaryComparison },
];

const dueTasks = (!process.argv[4] || process.argv[4] === 'all') ? (
    tasks.map((t) => t.name)
) : process.argv[4].split(',').map((t) => t.trim());

console.log('running tasks', dueTasks);

const main = async () => {
    const startTime = Date.now();

    const results = {}

    for (const task of tasks) {
        const dry = !dueTasks.includes(task.name);

        console.log('running task', task.name, ', dry', dry);

        results[task.name] = await task.run({
            runBenchmark: _runBenchmark.bind(null, dry),
            createDirectory: _createDirectory.bind(null, dry),
        }, results, task.options);

        console.log(results);
    }

    console.log('took', (Date.now() - startTime) / 1000 / 60, 'minutes');
    console.log('bye');
};

main().catch(console.error);
