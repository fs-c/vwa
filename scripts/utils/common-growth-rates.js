const N = (n) => n
const N2 = (n) => Math.pow(n, 2)
const logN = (n) => Math.log(n)
const NlogN = (n) => n * Math.log(n)

const calculations = [{
    name: 'n',
    run: N,
}, {
    name: 'n / n',
    run: () => 1,
}, {
    name: 'n^2',
    run: N2,
}, {
    name: 'n^2 / n',
    run: (n) => N(n) / N2(n),
}, {
    name: 'log n',
    run: logN,
}, {
    name: 'log n / n',
    run: (n) => N(n) / logN(n),
}, {
    name: 'n log n',
    run: NlogN,
}, {
    name: 'n log n / n',
    run: (n) => N(n) / NlogN(n),
}]

const formatNumber = (n, l) => {
    if (Number.isInteger(n)) {
        return n
    }

    const string = parseFloat(n).toString()

    if (string.length <= l) {
        return string
    }

    return n.toFixed(l).slice(0, l)
}

const main = async () => {
    console.log(calculations.map((f) => f.name).join(' '))

    const results = []

    let length = 9

    for (let i = 0; i < 9; i++) {
        const subResults = []
        const n = Math.pow(2, i * 2)

        for (const calc of calculations) {
            const r = calc.run(n)

            subResults.push(r)

            const l = Number.isInteger(r) ? r.toString().length : 0
            length = l > length ? l : length
        }

        results.push(subResults)
    }

    console.log(
        results.map(
            (subResults) => (
                subResults.map((r) => formatNumber(r, length))
            ).join(' ')
        ).join(require('os').EOL)
    )
}

main().catch(console.error)
