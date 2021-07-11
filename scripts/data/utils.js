const parseData = (data) => data.split('\n')
    .filter((row) => row.length)
    .map((row) => ({ size: row.split(' ')[0], time: row.split(' ')[1] }));

exports.parseData = parseData;
