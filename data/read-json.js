var fs = require('fs');
var file = './character-data.json';

var data = fs.readFileSync(file, 'utf8');

data = JSON.parse(data);

console.log(data);

console.log(data['root'][3]);

console.log(data['root'][3]['evolve'][0]);

var obj = {};
var level = 1;
var cost = 100;

obj[0] = {level: cost};
console.log({level: cost});
console.log(obj.length);
console.log(obj[0]);
