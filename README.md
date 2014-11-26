Metadata-JSON
=============

`metadata-json` is a framework for accessing metadata encoded by Metadata-JSON which is a simple format for encoding metadata created by a modeling language such as UML, SysML, BPMN, etc.

```javascript
var mdjson = require("mdjson");
var root = mdjson.loadFromFile("test.mdj");
console.log(root.name);
```
