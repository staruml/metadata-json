Metadata-JSON
=============

`metadata-json` is a framework for accessing metadata encoded by Metadata-JSON which is a simple format for encoding metadata created by a modeling language such as UML, SysML, BPMN, etc.

```javascript
var mdj = require("metadata-json");
var root = mdj.loadFromFile("test.mdj");
console.log(root.name);
```
