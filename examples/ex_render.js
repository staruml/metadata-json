var mdjson = require('../metadata-json');

mdjson.loadFromFile("test.mdj");
mdjson.render("template.ejs", "out.html", mdjson.getRoot()); // out.html file generated.
