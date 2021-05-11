// f(x) = x^2
// function values are set sizes
// set_size = x^2
// x = sqrt(set_size)
// x / subset_count is step_size
// subset sizes are f(step_size), f(step_size * 2), ..., f(step_size * subset_count)

const getSizes = (setSize, subsetCount) => {
    const stepSize = Math.sqrt(setSize) / subsetCount
    const sizes = []

    for (let i = 1; i <= subsetCount; i++) {
        sizes.push(Math.pow(stepSize * i, 2))
    }

    return sizes
}

console.log(getSizes(Math.pow(2, 18), 64 * 4))
