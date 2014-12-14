**THIS MODULE IS UNDER DEVELOPMENT, DO NOT USE FOR ACTUAL PROJECT**

---

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

Load From File
--------------

To load a model file (`.mdj`), call `loadFromFile` function with a file path. It returns the root element (typically an instanceof Project). You can also get the root element by `getRoot` function.

```javascript
var mdjson = require("metadata-json");

var root = mdjson.loadFromFile("test.mdj");
console.log(root);
console.log(mdjson.getRoot()); // equivalent
```

Generate Code using EJS Template
--------------------------------

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
    <div><%= element.documentation %></div>
    <h3>Children</h3>
    <ul>
    <% element.getChildren().forEach(function (e) { %>
        <li><%= e.name %></li>
    <% }); %>
    </ul>
  </body>
</html>
```

Generate Multiple Codes
-----------------------

If you want to render a set of elements with a same template, you can do by calling `renderBulk` function. You can pass array of elements or selector expression (string) to the third parameter of `renderBulk`. To save each rendered data with different file name, you can also use EJS template syntax in the output file name.

```javascript
var mdjson = require("metadata-json");

mdjson.loadFromFile("test.mdj");
mdjson.renderBulk("template.ejs", "<%= element.name %>.html", "@UMLPackage");
```

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
