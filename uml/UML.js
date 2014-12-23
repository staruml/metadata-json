/*
 * Copyright (c) 2013-2014 Minkyu Lee. All rights reserved.
 *
 * NOTICE:  All information contained herein is, and remains the
 * property of Minkyu Lee. The intellectual and technical concepts
 * contained herein are proprietary to Minkyu Lee and may be covered
 * by Republic of Korea and Foreign Patents, patents in process,
 * and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Minkyu Lee (niklaus.lee@gmail.com).
 *
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50, regexp: true, loopfunc: true */
/*global define, $, _, window, appshell, meta, type */

define(function (require, exports, module) {
    "use strict";

    var Core             = require("core/Core"),
        MetaModelManager = require("core/MetaModelManager"),
        Repository       = require("core/Repository");

    /**************************************************************************
     *                                                                        *
     *                       CONSTANTS AND ENUMERATIONS                       *
     *                                                                        *
     *************************************************************************/

    /**
     * UMLVisibilityKind
     * @enum
     */
    var VK_PUBLIC    = 'public',
        VK_PROTECTED = 'protected',
        VK_PRIVATE   = 'private',
        VK_PACKAGE   = 'package';

    /**
     * UMLAggregationKind
     * @enum
     */
    var AK_NONE      = 'none',
        AK_SHARED    = 'shared',
        AK_COMPOSITE = 'composite';

    /**
     * UMLDirectionKind
     * @enum
     */
    var DK_IN     = 'in',
        DK_INOUT  = 'inout',
        DK_OUT    = 'out',
        DK_RETURN = 'return';

    /**
     * UMLCallConcurrencyKind
     * @enum
     */
    var CCK_SEQUENTIAL = 'sequential',
        CCK_GUARDED    = 'guarded',
        CCK_CONCURRENT = 'concurrent';

    /**
     * UMLMessageSort
     * @enum
     */
    var MS_SYNCHCALL     = 'synchCall',
        MS_ASYNCHCALL    = 'asynchCall',
        MS_ASYNCHSIGNAL  = 'asynchSignal',
        MS_CREATEMESSAGE = 'createMessage',
        MS_DELETEMESSAGE = 'deleteMessage',
        MS_REPLY         = 'reply';

    /**
     * UMLPseudostateKind
     * @enum
     */
    var PSK_INITIAL         = 'initial',
        PSK_DEEPHISTORY     = 'deepHistory',
        PSK_SHALLOWHISTORY  = 'shallowHistory',
        PSK_JOIN            = 'join',
        PSK_FORK            = 'fork',
        PSK_JUNCTION        = 'junction',
        PSK_CHOICE          = 'choice',
        PSK_ENTRYPOINT      = 'entryPoint',
        PSK_EXITPOINT       = 'exitPoint',
        PSK_TERMINATE       = 'terminate';

    /**
     * UMLTransitionKind
     * @enum
     */
    var TK_EXTERNAL = 'external',
        TK_INTERNAL = 'internal',
        TK_LOCAL    = 'local';

    /**
     * UMLEventKind
     * @enum
     */
    var EK_SIGNAL     = 'signal',
        EK_CALL       = 'call',
        EK_CHANGE     = 'change',
        EK_TIME       = 'time',
        EK_ANYRECEIVE = 'anyReceive';

    /**
     * UMLInteractionOperatorKind
     * @enum
     */
    var IOK_ALT      = 'alt',
        IOK_OPT      = 'opt',
        IOK_PAR      = 'par',
        IOK_LOOP     = 'loop',
        IOK_CRITICAL = 'critical',
        IOK_NEG      = 'neg',
        IOK_ASSERT   = 'assert',
        IOK_STRICT   = 'strict',
        IOK_SEQ      = 'seq',
        IOK_IGNORE   = 'ignore',
        IOK_CONSIDER = 'consider',
        IOK_BREAK    = 'break';

    /**
     * UMLActionKind
     * @enum
     */
    var ACK_OPAQUE       = "opaque",
        ACK_CREATE       = "create",
        ACK_DESTROY      = "destroy",
        ACK_READ         = "read",
        ACK_WRITE        = "write",
        ACK_INSERT       = "insert",
        ACK_DELETE       = "delete",
        ACK_SENDSIGNAL   = "sendSignal",
        ACK_ACCEPTSIGNAL = "acceptSignal",
        ACK_TRIGGEREVENT = "triggerEvent",
        ACK_ACCEPTEVENT  = "acceptEvent",
        ACK_STRUCTURED   = "structured";

    /**
     * UMLObjectNodeOrderingKind
     * @enum
     */
    var ONOK_UNORDERED = 'unordered',
        ONOK_ORDERED   = 'ordered',
        ONOK_LIFO      = 'LIFO',
        ONOK_FIFO      = 'FIFO';

    /**
     * Stereotype Display
     * @enum
     */
    var SD_NONE             = 'none',
        SD_LABEL            = 'label',
        SD_DECORATION       = 'decoration',
        SD_DECORATION_LABEL = 'decoration-label',
        SD_ICON             = 'icon',
        SD_ICON_LABEL       = 'icon-label';

    /**************************************************************************
     *                                                                        *
     *                                 BACKBONE                               *
     *                                                                        *
     **************************************************************************/

    /**
     * UMLElementMixin
     */
    var UMLElementMixin = {

        getDisplayClassName: function () {
            var name = this.getClassName();
            return name.substring(3, name.length);
        },

        getVisibilityString: function () {
            switch (this.visibility) {
            case VK_PUBLIC:
                return "+";
            case VK_PROTECTED:
                return "#";
            case VK_PRIVATE:
                return "-";
            case VK_PACKAGE:
                return "~";
            }
        },

        getString: function (includeVisibility) {
            var _string = this.name;
            if (includeVisibility) {
                _string = this.getVisibilityString() + _string;
            }
            return _string;
        },

        getStereotypeString: function () {
            if (_.isString(this.stereotype) && (this.stereotype.length > 0)) {
                return "«" + this.stereotype + "»";
            } else if (this.stereotype instanceof type.Model) {
                return "«" + this.stereotype.name + "»";
            }
            return "";
        },

        getNamespaceString: function () {
            if (this._parent) {
                return "(from " + this._parent.name + ")";
            } else {
                return "(from Root)";
            }
        },

        getTagStringArray: function () {
            var tagArray = [];
            if (this.tags && this.tags.length > 0) {
                var i, len, tag;
                for (i = 0, len = this.tags.length; i < len; i++) {
                    tag = this.tags[i];
                    switch (tag.kind) {
                    case Core.TK_STRING:
                        tagArray.push(tag.name + '="' + tag.value + '"');
                        break;
                    case Core.TK_REFERENCE:
                        if (tag.reference instanceof Core.Model) {
                            tagArray.push(tag.name + '=' + tag.reference.name);
                        } else {
                            tagArray.push(tag.name + '=null');
                        }
                        break;
                    case Core.TK_BOOLEAN:
                        tagArray.push(tag.name + '=' + tag.checked);
                        break;
                    case Core.TK_NUMBER:
                        tagArray.push(tag.name + '=' + tag.number);
                        break;
                    // TK_HIDDEN is not shown in Diagram.
                    }
                }
            }
            return tagArray;
        },

        getPropertyString: function () {
            var props = this.getTagStringArray();
            if (props.length > 0) {
                return "{" + props.join(", ") + "}";
            }
            return "";
        }

    };

    /**
     * UMLModelElement
     * @constructor
     */
    function UMLModelElement() {
        type.ExtensibleModel.apply(this, arguments);
        this.stereotype = null;
        this.visibility = VK_PUBLIC;
        this.templateParameters = [];
        // mixin UMLElementMixin
        _.extend(UMLModelElement.prototype, UMLElementMixin);
    }
    // inherits from Model
    UMLModelElement.prototype = Object.create(type.ExtensibleModel.prototype);
    UMLModelElement.prototype.constructor = UMLModelElement;

    UMLModelElement.prototype.getNodeText = function () {
        var text = "";
        // stereotype
        text += this.getStereotypeString();
        // name and type
        if (this.name && this.name.length > 0) {
            text += this.name;
        } else {
            text += "(" + this.getDisplayClassName() + ")";
        }
        return text;
    };

    UMLModelElement.prototype.getDependencies = function () {
        var self = this,
            rels = Repository.getRelationshipsOf(self, function (r) {
                return (r instanceof type.UMLDependency) && (r.source === self);
            });
        return _.map(rels, function (g) { return g.target; });
    };

    UMLModelElement.prototype.getDependants = function () {
        var self = this,
            rels = Repository.getRelationshipsOf(self, function (r) {
                return (r instanceof type.UMLDependency) && (r.target === self);
            });
        return _.map(rels, function (g) { return g.source; });
    };

    UMLModelElement.prototype.getConstraints = function () {
        return _.filter(this.ownedElements, function (e) { return (e instanceof type.UMLConstraint); });
    };

    /**
     * UMLConstraint
     * @constructor
     */
    function UMLConstraint() {
        UMLModelElement.apply(this, arguments);
        this.specification = '';
        this.constrainedElements = [];
    }
    // inherits from UMLModelElement
    UMLConstraint.prototype = Object.create(UMLModelElement.prototype);
    UMLConstraint.prototype.constructor = UMLConstraint;

    UMLConstraint.prototype.getNodeText = function () {
        var text = "";
        // stereotype
        if (_.isString(this.stereotype) && (this.stereotype.length > 0)) {
            text += "«" + this.stereotype + "» ";
        } else if (this.stereotype !== null) {
            text += "«" + this.stereotype.name + "» ";
        }
        // name and type
        if (this.name && this.name.length > 0) {
            text += this.name;
        } else {
            text += "(" + this.getDisplayClassName() + ")";
        }
        // collection name
        var collection = this.getParentField();
        if (collection !== "ownedElements") {
            text += " <@" + collection + ">";
        }
        return text;
    };


    /**
     * UMLTemplateParameter
     * @constructor
     */
    function UMLTemplateParameter() {
        UMLModelElement.apply(this, arguments);
        this.parameterType = '';
        this.defaultValue = '';
    }
    // inherits from UMLModelElement
    UMLTemplateParameter.prototype = Object.create(UMLModelElement.prototype);
    UMLTemplateParameter.prototype.constructor = UMLTemplateParameter;

    UMLTemplateParameter.prototype.getString = function (options) {
        var text = "";
        text += this.getStereotypeString();
        text += this.name;
        if (options && options.showType) {
            text += (this.parameterType.length > 0 ? ": " + this.parameterType : "");
        }
        text += (this.defaultValue.length > 0 ? " = " + this.defaultValue : "");
        return text;
    };


    /**
     * UMLFeature
     * @constructor
     */
    function UMLFeature() {
        UMLModelElement.apply(this, arguments);
        this.isStatic = false;
        this.isLeaf = false;
    }
    // inherits from UMLModelElement
    UMLFeature.prototype = Object.create(UMLModelElement.prototype);
    UMLFeature.prototype.constructor = UMLFeature;


    /**
     * UMLStructuralFeature
     * @constructor
     */
    function UMLStructuralFeature() {
        UMLFeature.apply(this, arguments);
        this.type = '';
        this.multiplicity = '';
        this.isReadOnly = false;
        this.isOrdered = false;
        this.isUnique = false;
        this.defaultValue = '';
    }
    // inherits from UMLFeature
    UMLStructuralFeature.prototype = Object.create(UMLFeature.prototype);
    UMLStructuralFeature.prototype.constructor = UMLStructuralFeature;

    UMLStructuralFeature.prototype.getTypeString = function () {
        if (this.type) {
            if (_.isString(this.type) && (this.type.length > 0)) {
                return this.type;
            } else if ((this.type !== null) && (this.type.name)) {
                return this.type.name;
            }
        }
        return null;
    };

    UMLStructuralFeature.prototype.getPropertyString = function () {
        var props = [];
        if (this.isReadOnly === true) { props.push("readOnly"); }
        if (this.isOrdered === true) { props.push("ordered"); }
        if (this.isUnique === true) { props.push("unique"); }
        props = _.union(props, this.getTagStringArray());
        if (props.length > 0) {
            return "{" + props.join(", ") + "}";
        }
        return "";
    };

    UMLStructuralFeature.prototype.getString = function (options) {
        var text = "";
        text += this.name;
        if (options && options.showType) {
            text += (this.getTypeString() !== null ? ": " + this.getTypeString() : "");
        }
        if (options && options.showMultiplicity) {
            text += (this.multiplicity.length > 0 ? "[" + this.multiplicity + "]" : "");
        }
        text += (this.defaultValue.length > 0 ? " = " + this.defaultValue : "");
        if (options && options.showProperty) {
            var prop = this.getPropertyString();
            text += (prop.length > 0 ? " " + prop : "");
        }
        return text;
    };

    /**
     * UMLParameter
     * @constructor
     */
    function UMLParameter() {
        UMLStructuralFeature.apply(this, arguments);
        this.direction = DK_IN;
    }
    // inherits from UMLStructuralFeature
    UMLParameter.prototype = Object.create(UMLStructuralFeature.prototype);
    UMLParameter.prototype.constructor = UMLParameter;

    UMLParameter.prototype.getDirectionString = function (options) {
        switch (this.direction) {
        case DK_IN:
            return "";
        case DK_INOUT:
            return "inout ";
        case DK_OUT:
            return "out ";
        case DK_RETURN:
            return "";
        }
    };

    UMLParameter.prototype.getString = function (options) {
        var text = "";
        text += this.getDirectionString();
        text += this.name;
        if (options && options.showType) {
            text += (this.getTypeString() !== null ? ": " + this.getTypeString() : "");
        }
        if (options && options.showMultiplicity) {
            text += (this.multiplicity.length > 0 ? "[" + this.multiplicity + "]" : "");
        }
        text += (this.defaultValue.length > 0 ? " = " + this.defaultValue : "");
        return text;
    };


    /**
     * UMLBehavioralFeature
     * @constructor
     */
    function UMLBehavioralFeature() {
        UMLFeature.apply(this, arguments);
        this.parameters = [];
        this.raisedExceptions = [];
        this.concurrency = CCK_SEQUENTIAL;
    }
    // inherits from UMLFeature
    UMLBehavioralFeature.prototype = Object.create(UMLFeature.prototype);
    UMLBehavioralFeature.prototype.constructor = UMLBehavioralFeature;

    UMLBehavioralFeature.prototype.getReturnParameter = function () {
        var i, len;
        for (i = 0, len = this.parameters.length; i < len; i++) {
            var param = this.parameters[i];
            if (param.direction === DK_RETURN) {
                return param;
            }
        }
        return null;
    };

    UMLBehavioralFeature.prototype.getNonReturnParameters = function () {
        var i, len, params = [];
        for (i = 0, len = this.parameters.length; i < len; i++) {
            var param = this.parameters[i];
            if (param.direction !== DK_RETURN) {
                params.push(param);
            }
        }
        return params;
    };

    UMLBehavioralFeature.prototype.getParametersString = function (options) {
        var i, len, terms = [],
            params = this.getNonReturnParameters();
        for (i = 0, len = params.length; i < len; i++) {
            var param = params[i];
            terms.push(param.getString(options));
        }
        return "(" + terms.join(", ") + ")";
    };

    UMLBehavioralFeature.prototype.getReturnString = function (options) {
        var returnParam = this.getReturnParameter();
        var text = "";
        if (returnParam) {
            if (options && options.showType) {
                text += returnParam.getTypeString();
            }
            if (options && options.showMultiplicity) {
                text += (returnParam.multiplicity.length > 0 ? "[" + returnParam.multiplicity + "]" : "");
            }
        }
        return text;
    };

    UMLBehavioralFeature.prototype.getString = function (options) {
        var text = "";
        if (options && (options.stereotypeDisplay === SD_LABEL || options.stereotypeDisplay === SD_DECORATION_LABEL || options.stereotypeDisplay === SD_ICON_LABEL)) {
            text += this.getStereotypeString();
        }
        if (options && options.showVisibility) {
            text += this.getVisibilityString();
        }
        text += this.name;
        if (options && options.showOperationSignature) {
            text += this.getParametersString(options);
            text += (this.getReturnString(options).length > 0 ? ": " + this.getReturnString(options) : "");
        } else {
            text += "()";
        }
        if (options && options.showProperty) {
            var prop = this.getPropertyString();
            text += (prop.length > 0 ? " " + prop : "");
        }
        return text;
    };


    /**
     * UMLAttribute
     * @constructor
     */
    function UMLAttribute() {
        UMLStructuralFeature.apply(this, arguments);
        this.isDerived = false;
        this.aggregation = AK_NONE;
        this.isID = false;
    }
    // inherits from UMLStructuralFeature
    UMLAttribute.prototype = Object.create(UMLStructuralFeature.prototype);
    UMLAttribute.prototype.constructor = UMLAttribute;

    UMLAttribute.prototype.getPropertyString = function () {
        var props = [];
        if (this.isID === true) { props.push("id"); }
        if (this.isReadOnly === true) { props.push("readOnly"); }
        if (this.isOrdered === true) { props.push("ordered"); }
        if (this.isUnique === true) { props.push("unique"); }
        props = _.union(props, this.getTagStringArray());
        if (props.length > 0) {
            return "{" + props.join(", ") + "}";
        }
        return "";
    };

    UMLAttribute.prototype.getString = function (options) {
        var text = "";
        if (options && (options.stereotypeDisplay === SD_LABEL || options.stereotypeDisplay === SD_DECORATION_LABEL || options.stereotypeDisplay === SD_ICON_LABEL)) {
            text += this.getStereotypeString();
        }
        if (options && options.showVisibility) {
            text += this.getVisibilityString();
        }
        text += (this.isDerived === true ? "/" : "");
        text += this.name;
        if (options && options.showType) {
            text += (this.getTypeString() !== null ? ": " + this.getTypeString() : "");
        }
        if (options && options.showMultiplicity) {
            text += (this.multiplicity.length > 0 ? "[" + this.multiplicity + "]" : "");
        }
        text += (this.defaultValue.length > 0 ? " = " + this.defaultValue : "");
        if (options && options.showProperty) {
            var prop = this.getPropertyString();
            text += (prop.length > 0 ? " " + prop : "");
        }
        return text;
    };


    /**
     * UMLOperation
     * @constructor
     */
    function UMLOperation() {
        UMLBehavioralFeature.apply(this, arguments);
        this.isQuery = false;
        this.isAbstract = false;
        this.specification = '';
        this.preconditions = [];
        this.bodyConditions = [];
        this.postconditions = [];
    }
    // inherits from UMLBehavioralFeature
    UMLOperation.prototype = Object.create(UMLBehavioralFeature.prototype);
    UMLOperation.prototype.constructor = UMLOperation;

    UMLOperation.prototype.getPropertyString = function () {
        var props = [];
        if (this.isQuery === true) { props.push("query"); }
        var returnParam = this.getReturnParameter();
        if (returnParam) {
            if (returnParam.isOrdered === true) { props.push("ordered"); }
            if (returnParam.isUnique === true) { props.push("unique"); }
        }
        props = _.union(props, this.getTagStringArray());
        if (props.length > 0) {
            return "{" + props.join(", ") + "}";
        }
        return "";
    };


    /**
     * UMLClassifier
     * @constructor
     */
    function UMLClassifier() {
        UMLModelElement.apply(this, arguments);
        this.attributes = [];
        this.operations = [];
        this.behaviors = [];
        this.isAbstract = false;
        this.isFinalSpecification = false;
        this.isLeaf = false;
    }
    // inherits from UMLModelElement
    UMLClassifier.prototype = Object.create(UMLModelElement.prototype);
    UMLClassifier.prototype.constructor = UMLClassifier;

    UMLClassifier.prototype.getPropertyString = function () {
        var props = [];
        if (this.isLeaf === true) { props.push("leaf"); }
        props = _.union(props, this.getTagStringArray());
        if (props.length > 0) {
            return "{" + props.join(", ") + "}";
        }
        return "";
    };

    UMLClassifier.prototype.getGeneralElements = function () {
        var self = this,
            rels = Repository.getRelationshipsOf(self, function (r) {
                return (r instanceof type.UMLGeneralization) && (r.source === self);
            });
        return _.map(rels, function (g) { return g.target; });
    };

    UMLClassifier.prototype.getSpecialElements = function () {
        var self = this,
            rels = Repository.getRelationshipsOf(self, function (r) {
                return (r instanceof type.UMLGeneralization) && (r.target === self);
            });
        return _.map(rels, function (g) { return g.source; });
    };

    UMLClassifier.prototype.getAncestors = function () {
        var ancestors = this.getGeneralElements(),
            size = 0;
        do {
            size = ancestors.length;
            _.each(ancestors, function (e) {
                ancestors = _.union(ancestors, e.getGeneralElements());
            });
        } while (size < ancestors.length);
        return ancestors;
    };

    UMLClassifier.prototype.getDescendants = function () {
        var descendants = this.getSpecialElements(),
            size = 0;
        do {
            size = descendants.length;
            _.each(descendants, function (e) {
                descendants = _.union(descendants, e.getSpecialElements());
            });
        } while (size < descendants.length);
        return descendants;
    };

    UMLClassifier.prototype.isGeneralElement = function (elem) {
        return _.contains(this.getGeneralElements(), elem);
    };

    UMLClassifier.prototype.isSpecialElement = function (elem) {
        return _.contains(this.getSpecialElements(), elem);
    };

    UMLClassifier.prototype.isAncestor = function (elem) {
        return _.contains(this.getAncestors(), elem);
    };

    UMLClassifier.prototype.isDescendant = function (elem) {
        return _.contains(this.getDescendants(), elem);
    };

    UMLClassifier.prototype.getInheritedAttributes = function () {
        var ancestors = this.getAncestors(),
            inherited = [];
        _.each(ancestors, function (e) {
            if (Array.isArray(e.attributes)) {
                Array.prototype.push.apply(inherited, e.attributes);
            }
        });
        return inherited;
    };

    UMLClassifier.prototype.getInheritedOperations = function () {
        var ancestors = this.getAncestors(),
            inherited = [];
        _.each(ancestors, function (e) {
            if (Array.isArray(e.operations)) {
                Array.prototype.push.apply(inherited, e.operations);
            }
        });
        return inherited;
    };

    UMLClassifier.prototype.getInterfaces = function () {
        var self = this,
            rels = Repository.getRelationshipsOf(self, function (r) {
                return (r instanceof type.UMLInterfaceRealization) && (r.source === self);
            });
        return _.map(rels, function (g) { return g.target; });
    };

    UMLClassifier.prototype.getComponents = function () {
        var self = this,
            rels = Repository.getRelationshipsOf(self, function (r) {
                return (r instanceof type.UMLComponentRealization) && (r.source === self);
            });
        return _.map(rels, function (g) { return g.target; });
    };

    UMLClassifier.prototype.getDeploymentTargets = function () {
        var self = this,
            rels = Repository.getRelationshipsOf(self, function (r) {
                return (r instanceof type.UMLDeployment) && (r.source === self);
            });
        return _.map(rels, function (g) { return g.target; });
    };

    UMLClassifier.prototype.getAssociationEnds = function (counterpart) {
        var self = this,
            rels = Repository.getRelationshipsOf(self, function (r) { return (r instanceof type.UMLAssociation); }),
            ends = _.map(rels, function (r) {
                if (counterpart === true) {
                    return (r.end1.reference === self ? r.end2 : r.end1);
                } else {
                    return (r.end1.reference === self ? r.end1 : r.end2);
                }
            });
        return ends;
    };

    /**
     * UMLDirectedRelationship
     * @constructor
     */
    function UMLDirectedRelationship() {
        type.DirectedRelationship.apply(this, arguments);
        this.stereotype = null;
        this.visibility = VK_PUBLIC;
        // mixin UMLElementMixin
        _.extend(UMLDirectedRelationship.prototype, UMLElementMixin);
    }
    // inherits from DirectedRelationship
    UMLDirectedRelationship.prototype = Object.create(type.DirectedRelationship.prototype);
    UMLDirectedRelationship.prototype.constructor = UMLDirectedRelationship;


    /**
     * UMLRelationshipEnd
     * @constructor
     */
    function UMLRelationshipEnd() {
        type.RelationshipEnd.apply(this, arguments);
        this.stereotype = null;
        this.visibility = VK_PUBLIC;
        this.navigable = true;
        this.aggregation = AK_NONE;
        this.multiplicity = '';
        this.defaultValue = '';
        this.isReadOnly = false;
        this.isOrdered = false;
        this.isUnique = false;
        this.isDerived = false;
        this.isID = false;
        // mixin UMLElementMixin
        _.extend(UMLRelationshipEnd.prototype, UMLElementMixin);
    }
    // inherits from RelationshipEnd
    UMLRelationshipEnd.prototype = Object.create(type.RelationshipEnd.prototype);
    UMLRelationshipEnd.prototype.constructor = UMLRelationshipEnd;

    UMLRelationshipEnd.prototype.getPropertyString = function () {
        var props = [];
        if (this.isID === true) { props.push("id"); }
        if (this.isReadOnly === true) { props.push("readOnly"); }
        if (this.isOrdered === true) { props.push("ordered"); }
        if (this.isUnique === true) { props.push("unique"); }
        props = _.union(props, this.getTagStringArray());
        if (props.length > 0) {
            return "{" + props.join(", ") + "}";
        }
        return "";
    };


    /**
     * UMLUndirectedRelationship
     * @constructor
     */
    function UMLUndirectedRelationship() {
        type.UndirectedRelationship.apply(this, arguments);
        this.stereotype = null;
        this.visibility = VK_PUBLIC;
        // mixin UMLElementMixin
        _.extend(UMLUndirectedRelationship.prototype, UMLElementMixin);
    }
    // inherits from UndirectedRelationship
    UMLUndirectedRelationship.prototype = Object.create(type.UndirectedRelationship.prototype);
    UMLUndirectedRelationship.prototype.constructor = UMLUndirectedRelationship;

    /**************************************************************************
     *                                                                        *
     *                           COMMON BEHAVIORS                             *
     *                                                                        *
     **************************************************************************/


    /**
     * UMLBehavior
     * @constructor
     */
    function UMLBehavior() {
        UMLModelElement.apply(this, arguments);
        this.isReentrant = true;
        this.parameters = [];
        this.preconditions = [];
        this.postconditions = [];
    }
    // inherits from UMLModelElement
    UMLBehavior.prototype = Object.create(UMLModelElement.prototype);
    UMLBehavior.prototype.constructor = UMLBehavior;


    /**
     * UMLOpaqueBehavior
     * @constructor
     */
    function UMLOpaqueBehavior() {
        UMLBehavior.apply(this, arguments);
    }
    // inherits from UMLBehavior
    UMLOpaqueBehavior.prototype = Object.create(UMLBehavior.prototype);
    UMLOpaqueBehavior.prototype.constructor = UMLOpaqueBehavior;


    /**
     * UMLEvent
     * @constructor
     */
    function UMLEvent() {
        UMLModelElement.apply(this, arguments);
        this.kind = EK_ANYRECEIVE;
        this.value = '';
        this.expression = '';
        this.targetOperation = null;
        this.targetSignal = null;
    }
    // inherits from UMLModelElement
    UMLEvent.prototype = Object.create(UMLModelElement.prototype);
    UMLEvent.prototype.constructor = UMLEvent;

    /**************************************************************************
     *                                                                        *
     *                                  CLASSES                               *
     *                                                                        *
     **************************************************************************/


    /**
     * UMLPackage
     * @constructor
     */
    function UMLPackage() {
        UMLModelElement.apply(this, arguments);
        this.importedElements = [];
    }
    // inherits from UMLModelElement
    UMLPackage.prototype = Object.create(UMLModelElement.prototype);
    UMLPackage.prototype.constructor = UMLPackage;

    UMLPackage.prototype.canContainDiagramKind = function (kind) {
        return (kind === "UMLClassDiagram") ||
               (kind === "UMLPackageDiagram") ||
               (kind === "UMLObjectDiagram") ||
               (kind === "UMLCompositeStructureDiagram") ||
               (kind === "UMLComponentDiagram") ||
               (kind === "UMLDeploymentDiagram") ||
               (kind === "UMLUseCaseDiagram");
    };

    /**
     * UMLModel
     * @constructor
     */
    function UMLModel() {
        UMLPackage.apply(this, arguments);
        this.viewpoint = '';
    }
    // inherits from UMLPackage
    UMLModel.prototype = Object.create(UMLPackage.prototype);
    UMLModel.prototype.constructor = UMLModel;


    /**
     * UMLClass
     * @constructor
     */
    function UMLClass() {
        UMLClassifier.apply(this, arguments);
        this.isActive = false;
    }
    // inherits from UMLClassifier
    UMLClass.prototype = Object.create(UMLClassifier.prototype);
    UMLClass.prototype.constructor = UMLClass;


    /**
     * UMLInterface
     * @constructor
     */
    function UMLInterface() {
        UMLClassifier.apply(this, arguments);
    }
    // inherits from UMLClassifier
    UMLInterface.prototype = Object.create(UMLClassifier.prototype);
    UMLInterface.prototype.constructor = UMLInterface;

    UMLInterface.prototype.getImplementingClassifiers = function () {
        var self = this,
            rels = Repository.getRelationshipsOf(self, function (r) {
                return (r instanceof type.UMLInterfaceRealization) && (r.target === self);
            });
        return _.map(rels, function (g) { return g.source; });
    };

    /**
     * UMLSignal
     * @constructor
     */
    function UMLSignal() {
        UMLClassifier.apply(this, arguments);
    }
    // inherits from UMLClassifier
    UMLSignal.prototype = Object.create(UMLClassifier.prototype);
    UMLSignal.prototype.constructor = UMLSignal;

    /**
     * UMLDataType
     * @constructor
     */
    function UMLDataType() {
        UMLClassifier.apply(this, arguments);
    }
    // inherits from UMLClassifier
    UMLDataType.prototype = Object.create(UMLClassifier.prototype);
    UMLDataType.prototype.constructor = UMLDataType;

    /**
     * UMLPrimitiveType
     * @constructor
     */
    function UMLPrimitiveType() {
        UMLDataType.apply(this, arguments);
    }
    // inherits from UMLDataType
    UMLPrimitiveType.prototype = Object.create(UMLDataType.prototype);
    UMLPrimitiveType.prototype.constructor = UMLPrimitiveType;

    /**
     * UMLEnumerationLiteral
     * @constructor
     */
    function UMLEnumerationLiteral() {
        UMLModelElement.apply(this, arguments);
    }
    // inherits from UMLModelElement
    UMLEnumerationLiteral.prototype = Object.create(UMLModelElement.prototype);
    UMLEnumerationLiteral.prototype.constructor = UMLEnumerationLiteral;

    UMLEnumerationLiteral.prototype.getString = function (options) {
        var text = "";
        if (options && (options.stereotypeDisplay === SD_LABEL || options.stereotypeDisplay === SD_DECORATION_LABEL || options.stereotypeDisplay === SD_ICON_LABEL)) {
            text += this.getStereotypeString();
        }
        text += this.name;
        if (options && options.showProperty) {
            var prop = this.getPropertyString();
            text += (prop.length > 0 ? " " + prop : "");
        }
        return text;
    };


    /**
     * UMLEnumeration
     * @constructor
     */
    function UMLEnumeration() {
        UMLDataType.apply(this, arguments);
        this.literals = [];
    }
    // inherits from UMLDataType
    UMLEnumeration.prototype = Object.create(UMLDataType.prototype);
    UMLEnumeration.prototype.constructor = UMLEnumeration;

    /**
     * UMLDependency
     * @constructor
     */
    function UMLDependency() {
        UMLDirectedRelationship.apply(this, arguments);
        this.mapping = '';
    }
    // inherits from UMLDirectedRelationship
    UMLDependency.prototype = Object.create(UMLDirectedRelationship.prototype);
    UMLDependency.prototype.constructor = UMLDependency;


    /**
     * UMLAbstraction
     * @constructor
     */
    function UMLAbstraction() {
        UMLDependency.apply(this, arguments);
    }
    // inherits from UMLDependency
    UMLAbstraction.prototype = Object.create(UMLDependency.prototype);
    UMLAbstraction.prototype.constructor = UMLAbstraction;


    /**
     * UMLRealization
     * @constructor
     */
    function UMLRealization() {
        UMLAbstraction.apply(this, arguments);
    }
    // inherits from UMLAbstraction
    UMLRealization.prototype = Object.create(UMLAbstraction.prototype);
    UMLRealization.prototype.constructor = UMLRealization;


    /**
     * UMLGeneralization
     * @constructor
     */
    function UMLGeneralization() {
        UMLDirectedRelationship.apply(this, arguments);
        this.discriminator = '';
    }
    // inherits from UMLDirectedRelationship
    UMLGeneralization.prototype = Object.create(UMLDirectedRelationship.prototype);
    UMLGeneralization.prototype.constructor = UMLGeneralization;


    /**
     * UMLInterfaceRealization
     * @constructor
     */
    function UMLInterfaceRealization() {
        UMLRealization.apply(this, arguments);
    }
    // inherits from UMLRealization
    UMLInterfaceRealization.prototype = Object.create(UMLRealization.prototype);
    UMLInterfaceRealization.prototype.constructor = UMLInterfaceRealization;


    /**
     * UMLComponentRealization
     * @constructor
     */
    function UMLComponentRealization() {
        UMLRealization.apply(this, arguments);
    }
    // inherits from UMLRealization
    UMLComponentRealization.prototype = Object.create(UMLRealization.prototype);
    UMLComponentRealization.prototype.constructor = UMLComponentRealization;


    /**
     * UMLAssociationEnd
     * @constructor
     */
    function UMLAssociationEnd() {
        UMLRelationshipEnd.apply(this, arguments);
        this.qualifiers = [];
    }
    // inherits from UMLRelationshipEnd
    UMLAssociationEnd.prototype = Object.create(UMLRelationshipEnd.prototype);
    UMLAssociationEnd.prototype.constructor = UMLAssociationEnd;

    UMLAssociationEnd.prototype.getPropertyString = function () {
        var props = [];
        if (this.isID === true) { props.push("id"); }
        if (this.isReadOnly === true) { props.push("readOnly"); }
        if (this.isOrdered === true) { props.push("ordered"); }
        if (this.isUnique === true) { props.push("unique"); }
        props = _.union(props, this.getTagStringArray());
        if (props.length > 0) {
            return "{" + props.join(", ") + "}";
        }
        return "";
    };

    /**
     * UMLAssociation
     * @constructor
     */
    function UMLAssociation() {
        UMLUndirectedRelationship.apply(this, arguments);
        this.end1 = new UMLAssociationEnd();
        this.end1._parent = this;
        this.end2 = new UMLAssociationEnd();
        this.end2._parent = this;
        this.isDerived = false;
    }
    // inherits from UMLUndirectedRelationship
    UMLAssociation.prototype = Object.create(UMLUndirectedRelationship.prototype);
    UMLAssociation.prototype.constructor = UMLAssociation;


    /**
     * UMLAssociationClassLink
     * @constructor
     */
    function UMLAssociationClassLink() {
        UMLModelElement.apply(this, arguments);
        this.classSide = null;
        this.associationSide = null;
    }
    // inherits from UMLModelElement
    UMLAssociationClassLink.prototype = Object.create(UMLModelElement.prototype);
    UMLAssociationClassLink.prototype.constructor = UMLAssociationClassLink;

    UMLAssociationClassLink.prototype.getNodeText = function () {
        return "(" + this.classSide.name + ")";
    };

    /**************************************************************************
     *                                                                        *
     *                               INSTANCES                                *
     *                                                                        *
     **************************************************************************/

    /**
     * UMLSlot
     * @constructor
     */
    function UMLSlot() {
        UMLModelElement.apply(this, arguments);
        this.definingFeature = null;
        this.value = '';
    }
    // inherits from UMLModelElement
    UMLSlot.prototype = Object.create(UMLModelElement.prototype);
    UMLSlot.prototype.constructor = UMLSlot;


    /**
     * UMLInstance
     * @constructor
     */
    function UMLInstance() {
        UMLModelElement.apply(this, arguments);
        this.classifier = null;
        this.slots = [];
    }
    // inherits from UMLModelElement
    UMLInstance.prototype = Object.create(UMLModelElement.prototype);
    UMLInstance.prototype.constructor = UMLInstance;

    UMLInstance.prototype.getTypeString = function () {
        if (_.isString(this.classifier) && (this.classifier.length > 0)) {
            return this.classifier;
        } else if ((this.classifier !== null) && (this.classifier.name)) {
            return this.classifier.name;
        }
        return null;
    };

    UMLInstance.prototype.getString = function (options) {
        var text = "";
        text += this.name;
        if (options && options.showType) {
            text += (this.getTypeString() !== null ? ": " + this.getTypeString() : "");
        }
        return text;
    };


    /**
     * UMLObject
     * @constructor
     */
    function UMLObject() {
        UMLInstance.apply(this, arguments);
    }
    // inherits from UMLInstance
    UMLObject.prototype = Object.create(UMLInstance.prototype);
    UMLObject.prototype.constructor = UMLObject;


    /**
     * UMLArtifactInstance
     * @constructor
     */
    function UMLArtifactInstance() {
        UMLInstance.apply(this, arguments);
    }
    // inherits from UMLInstance
    UMLArtifactInstance.prototype = Object.create(UMLInstance.prototype);
    UMLArtifactInstance.prototype.constructor = UMLArtifactInstance;

    /**
     * UMLComponentInstance
     * @constructor
     */
    function UMLComponentInstance() {
        UMLInstance.apply(this, arguments);
    }
    // inherits from UMLInstance
    UMLComponentInstance.prototype = Object.create(UMLInstance.prototype);
    UMLComponentInstance.prototype.constructor = UMLComponentInstance;


    /**
     * UMLNodeInstance
     * @constructor
     */
    function UMLNodeInstance() {
        UMLInstance.apply(this, arguments);
    }
    // inherits from UMLInstance
    UMLNodeInstance.prototype = Object.create(UMLInstance.prototype);
    UMLNodeInstance.prototype.constructor = UMLNodeInstance;


    /**
     * UMLLinkEnd
     * @constructor
     */
    function UMLLinkEnd() {
        UMLRelationshipEnd.apply(this, arguments);
    }
    // inherits from UMLRelationshipEnd
    UMLLinkEnd.prototype = Object.create(UMLRelationshipEnd.prototype);
    UMLLinkEnd.prototype.constructor = UMLLinkEnd;


    /**
     * UMLLink
     * @constructor
     */
    function UMLLink() {
        UMLUndirectedRelationship.apply(this, arguments);
        this.end1 = new UMLLinkEnd();
        this.end1._parent = this;
        this.end2 = new UMLLinkEnd();
        this.end2._parent = this;
        this.association = null;
    }
    // inherits from UMLUndirectedRelationship
    UMLLink.prototype = Object.create(UMLUndirectedRelationship.prototype);
    UMLLink.prototype.constructor = UMLLink;

    /**************************************************************************
     *                                                                        *
     *                          COMPOSITE STRUCTURES                          *
     *                                                                        *
     **************************************************************************/


    /**
     * UMLPort
     * @constructor
     */
    function UMLPort() {
        UMLAttribute.apply(this, arguments);
        this.isBehavior = false;
        this.isService = false;
        this.isConjugated = false;
    }
    // inherits from UMLAttribute
    UMLPort.prototype = Object.create(UMLAttribute.prototype);
    UMLPort.prototype.constructor = UMLPort;


    /**
     * UMLConnectorEnd
     * @constructor
     */
    function UMLConnectorEnd() {
        UMLRelationshipEnd.apply(this, arguments);
    }
    // inherits from UMLRelationshipEnd
    UMLConnectorEnd.prototype = Object.create(UMLRelationshipEnd.prototype);
    UMLConnectorEnd.prototype.constructor = UMLConnectorEnd;


    /**
     * UMLConnector
     * @constructor
     */
    function UMLConnector() {
        UMLUndirectedRelationship.apply(this, arguments);
        this.end1 = new UMLConnectorEnd();
        this.end1._parent = this;
        this.end2 = new UMLConnectorEnd();
        this.end2._parent = this;
        this.type = null;
    }
    // inherits from UMLUndirectedRelationship
    UMLConnector.prototype = Object.create(UMLUndirectedRelationship.prototype);
    UMLConnector.prototype.constructor = UMLConnector;


    /**
     * UMLCollaboration
     * @constructor
     */
    function UMLCollaboration() {
        UMLClassifier.apply(this, arguments);
    }
    // inherits from UMLClassifier
    UMLCollaboration.prototype = Object.create(UMLClassifier.prototype);
    UMLCollaboration.prototype.constructor = UMLCollaboration;


    /**
     * UMLCollaborationUse
     * @constructor
     */
    function UMLCollaborationUse() {
        UMLModelElement.apply(this, arguments);
        this.type = null;
    }
    // inherits from UMLModelElement
    UMLCollaborationUse.prototype = Object.create(UMLModelElement.prototype);
    UMLCollaborationUse.prototype.constructor = UMLCollaborationUse;


    /**
     * UMLRoleBinding
     * @constructor
     */
    function UMLRoleBinding() {
        UMLDependency.apply(this, arguments);
        this.roleName = '';
    }
    // inherits from UMLDependency
    UMLRoleBinding.prototype = Object.create(UMLDependency.prototype);
    UMLRoleBinding.prototype.constructor = UMLRoleBinding;

    /**************************************************************************
     *                                                                        *
     *                               COMPONENTS                               *
     *                                                                        *
     **************************************************************************/

    /**
     * UMLArtifact
     * @constructor
     */
    function UMLArtifact() {
        UMLClassifier.apply(this, arguments);
        this.fileName = '';
    }
    // inherits from UMLClassifier
    UMLArtifact.prototype = Object.create(UMLClassifier.prototype);
    UMLArtifact.prototype.constructor = UMLArtifact;

    /**
     * UMLComponent
     * @constructor
     */
    function UMLComponent() {
        UMLClassifier.apply(this, arguments);
        this.isIndirectlyInstantiated = true;
    }
    // inherits from UMLClassifier
    UMLComponent.prototype = Object.create(UMLClassifier.prototype);
    UMLComponent.prototype.constructor = UMLComponent;

    UMLComponent.prototype.getRealizingClassifiers = function () {
        var self = this,
            rels = Repository.getRelationshipsOf(self, function (r) {
                return (r instanceof type.UMLComponentRealization) && (r.target === self);
            });
        return _.map(rels, function (g) { return g.source; });
    };


    /**
     * UMLSubsystem
     * @constructor
     */
    function UMLSubsystem() {
        UMLComponent.apply(this, arguments);
    }
    // inherits from UMLComponent
    UMLSubsystem.prototype = Object.create(UMLComponent.prototype);
    UMLSubsystem.prototype.constructor = UMLSubsystem;

    /**************************************************************************
     *                                                                        *
     *                                DEPLOYMENTS                             *
     *                                                                        *
     **************************************************************************/

    /**
     * UMLNode
     * @constructor
     */
    function UMLNode() {
        UMLClassifier.apply(this, arguments);
    }
    // inherits from UMLClassifier
    UMLNode.prototype = Object.create(UMLClassifier.prototype);
    UMLNode.prototype.constructor = UMLNode;

    UMLNode.prototype.getDeployedElements = function () {
        var self = this,
            rels = Repository.getRelationshipsOf(self, function (r) {
                return (r instanceof type.UMLDeployment) && (r.target === self);
            });
        return _.map(rels, function (g) { return g.source; });
    };

    /**
     * UMLDeployment
     * @constructor
     */
    function UMLDeployment() {
        UMLDependency.apply(this, arguments);
    }
    // inherits from UMLDependency
    UMLDeployment.prototype = Object.create(UMLDependency.prototype);
    UMLDeployment.prototype.constructor = UMLDeployment;


    /**
     * UMLCommunicationPath
     * @constructor
     */
    function UMLCommunicationPath() {
        UMLAssociation.apply(this, arguments);
    }
    // inherits from UMLAssociation
    UMLCommunicationPath.prototype = Object.create(UMLAssociation.prototype);
    UMLCommunicationPath.prototype.constructor = UMLCommunicationPath;

    /**************************************************************************
     *                                                                        *
     *                                USE CASES                               *
     *                                                                        *
     *************************************************************************/

    /**
     * UMLExtensionPoint
     * @constructor
     */
    function UMLExtensionPoint() {
        UMLModelElement.apply(this, arguments);
        this.location = "";
    }
    // inherits from UMLModelElement
    UMLExtensionPoint.prototype = Object.create(UMLModelElement.prototype);
    UMLExtensionPoint.prototype.constructor = UMLExtensionPoint;

    UMLExtensionPoint.prototype.getString = function (options) {
        var text = "";
        if (options && (options.stereotypeDisplay === SD_LABEL || options.stereotypeDisplay === SD_DECORATION_LABEL || options.stereotypeDisplay === SD_ICON_LABEL)) {
            text += this.getStereotypeString();
        }
        text += this.name;
        text += (this.location ? ": " + this.location : "");
        if (options && options.showProperty) {
            var prop = this.getPropertyString();
            text += (prop.length > 0 ? " " + prop : "");
        }
        return text;
    };


    /**
     * UMLUseCase
     * @constructor
     */
    function UMLUseCase() {
        UMLClassifier.apply(this, arguments);
        this.extensionPoints = [];
    }
    // inherits from UMLClassifier
    UMLUseCase.prototype = Object.create(UMLClassifier.prototype);
    UMLUseCase.prototype.constructor = UMLUseCase;

    UMLUseCase.prototype.getActors = function () {
        var associated = _.map(this.getAssociationEnds(true), function (e) { return e.reference; });
        return _.filter(associated, function (asso) { return (asso instanceof type.UMLActor); });
    };

    UMLUseCase.prototype.getIncludedUseCases = function () {
        var self = this,
            rels = Repository.getRelationshipsOf(self, function (r) {
                return (r instanceof type.UMLInclude) && (r.source === self);
            });
        return _.map(rels, function (g) { return g.target; });
    };

    UMLUseCase.prototype.getExtendingUseCases = function () {
        var self = this,
            rels = Repository.getRelationshipsOf(self, function (r) {
                return (r instanceof type.UMLExtend) && (r.target === self);
            });
        return _.map(rels, function (g) { return g.source; });
    };

    UMLUseCase.prototype.getAllIncludedUseCases = function () {
        var includings = this.getIncludedUseCases(),
            size = 0;
        do {
            size = includings.length;
            _.each(includings, function (e) {
                includings = _.union(includings, e.getIncludedUseCases());
            });
        } while (size < includings.length);
        return includings;
    };

    /**
     * UMLActor
     * @constructor
     */
    function UMLActor() {
        UMLClassifier.apply(this, arguments);
    }
    // inherits from UMLClassifier
    UMLActor.prototype = Object.create(UMLClassifier.prototype);
    UMLActor.prototype.constructor = UMLActor;

    UMLActor.prototype.getUseCases = function () {
        var associated = _.map(this.getAssociationEnds(true), function (e) { return e.reference; });
        return _.filter(associated, function (asso) { return (asso instanceof type.UMLUseCase); });
    };


    /**
     * UMLInclude
     * @constructor
     */
    function UMLInclude() {
        UMLDirectedRelationship.apply(this, arguments);
    }
    // inherits from UMLDirectedRelationship
    UMLInclude.prototype = Object.create(UMLDirectedRelationship.prototype);
    UMLInclude.prototype.constructor = UMLInclude;


    /**
     * UMLExtend
     * @constructor
     */
    function UMLExtend() {
        UMLDirectedRelationship.apply(this, arguments);
        this.condition = "";
        this.extensionLocations = [];
    }
    // inherits from UMLDirectedRelationship
    UMLExtend.prototype = Object.create(UMLDirectedRelationship.prototype);
    UMLExtend.prototype.constructor = UMLExtend;

    /**
     * UMLUseCaseSubject
     * @constructor
     */
    function UMLUseCaseSubject() {
        UMLModelElement.apply(this, arguments);
        this.represent = null;
    }
    // inherits from UMLModelElement
    UMLUseCaseSubject.prototype = Object.create(UMLModelElement.prototype);
    UMLUseCaseSubject.prototype.constructor = UMLUseCaseSubject;


    /**************************************************************************
     *                                                                        *
     *                             STATE MACHINES                             *
     *                                                                        *
     *************************************************************************/


    /**
     * UMLStateMachine
     * @constructor
     */
    function UMLStateMachine() {
        UMLBehavior.apply(this, arguments);
        this.regions = [];
    }
    // inherits from UMLBehavior
    UMLStateMachine.prototype = Object.create(UMLBehavior.prototype);
    UMLStateMachine.prototype.constructor = UMLStateMachine;


    /**
     * UMLRegion
     * @constructor
     */
    function UMLRegion() {
        UMLModelElement.apply(this, arguments);
        this.vertices = [];
        this.transitions = [];
    }
    // inherits from UMLModelElement
    UMLRegion.prototype = Object.create(UMLModelElement.prototype);
    UMLRegion.prototype.constructor = UMLRegion;

    UMLRegion.prototype.canContainKind = function (kind) {
        return MetaModelManager.isKindOf(kind, "UMLVertex");
    };


    /**
     * UMLVertex
     * @constructor
     */
    function UMLVertex() {
        UMLModelElement.apply(this, arguments);
    }
    // inherits from UMLModelElement
    UMLVertex.prototype = Object.create(UMLModelElement.prototype);
    UMLVertex.prototype.constructor = UMLVertex;

    UMLVertex.prototype.getIncomingTransitions = function () {
        var self = this,
            rels = Repository.getRelationshipsOf(self, function (r) {
                return (r instanceof type.UMLTransition) && (r.target === self);
            });
        return rels;
    };

    UMLVertex.prototype.getOutgoingTransitions = function () {
        var self = this,
            rels = Repository.getRelationshipsOf(self, function (r) {
                return (r instanceof type.UMLTransition) && (r.source === self);
            });
        return rels;
    };

    /**
     * UMLPseudostate
     * @constructor
     */
    function UMLPseudostate() {
        UMLVertex.apply(this, arguments);
        this.kind = PSK_INITIAL;
    }
    // inherits from UMLVertex
    UMLPseudostate.prototype = Object.create(UMLVertex.prototype);
    UMLPseudostate.prototype.constructor = UMLPseudostate;

    UMLPseudostate.prototype.getNodeIcon = function () {
        switch (this.kind) {
        case PSK_INITIAL:
            return "icon-UMLInitialState";
        case PSK_DEEPHISTORY:
            return "icon-UMLDeepHistory";
        case PSK_SHALLOWHISTORY:
            return "icon-UMLShallowHistory";
        case PSK_JOIN:
            return "icon-UMLJoin";
        case PSK_FORK:
            return "icon-UMLFork";
        case PSK_JUNCTION:
            return "icon-UMLJunction";
        case PSK_CHOICE:
            return "icon-UMLChoice";
        case PSK_ENTRYPOINT:
            return "icon-UMLEntryPoint";
        case PSK_EXITPOINT:
            return "icon-UMLExitPoint";
        case PSK_TERMINATE:
            return "icon-UMLTerminate";
        }
    };


    /**
     * UMLConnectionPointReference
     * @constructor
     */
    function UMLConnectionPointReference() {
        UMLVertex.apply(this, arguments);
        this.entry = [];
        this.exit = [];
    }
    // inherits from UMLVertex
    UMLConnectionPointReference.prototype = Object.create(UMLVertex.prototype);
    UMLConnectionPointReference.prototype.constructor = UMLConnectionPointReference;


    /**
     * UMLState
     * @constructor
     */
    function UMLState() {
        UMLVertex.apply(this, arguments);
        this.regions = [];
        this.entryActivities = [];
        this.doActivities = [];
        this.exitActivities = [];
        this.submachine = null;
        this.connections = [];
    }
    // inherits from UMLVertex
    UMLState.prototype = Object.create(UMLVertex.prototype);
    UMLState.prototype.constructor = UMLState;


    /**
     * UMLFinalState
     * @constructor
     */
    function UMLFinalState() {
        UMLState.apply(this, arguments);
    }
    // inherits from UMLState
    UMLFinalState.prototype = Object.create(UMLState.prototype);
    UMLFinalState.prototype.constructor = UMLFinalState;


    /**
     * UMLTransition
     * @constructor
     */
    function UMLTransition() {
        UMLDirectedRelationship.apply(this, arguments);
        this.kind = TK_EXTERNAL;
        this.guard = '';
        this.triggers = [];
        this.effects = [];
    }
    // inherits from UMLDirectedRelationship
    UMLTransition.prototype = Object.create(UMLDirectedRelationship.prototype);
    UMLTransition.prototype.constructor = UMLTransition;

    UMLTransition.prototype.getString = function () {
        var i, len, text = "";
        // triggers
        if (this.triggers.length > 0) {
            var triggers = [];
            for (i = 0, len = this.triggers.length; i < len; i++) {
                triggers.push(this.triggers[i].name);
            }
            text += triggers.join(", ");
        }
        // guard
        if (this.guard.length > 0) {
            text += " [" + this.guard + "]";
        }
        // effects
        if (this.effects.length > 0) {
            var effects = [];
            for (i = 0, len = this.effects.length; i < len; i++) {
                effects.push(this.effects[i].name);
            }
            text += " / " + effects.join(", ");
        }
        if (text.length > 0) {
            text = this.name + " : " + text;
        } else {
            text = this.name;
        }
        return text;
    };

    /**************************************************************************
     *                                                                        *
     *                                ACTIVITIES                              *
     *                                                                        *
     **************************************************************************/

    /**
     * UMLActivity
     * @constructor
     */
    function UMLActivity() {
        UMLBehavior.apply(this, arguments);
        this.isReadOnly = false;
        this.isSingleExecution = false;
        this.nodes = [];
        this.edges = [];
        this.groups = [];
    }
    // inherits from UMLBehavior
    UMLActivity.prototype = Object.create(UMLBehavior.prototype);
    UMLActivity.prototype.constructor = UMLActivity;


    /**
     * UMLPin
     * @constructor
     */
    function UMLPin() {
        UMLStructuralFeature.apply(this, arguments);
    }
    // inherits from UMLStructuralFeature
    UMLPin.prototype = Object.create(UMLStructuralFeature.prototype);
    UMLPin.prototype.constructor = UMLPin;


    /**
     * UMLInputPin
     * @constructor
     */
    function UMLInputPin() {
        UMLPin.apply(this, arguments);
    }
    // inherits from UMLPin
    UMLInputPin.prototype = Object.create(UMLPin.prototype);
    UMLInputPin.prototype.constructor = UMLInputPin;


    /**
     * UMLOutputPin
     * @constructor
     */
    function UMLOutputPin() {
        UMLPin.apply(this, arguments);
    }
    // inherits from UMLPin
    UMLOutputPin.prototype = Object.create(UMLPin.prototype);
    UMLOutputPin.prototype.constructor = UMLOutputPin;


    /**
     * UMLActivityNode
     * @constructor
     */
    function UMLActivityNode() {
        UMLModelElement.apply(this, arguments);
    }
    // inherits from UMLModelElement
    UMLActivityNode.prototype = Object.create(UMLModelElement.prototype);
    UMLActivityNode.prototype.constructor = UMLActivityNode;

    UMLActivityNode.prototype.getIncomingEdges = function () {
        var self = this,
            rels = Repository.getRelationshipsOf(self, function (r) {
                return (r instanceof type.UMLActivityEdge) && (r.target === self);
            });
        return rels;
    };

    UMLActivityNode.prototype.getOutgoingEdges = function () {
        var self = this,
            rels = Repository.getRelationshipsOf(self, function (r) {
                return (r instanceof type.UMLActivityEdge) && (r.source === self);
            });
        return rels;
    };


    /**
     * UMLAction
     * @constructor
     */
    function UMLAction() {
        UMLActivityNode.apply(this, arguments);
        this.kind = ACK_OPAQUE;
        this.inputs = [];
        this.outputs = [];
        this.triggers = [];
        this.target = null;
        this.subactivity = null;
        this.isLocallyReentrant = false;
        this.isSynchronous = true;
        this.language = '';
        this.body = '';
        this.localPreconditions = [];
        this.localPostconditions = [];
    }
    // inherits from UMLActivityNode
    UMLAction.prototype = Object.create(UMLActivityNode.prototype);
    UMLAction.prototype.constructor = UMLAction;

    UMLAction.prototype.getNodeIcon = function () {
        switch (this.kind) {
        case ACK_OPAQUE:
            return "icon-UMLAction";
        case ACK_CREATE:
            return "icon-UMLAction";
        case ACK_DESTROY:
            return "icon-UMLAction";
        case ACK_READ:
            return "icon-UMLAction";
        case ACK_WRITE:
            return "icon-UMLAction";
        case ACK_INSERT:
            return "icon-UMLAction";
        case ACK_DELETE:
            return "icon-UMLAction";
        case ACK_STRUCTURED:
            return "icon-UMLAction";
        case ACK_SENDSIGNAL:
            return "icon-UMLSendSignal";
        case ACK_ACCEPTSIGNAL:
            return "icon-UMLAcceptSignal";
        case ACK_TRIGGEREVENT:
            return "icon-UMLSendSignal";
        case ACK_ACCEPTEVENT:
            return "icon-UMLAcceptSignal";
        }
    };


    /**
     * UMLObjectNode
     * @constructor
     */
    function UMLObjectNode() {
        UMLActivityNode.apply(this, arguments);
        this.type = null;
        this.isControlType = false;
        this.ordering = ONOK_FIFO;
    }
    // inherits from UMLActivityNode
    UMLObjectNode.prototype = Object.create(UMLActivityNode.prototype);
    UMLObjectNode.prototype.constructor = UMLObjectNode;

    UMLObjectNode.prototype.getTypeString = function () {
        if (_.isString(this.type) && (this.type.length > 0)) {
            return this.type;
        } else if ((this.type !== null) && (this.type.name)) {
            return this.type.name;
        }
        return null;
    };

    UMLObjectNode.prototype.getString = function () {
        var text = "";
        text += this.name;
        text += (this.getTypeString() !== null ? ": " + this.getTypeString() : "");
        return text;
    };


    /**
     * UMLControlNode
     * @constructor
     */
    function UMLControlNode() {
        UMLActivityNode.apply(this, arguments);
    }
    // inherits from UMLActivityNode
    UMLControlNode.prototype = Object.create(UMLActivityNode.prototype);
    UMLControlNode.prototype.constructor = UMLControlNode;


    /**
     * UMLInitialNode
     * @constructor
     */
    function UMLInitialNode() {
        UMLControlNode.apply(this, arguments);
    }
    // inherits from UMLControlNode
    UMLInitialNode.prototype = Object.create(UMLControlNode.prototype);
    UMLInitialNode.prototype.constructor = UMLInitialNode;


    /**
     * UMLFinalNode
     * @constructor
     */
    function UMLFinalNode() {
        UMLControlNode.apply(this, arguments);
    }
    // inherits from UMLControlNode
    UMLFinalNode.prototype = Object.create(UMLControlNode.prototype);
    UMLFinalNode.prototype.constructor = UMLFinalNode;


    /**
     * UMLActivityFinalNode
     * @constructor
     */
    function UMLActivityFinalNode() {
        UMLFinalNode.apply(this, arguments);
    }
    // inherits from UMLFinalNode
    UMLActivityFinalNode.prototype = Object.create(UMLFinalNode.prototype);
    UMLActivityFinalNode.prototype.constructor = UMLActivityFinalNode;


    /**
     * UMLFlowFinalNode
     * @constructor
     */
    function UMLFlowFinalNode() {
        UMLFinalNode.apply(this, arguments);
    }
    // inherits from UMLFinalNode
    UMLFlowFinalNode.prototype = Object.create(UMLFinalNode.prototype);
    UMLFlowFinalNode.prototype.constructor = UMLFlowFinalNode;


    /**
     * UMLForkNode
     * @constructor
     */
    function UMLForkNode() {
        UMLControlNode.apply(this, arguments);
    }
    // inherits from UMLControlNode
    UMLForkNode.prototype = Object.create(UMLControlNode.prototype);
    UMLForkNode.prototype.constructor = UMLForkNode;


    /**
     * UMLJoinNode
     * @constructor
     */
    function UMLJoinNode() {
        UMLControlNode.apply(this, arguments);
    }
    // inherits from UMLControlNode
    UMLJoinNode.prototype = Object.create(UMLControlNode.prototype);
    UMLJoinNode.prototype.constructor = UMLJoinNode;


    /**
     * UMLMergeNode
     * @constructor
     */
    function UMLMergeNode() {
        UMLControlNode.apply(this, arguments);
    }
    // inherits from UMLControlNode
    UMLMergeNode.prototype = Object.create(UMLControlNode.prototype);
    UMLMergeNode.prototype.constructor = UMLMergeNode;


    /**
     * UMLDecisionNode
     * @constructor
     */
    function UMLDecisionNode() {
        UMLControlNode.apply(this, arguments);
    }
    // inherits from UMLControlNode
    UMLDecisionNode.prototype = Object.create(UMLControlNode.prototype);
    UMLDecisionNode.prototype.constructor = UMLDecisionNode;


    /**
     * UMLActivityGroup
     * @constructor
     */
    function UMLActivityGroup() {
        UMLModelElement.apply(this, arguments);
        this.subgroups = [];
    }
    // inherits from UMLModelElement
    UMLActivityGroup.prototype = Object.create(UMLModelElement.prototype);
    UMLActivityGroup.prototype.constructor = UMLActivityGroup;


    /**
     * UMLActivityPartition
     * @constructor
     */
    function UMLActivityPartition() {
        UMLActivityGroup.apply(this, arguments);
    }
    // inherits from UMLActivityGroup
    UMLActivityPartition.prototype = Object.create(UMLActivityGroup.prototype);
    UMLActivityPartition.prototype.constructor = UMLActivityPartition;

    UMLActivityPartition.prototype.getNodeIcon = function () {
        return "icon-UMLSwimlaneVert";
    };


    /**
     * UMLActivityEdge
     * @constructor
     */
    function UMLActivityEdge() {
        UMLDirectedRelationship.apply(this, arguments);
        this.guard = '';
        this.weight = '';
    }
    // inherits from UMLDirectedRelationship
    UMLActivityEdge.prototype = Object.create(UMLDirectedRelationship.prototype);
    UMLActivityEdge.prototype.constructor = UMLActivityEdge;

    UMLActivityEdge.prototype.getString = function () {
        var text = this.name;
        // guard
        if (this.guard.length > 0) {
            text += " [" + this.guard + "]";
        }
        // weight
        if (this.weight.length > 0) {
            text += " {weight=" + this.weight + "}";
        }
        return text;
    };


    /**
     * UMLControlFlow
     * @constructor
     */
    function UMLControlFlow() {
        UMLActivityEdge.apply(this, arguments);
    }
    // inherits from UMLActivityEdge
    UMLControlFlow.prototype = Object.create(UMLActivityEdge.prototype);
    UMLControlFlow.prototype.constructor = UMLControlFlow;


    /**
     * UMLObjectFlow
     * @constructor
     */
    function UMLObjectFlow() {
        UMLActivityEdge.apply(this, arguments);
    }
    // inherits from UMLActivityEdge
    UMLObjectFlow.prototype = Object.create(UMLActivityEdge.prototype);
    UMLObjectFlow.prototype.constructor = UMLObjectFlow;

    /**************************************************************************
     *                                                                        *
     *                               INTERACTIONS                             *
     *                                                                        *
     **************************************************************************/

    /**
     * UMLInteractionFragment
     * @constructor
     */
    function UMLInteractionFragment() {
        UMLBehavior.apply(this, arguments);
    }
    // inherits from UMLBehavior
    UMLInteractionFragment.prototype = Object.create(UMLBehavior.prototype);
    UMLInteractionFragment.prototype.constructor = UMLInteractionFragment;


    /**
     * UMLInteraction
     * @constructor
     */
    function UMLInteraction() {
        UMLInteractionFragment.apply(this, arguments);
        this.messages = [];
        this.participants = [];
        this.fragments = [];
    }
    // inherits from UMLInteractionFragment
    UMLInteraction.prototype = Object.create(UMLInteractionFragment.prototype);
    UMLInteraction.prototype.constructor = UMLInteraction;


    /**
     * UMLStateInvariant
     * @constructor
     */
    function UMLStateInvariant() {
        UMLInteractionFragment.apply(this, arguments);
        this.covered = null;
        this.invariant = '';
    }
    // inherits from UMLInteractionFragment
    UMLStateInvariant.prototype = Object.create(UMLInteractionFragment.prototype);
    UMLStateInvariant.prototype.constructor = UMLStateInvariant;


    /**
     * UMLContinuation
     * @constructor
     */
    function UMLContinuation() {
        UMLInteractionFragment.apply(this, arguments);
        this.setting = false;
    }
    // inherits from UMLInteractionFragment
    UMLContinuation.prototype = Object.create(UMLInteractionFragment.prototype);
    UMLContinuation.prototype.constructor = UMLContinuation;


    /**
     * UMLInteractionOperand
     * @constructor
     */
    function UMLInteractionOperand() {
        UMLInteractionFragment.apply(this, arguments);
        this.guard = '';
    }
    // inherits from UMLInteractionFragment
    UMLInteractionOperand.prototype = Object.create(UMLInteractionFragment.prototype);
    UMLInteractionOperand.prototype.constructor = UMLInteractionOperand;


    /**
     * UMLCombinedFragment
     * @constructor
     */
    function UMLCombinedFragment() {
        UMLInteractionFragment.apply(this, arguments);
        this.interactionOperator = IOK_SEQ;
        this.operands = [];
    }
    // inherits from UMLInteractionFragment
    UMLCombinedFragment.prototype = Object.create(UMLInteractionFragment.prototype);
    UMLCombinedFragment.prototype.constructor = UMLCombinedFragment;


    /**
     * UMLInteractionUse
     * @constructor
     */
    function UMLInteractionUse() {
        UMLInteractionFragment.apply(this, arguments);
        this.refersTo = null;
        this["arguments"] = '';
        this.returnValue = '';
        this.returnValueRecipient = null;
    }
    // inherits from UMLInteractionFragment
    UMLInteractionUse.prototype = Object.create(UMLInteractionFragment.prototype);
    UMLInteractionUse.prototype.constructor = UMLInteractionUse;


    /**
     * UMLMessageEndpoint
     * @constructor
     */
    function UMLMessageEndpoint() {
        UMLModelElement.apply(this, arguments);
    }
    // inherits from UMLModelElement
    UMLMessageEndpoint.prototype = Object.create(UMLModelElement.prototype);
    UMLMessageEndpoint.prototype.constructor = UMLMessageEndpoint;


    /**
     * UMLLifeline
     * @constructor
     */
    function UMLLifeline() {
        UMLMessageEndpoint.apply(this, arguments);
        this.selector = '';
        this.represent = null;
        this.isMultiInstance = false;
    }
    // inherits from UMLMessageEndpoint
    UMLLifeline.prototype = Object.create(UMLMessageEndpoint.prototype);
    UMLLifeline.prototype.constructor = UMLLifeline;

    UMLLifeline.prototype.getTypeString = function () {
        if (this.represent) {
            if (_.isString(this.represent.type) && (this.represent.type.length > 0)) {
                return this.represent.type;
            } else if ((this.represent.type !== null) && (this.represent.type.name)) {
                return this.represent.type.name;
            }
        }
        return null;
    };

    UMLLifeline.prototype.getString = function (options) {
        var text = "";
        text += this.name;
        text += (this.selector.length > 0 ? "[" + this.selector + "]" : "");
        if (options && options.showType) {
            text += (this.getTypeString() !== null ? ": " + this.getTypeString() : "");
        }
        return text;
    };


    /**
     * UMLGate
     * @constructor
     */
    function UMLGate() {
        UMLMessageEndpoint.apply(this, arguments);
    }
    // inherits from UMLMessageEndpoint
    UMLGate.prototype = Object.create(UMLMessageEndpoint.prototype);
    UMLGate.prototype.constructor = UMLGate;


    /**
     * UMLEndpoint
     * @constructor
     */
    function UMLEndpoint() {
        UMLMessageEndpoint.apply(this, arguments);
    }
    // inherits from UMLMessageEndpoint
    UMLEndpoint.prototype = Object.create(UMLMessageEndpoint.prototype);
    UMLEndpoint.prototype.constructor = UMLEndpoint;


    /**
     * UMLMessage
     * @constructor
     */
    function UMLMessage() {
        UMLDirectedRelationship.apply(this, arguments);
        this.messageSort = MS_SYNCHCALL;
        this.signature = null;
        this.connector = null;
        this["arguments"] = '';
        this.assignmentTarget = '';
    }
    // inherits from UMLDirectedRelationship
    UMLMessage.prototype = Object.create(UMLDirectedRelationship.prototype);
    UMLMessage.prototype.constructor = UMLMessage;

    UMLMessage.prototype.getString = function (options) {
        var s = '';
        // Sequence Number
        if (options && options.showSequenceNumber && this._parent && this._parent.messages) {
            s += _.indexOf(this._parent.messages, this) + 1;
            s += " : ";
        }
        // Assignament Target
        if (this.assignmentTarget.length > 0) {
            s += this.assignmentTarget + " = ";
        }
        // Message Signature Part
        if (this.signature instanceof type.UMLOperation) {
            s += this.signature.name;
            if (options && options.showSignature) {
                if (this["arguments"].length > 0) {
                    s += "(" + this["arguments"] + ")";
                } else {
                    s += this.signature.getParametersString(options);
                    var r = this.signature.getReturnString();
                    if (options.showType && r.length > 0) {
                        s += ":" + r;
                    }
                }
            } else {
                s += "()";
            }
        } else if (this.signature instanceof type.UMLSignal) {
            s += this.signature.getString();
            if (options && options.showSignature && this["arguments"].length > 0) {
                s += "(" + this["arguments"] + ")";
            }
        } else {
            s += this.name;
            if (options && options.showSignature && this["arguments"].length > 0) {
                s += "(" + this["arguments"] + ")";
            }
        }
        return s;
    };

    /**************************************************************************
     *                                                                        *
     *                                 PROFILES                               *
     *                                                                        *
     **************************************************************************/

    /**
     * UMLProfile
     * @constructor
     */
    function UMLProfile() {
        UMLPackage.apply(this, arguments);
    }
    // inherits from UMLPackage
    UMLProfile.prototype = Object.create(UMLPackage.prototype);
    UMLProfile.prototype.constructor = UMLProfile;

    UMLProfile.prototype.canContainDiagramKind = function (kind) {
        return (kind === "UMLProfileDiagram");
    };


    /**
     * UMLImage
     * @constructor
     */
    function UMLImage() {
        UMLModelElement.apply(this, arguments);
        this.width = 40;
        this.height = 40;
        this.content = '';
    }
    // inherits from UMLModelElement
    UMLImage.prototype = Object.create(UMLModelElement.prototype);
    UMLImage.prototype.constructor = UMLImage;


    /**
     * UMLStereotype
     * @constructor
     */
    function UMLStereotype() {
        UMLClass.apply(this, arguments);
        this.icon = new UMLImage();
        this.icon._parent = this;
    }
    // inherits from UMLClass
    UMLStereotype.prototype = Object.create(UMLClass.prototype);
    UMLStereotype.prototype.constructor = UMLStereotype;

    /**
     * UMLMetaClass
     * @constructor
     */
    function UMLMetaClass() {
        UMLModelElement.apply(this, arguments);
    }
    // inherits from UMLModelElement
    UMLMetaClass.prototype = Object.create(UMLModelElement.prototype);
    UMLMetaClass.prototype.constructor = UMLMetaClass;

    /**
     * UMLExtension
     * @constructor
     */
    function UMLExtension() {
        UMLDirectedRelationship.apply(this, arguments);
    }
    // inherits from UMLDirectedRelationship
    UMLExtension.prototype = Object.create(UMLDirectedRelationship.prototype);
    UMLExtension.prototype.constructor = UMLExtension;

    /* ************************** Type definitions ***************************/

    // Backbone
    type.UMLModelElement             = UMLModelElement;
    type.UMLConstraint               = UMLConstraint;
    type.UMLTemplateParameter        = UMLTemplateParameter;
    type.UMLFeature                  = UMLFeature;
    type.UMLStructuralFeature        = UMLStructuralFeature;
    type.UMLParameter                = UMLParameter;
    type.UMLBehavioralFeature        = UMLBehavioralFeature;
    type.UMLAttribute                = UMLAttribute;
    type.UMLOperation                = UMLOperation;
    type.UMLClassifier               = UMLClassifier;
    type.UMLDirectedRelationship     = UMLDirectedRelationship;
    type.UMLRelationshipEnd          = UMLRelationshipEnd;
    type.UMLUndirectedRelationship   = UMLUndirectedRelationship;
    // Common Behaviors
    type.UMLBehavior                 = UMLBehavior;
    type.UMLOpaqueBehavior           = UMLOpaqueBehavior;
    type.UMLEvent                    = UMLEvent;
    // Classes
    type.UMLPackage                  = UMLPackage;
    type.UMLModel                    = UMLModel;
    type.UMLClass                    = UMLClass;
    type.UMLInterface                = UMLInterface;
    type.UMLSignal                   = UMLSignal;
    type.UMLDataType                 = UMLDataType;
    type.UMLPrimitiveType            = UMLPrimitiveType;
    type.UMLEnumerationLiteral       = UMLEnumerationLiteral;
    type.UMLEnumeration              = UMLEnumeration;
    type.UMLDependency               = UMLDependency;
    type.UMLAbstraction              = UMLAbstraction;
    type.UMLRealization              = UMLRealization;
    type.UMLGeneralization           = UMLGeneralization;
    type.UMLInterfaceRealization     = UMLInterfaceRealization;
    type.UMLAssociationEnd           = UMLAssociationEnd;
    type.UMLAssociation              = UMLAssociation;
    type.UMLAssociationClassLink     = UMLAssociationClassLink;
    // Instances
    type.UMLSlot                     = UMLSlot;
    type.UMLInstance                 = UMLInstance;
    type.UMLObject                   = UMLObject;
    type.UMLArtifactInstance         = UMLArtifactInstance;
    type.UMLComponentInstance        = UMLComponentInstance;
    type.UMLNodeInstance             = UMLNodeInstance;
    type.UMLLinkEnd                  = UMLLinkEnd;
    type.UMLLink                     = UMLLink;
    // Composite Structures
    type.UMLPort                     = UMLPort;
    type.UMLConnectorEnd             = UMLConnectorEnd;
    type.UMLConnector                = UMLConnector;
    type.UMLCollaboration            = UMLCollaboration;
    type.UMLCollaborationUse         = UMLCollaborationUse;
    type.UMLRoleBinding              = UMLRoleBinding;
    // Components
    type.UMLArtifact                 = UMLArtifact;
    type.UMLComponent                = UMLComponent;
    type.UMLSubsystem                = UMLSubsystem;
    type.UMLComponentRealization     = UMLComponentRealization;
    // Deployments
    type.UMLNode                     = UMLNode;
    type.UMLDeployment               = UMLDeployment;
    type.UMLCommunicationPath        = UMLCommunicationPath;
    // Use Cases
    type.UMLExtensionPoint           = UMLExtensionPoint;
    type.UMLUseCase                  = UMLUseCase;
    type.UMLActor                    = UMLActor;
    type.UMLInclude                  = UMLInclude;
    type.UMLExtend                   = UMLExtend;
    type.UMLUseCaseSubject           = UMLUseCaseSubject;
    // State Machines
    type.UMLStateMachine             = UMLStateMachine;
    type.UMLRegion                   = UMLRegion;
    type.UMLVertex                   = UMLVertex;
    type.UMLConnectionPointReference = UMLConnectionPointReference;
    type.UMLPseudostate              = UMLPseudostate;
    type.UMLState                    = UMLState;
    type.UMLFinalState               = UMLFinalState;
    type.UMLTransition               = UMLTransition;
    // Activity Graphs
    type.UMLActivity                 = UMLActivity;
    type.UMLPin                      = UMLPin;
    type.UMLInputPin                 = UMLInputPin;
    type.UMLOutputPin                = UMLOutputPin;
    type.UMLActivityNode             = UMLActivityNode;
    type.UMLAction                   = UMLAction;
    type.UMLObjectNode               = UMLObjectNode;
    type.UMLControlNode              = UMLControlNode;
    type.UMLInitialNode              = UMLInitialNode;
    type.UMLFinalNode                = UMLFinalNode;
    type.UMLActivityFinalNode        = UMLActivityFinalNode;
    type.UMLFlowFinalNode            = UMLFlowFinalNode;
    type.UMLForkNode                 = UMLForkNode;
    type.UMLJoinNode                 = UMLJoinNode;
    type.UMLMergeNode                = UMLMergeNode;
    type.UMLDecisionNode             = UMLDecisionNode;
    type.UMLActivityGroup            = UMLActivityGroup;
    type.UMLActivityPartition        = UMLActivityPartition;
    type.UMLActivityEdge             = UMLActivityEdge;
    type.UMLControlFlow              = UMLControlFlow;
    type.UMLObjectFlow               = UMLObjectFlow;
    // Interactions
    type.UMLInteractionFragment      = UMLInteractionFragment;
    type.UMLInteraction              = UMLInteraction;
    type.UMLStateInvariant           = UMLStateInvariant;
    type.UMLContinuation             = UMLContinuation;
    type.UMLInteractionOperand       = UMLInteractionOperand;
    type.UMLCombinedFragment         = UMLCombinedFragment;
    type.UMLInteractionUse           = UMLInteractionUse;
    type.UMLMessageEndpoint          = UMLMessageEndpoint;
    type.UMLLifeline                 = UMLLifeline;
    type.UMLGate                     = UMLGate;
    type.UMLEndpoint                 = UMLEndpoint;
    type.UMLMessage                  = UMLMessage;
    // Profiles
    type.UMLProfile                  = UMLProfile;
    type.UMLImage                    = UMLImage;
    type.UMLStereotype               = UMLStereotype;
    type.UMLMetaClass                = UMLMetaClass;
    type.UMLExtension                = UMLExtension;

    // Public API
    exports.VK_PUBLIC          = VK_PUBLIC;
    exports.VK_PROTECTED       = VK_PROTECTED;
    exports.VK_PRIVATE         = VK_PRIVATE;
    exports.VK_PACKAGE         = VK_PACKAGE;

    exports.AK_NONE            = AK_NONE;
    exports.AK_SHARED          = AK_SHARED;
    exports.AK_COMPOSITE       = AK_COMPOSITE;

    exports.DK_IN              = DK_IN;
    exports.DK_INOUT           = DK_INOUT;
    exports.DK_OUT             = DK_OUT;
    exports.DK_RETURN          = DK_RETURN;

    exports.CCK_SEQUENTIAL     = CCK_SEQUENTIAL;
    exports.CCK_GUARDED        = CCK_GUARDED;
    exports.CCK_CONCURRENT     = CCK_CONCURRENT;

    exports.MS_SYNCHCALL       = MS_SYNCHCALL;
    exports.MS_ASYNCHCALL      = MS_ASYNCHCALL;
    exports.MS_ASYNCHSIGNAL    = MS_ASYNCHSIGNAL;
    exports.MS_CREATEMESSAGE   = MS_CREATEMESSAGE;
    exports.MS_DELETEMESSAGE   = MS_DELETEMESSAGE;
    exports.MS_REPLY           = MS_REPLY;

    exports.PSK_INITIAL         = PSK_INITIAL;
    exports.PSK_DEEPHISTORY     = PSK_DEEPHISTORY;
    exports.PSK_SHALLOWHISTORY  = PSK_SHALLOWHISTORY;
    exports.PSK_JOIN            = PSK_JOIN;
    exports.PSK_FORK            = PSK_FORK;
    exports.PSK_JUNCTION        = PSK_JUNCTION;
    exports.PSK_CHOICE          = PSK_CHOICE;
    exports.PSK_ENTRYPOINT      = PSK_ENTRYPOINT;
    exports.PSK_EXITPOINT       = PSK_EXITPOINT;
    exports.PSK_TERMINATE       = PSK_TERMINATE;

    exports.TK_EXTERNAL         = TK_EXTERNAL;
    exports.TK_INTERNAL         = TK_INTERNAL;
    exports.TK_LOCAL            = TK_LOCAL;

    exports.EK_SIGNAL           = EK_SIGNAL;
    exports.EK_CALL             = EK_CALL;
    exports.EK_CHANGE           = EK_CHANGE;
    exports.EK_TIME             = EK_TIME;
    exports.EK_ANYRECEIVE       = EK_ANYRECEIVE;

    exports.IOK_ALT            = IOK_ALT;
    exports.IOK_OPT            = IOK_OPT;
    exports.IOK_PAR            = IOK_PAR;
    exports.IOK_LOOP           = IOK_LOOP;
    exports.IOK_CRITICAL       = IOK_CRITICAL;
    exports.IOK_NEG            = IOK_NEG;
    exports.IOK_ASSERT         = IOK_ASSERT;
    exports.IOK_STRICT         = IOK_STRICT;
    exports.IOK_SEQ            = IOK_SEQ;
    exports.IOK_IGNORE         = IOK_IGNORE;
    exports.IOK_CONSIDER       = IOK_CONSIDER;

    exports.ACK_OPAQUE       = ACK_OPAQUE;
    exports.ACK_CREATE       = ACK_CREATE;
    exports.ACK_DESTROY      = ACK_DESTROY;
    exports.ACK_READ         = ACK_READ;
    exports.ACK_WRITE        = ACK_WRITE;
    exports.ACK_INSERT       = ACK_INSERT;
    exports.ACK_DELETE       = ACK_DELETE;
    exports.ACK_SENDSIGNAL   = ACK_SENDSIGNAL;
    exports.ACK_ACCEPTSIGNAL = ACK_ACCEPTSIGNAL;
    exports.ACK_TRIGGEREVENT = ACK_TRIGGEREVENT;
    exports.ACK_ACCEPTEVENT  = ACK_ACCEPTEVENT;
    exports.ACK_STRUCTURED   = ACK_STRUCTURED;

    exports.ONOK_UNORDERED = ONOK_UNORDERED;
    exports.ONOK_ORDERED   = ONOK_ORDERED;
    exports.ONOK_LIFO      = ONOK_LIFO;
    exports.ONOK_FIFO      = ONOK_FIFO;

    exports.SD_NONE             = SD_NONE;
    exports.SD_LABEL            = SD_LABEL;
    exports.SD_DECORATION       = SD_DECORATION;
    exports.SD_DECORATION_LABEL = SD_DECORATION_LABEL;
    exports.SD_ICON             = SD_ICON;
    exports.SD_ICON_LABEL       = SD_ICON_LABEL;

});
