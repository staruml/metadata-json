var mdjson = require('../metadata-json');

mdjson.loadFromFile("test.mdj");
mdjson.renderBulk("template.ejs", "<%= element.name %>.html", "@UMLPackage");
