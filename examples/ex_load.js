var mdjson = require('../metadata-json');

var root = mdjson.loadFromFile("test.mdj");
console.log(root);
console.log(mdjson.getRoot()); // equivalent
