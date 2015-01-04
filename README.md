Metadata-JSON
=============

`metadata-json` is a framework for metadata encoded in a simple JSON format (`.mdj` file) typically created by [StarUML](http://staruml.io).

Getting Started
===============

Installation
------------

```shell
$ npm install metadata-json
```

Load a model file
-----------------

To load a model file (`.mdj`), call `loadFromFile` function with a file path. It returns the root element (typically an instanceof Project). You can also get the root element by `getRoot` function.

```javascript
var mdjson = require("metadata-json");

var root = mdjson.loadFromFile("test.mdj");
console.log(root);
console.log(mdjson.getRoot()); // equivalent
```

Generate code using EJS template
--------------------------------

### Generate a single file

If you want to generate code with a EJS template, you can do by calling `render` function.


```javascript
var mdjson = require("metadata-json");

mdjson.loadFromFile("test.mdj");
mdjson.render("template.ejs", "out.html", mdjson.getRoot()); // out.html file generated.

```

Here is the content of `template.ejs` file.

```
<html>
  <head>
    <title><%= element.name %></title>
  </head>
  <body>
    <h1><%= element.name %></h1>
    <h3>Description</h3>
    <div><%-: element.documentation | markdown %></div>
    <h3>Children</h3>
    <ul>
    <% element.getChildren().forEach(function (e) { %>
        <li><%= e.name %></li>
    <% }); %>
    </ul>
  </body>
</html>
```

In template, you can use the following variables. If you want to pass additional variables, add them to options, the fourth parameter of `render`.

* `element` : the element passed as the third parameter of `render` function.
* `mdjson` : reference to `metadata-json` module.
* `filename` : file name of the template file.
* `root` : the root element. It equals to `mdjson.getRoot()`.

### Generate multiple files

If you want to render a set of elements with a same template, you can do by calling `renderBulk` function. You can pass array of elements or [selector expression (string)](https://github.com/staruml/metadata-json/wiki/SelectorExpression) to the third parameter of `renderBulk`. To save each rendered data with different file name, you can also use EJS template syntax in the output file name.

```javascript
var mdjson = require("metadata-json");

mdjson.loadFromFile("test.mdj");
mdjson.renderBulk("template.ejs", "<%= element.name %>.html", "@UMLPackage");
```

### Use filters

You can define filters to be used in templates.

```javascript
var myFilters = {
    attributeExpression: function (e) {
        return e.name + " : " + e.type + " = " + e.defaultValue;
    }
};
mdjson.render("template.ejs", "out.html", attr, { filters: myFilters }); // out.html file generated.
```

In template, you can use the filters you defined.

```
...
<%=: element | attributeExpression %>
...
```

### Predefined filters

EJS provides several [predefined filters](https://github.com/tj/ejs#filter-list) and additionally following filters are defined in `metadata-json` so you can use them in your EJS templates.

* `filename` : convert string to possible filename in Windows.
* `markdown` : render markdown syntax to HTML.


Export Diagrams to PDF
----------------------

You can export diagrams to a PDF document. Each diagram will be rendered as a page. Supported options are as follow:

* size: 4A0, 2A0, A0, A1, A2, A3, A4, A5, A6, A7, A8, A9, A10, B0, B1, B2, B3, B4, B5, B6, B7, B8, B9, B10, C0, C1, C2, C3, C4, C5, C6, C7, C8, C9, C10, RA0, RA1, RA2, RA3, RA4, SRA0, SRA1, SRA2, SRA3, SRA4, Executive, Folio, Legal, Letter, Tabloid.
* layout: "landscape" or "portrait"
* showName: Whether show diagram path name on the top of the page or not.

```javascript
var mdjson = require("metadata-json");

mdjson.loadFromFile("diagram_test.mdj");

// Retrive all diagrams
var diagrams = mdjson.Repository.getInstancesOf("Diagram");

// Options for PDF export
var options = {
    size: "A4",
    layout: "landscape",
    showName: true
};

mdjson.exportToPDF(diagrams, "out.pdf", options);
```

