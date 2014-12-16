var mdjson = require('../metadata-json');

mdjson.loadFromFile("test.mdj");
mdjson.renderBulk("template.ejs", "<%= element.name %>.html", "@UMLPackage", {}, function (err, file, elem) {
    console.log(file + " generated.");
});
