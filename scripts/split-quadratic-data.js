const cwd = require('process').cwd();
console.log('cwd is', cwd);

const filesPath = require('path').join(cwd, process.argv[2] || '');
console.log('files path is', filesPath);

const fileNames = 
