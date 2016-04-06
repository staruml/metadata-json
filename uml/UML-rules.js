/*
 * Copyright (c) 2014 MKLab. All rights reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 *
 */


/*jslint vars: true, plusplus: true, devel: true, browser: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, _, type, meta*/

define(function (require, exports, module) {
    "use strict";

    var Validator = require("core/Validator");

    var rules = [
        {
            id: "UML001",
            message: "Name expected.",
            appliesTo: [ "UMLModelElement" ],
            exceptions: [ "UMLDirectedRelationship", "UMLRelationshipEnd", "UMLUndirectedRelationship", "UMLAssociationClassLink", "UMLRegion", "UMLPseudostate", "UMLFinalState", "UMLControlNode", "UMLEndpoint", "UMLGate", "UMLImage", "UMLLifeline", "UMLInstance" ],
            constraint: function (elem) {
                if (elem instanceof type.UMLParameter) {
                    return (elem.direction === "return" ? true : elem.name.length > 0);
                } else {
                    return (elem.name.length > 0);
                }
            }
        },
        {
            id: "UML002",
            message: "Name is already defined.",
            appliesTo: [ "UMLModelElement" ],
            exceptions: [ "UMLOperation" ],
            constraint: function (elem) {
                var parent   = elem._parent,
                    field    = elem.getParentField(),
                    siblings = parent[field],
                    i,
                    len;
                for (i = 0, len = siblings.length; i < len; i++) {
                    var sibling = siblings[i];
                    if (elem !== sibling && elem.name.length > 0 && elem.name === sibling.name) {
                        return false;
                    }
                }
                return true;
            }
        },
        {
            id: "UML003",
            message: "Conflict with inherited attributes.",
            appliesTo: [ "UMLAttribute" ],
            constraint: function (elem) {
                if (elem._parent instanceof type.UMLClassifier) {
                    var inherited = elem._parent.getInheritedAttributes(),
                        names     = _.map(inherited, function (e) { return e.name; });
                    return !_.contains(names, elem.name);
                }
                return true;
            }
        },
        {
            id: "UML004",
            message: "Signature conflict.",
            appliesTo: [ "UMLOperation" ],
            constraint: function (elem) {
                var options = {
                        stereotypeDisplay: "none",
                        showVisibility: false,
                        showProperty: false,
                        showType: true,
                        showOperationSignature: true
                    },
                    signature = elem.getString(options);
                if (elem._parent.operations) {
                    var i, len;
                    for (i = 0, len = elem._parent.operations.length; i < len; i++) {
                        var op  = elem._parent.operations[i],
                            sig = op.getString(options);
                        if (op !== elem && sig === signature) {
                            return false;
                        }
                    }
                }
                return true;
            }
        },
        {
            id: "UML006",
            message: "Final and leaf element must not have child.",
            appliesTo: [ "UMLClassifier" ],
            constraint: function (elem) {
                if (elem.isFinalSpecialization === true || elem.isLeaf === true) {
                    var subs = elem.getSpecialElements();
                    return (subs.length === 0);
                }
                return true;
            }
        },
        {
            id: "UML007",
            message: "Duplicated generalizations.",
            appliesTo: [ "UMLClassifier" ],
            constraint: function (elem) {
                var gens = elem.getGeneralElements();
                return (gens.length === _.uniq(gens).length);
            }
        },
        {
            id: "UML008",
            message: "Circular generalizations.",
            appliesTo: [ "UMLClassifier" ],
            constraint: function (elem) {
                var ancestors = elem.getAncestors();
                return (!_.contains(ancestors, elem));
            }
        },
        {
            id: "UML009",
            message: "Duplicated realizations.",
            appliesTo: [ "UMLClassifier" ],
            constraint: function (elem) {
                var reals = elem.getInterfaces();
                return (reals.length === _.uniq(reals).length);
            }
        },
        {
            id: "UML010",
            message: "Duplicated role names of associated classifiers.",
            appliesTo: [ "UMLClassifier" ],
            constraint: function (elem) {
                var ends  = elem.getAssociationEnds(true), // get counterpart ends.
                    names = [];
                _.each(ends, function (e) {
                    if (e.navigable && e.name) {
                        names.push(e.name);
                    }
                });
                _.map(ends, function (e) { return e.name; });
                return (names.length === _.uniq(names).length);
            }
        },
        {
            id: "UML011",
            message: "All attributes and operations of interface must be public.",
            appliesTo: [ "UMLInterface" ],
            constraint: function (elem) {
                function bePublic(e) {
                    return e.visibility === "public";
                }
                return _.every(elem.attributes, bePublic) && _.every(elem.operations, bePublic);
            }
        },
        {
            id: "UML012",
            message: "Aggregation must be one in an association.",
            appliesTo: [ "UMLAssociation" ],
            constraint: function (elem) {
                function isAggregation(e) {
                    return e.aggregation === "shared" || e.aggregation === "composite";
                }
                return !(isAggregation(elem.end1) && isAggregation(elem.end2));
            }
        },
        {
            id: "UML013",
            message: "Type of an artifact instance must be an artifact.",
            appliesTo: [ "UMLArtifactInstance" ],
            constraint: function (elem) {
                return (!elem.classifier || elem.classifier instanceof type.UMLArtifact);
            }
        },
        {
            id: "UML014",
            message: "Type of a component instance must be a component.",
            appliesTo: [ "UMLComponentInstance" ],
            constraint: function (elem) {
                return (!elem.classifier || elem.classifier instanceof type.UMLComponent);
            }
        },
        {
            id: "UML015",
            message: "Type of a node instance must be a node.",
            appliesTo: [ "UMLNodeInstance" ],
            constraint: function (elem) {
                return (!elem.classifier || elem.classifier instanceof type.UMLNode);
            }
        },
        {
            id: "UML016",
            message: "A metaclass must have name defined in metamodel.",
            appliesTo: [ "UMLMetaClass" ],
            constraint: function (elem) {
                return (meta[elem.name]);
            }
        },
        {
            id: "UML017",
            message: "A stereotype must inherits from stereotype.",
            appliesTo: [ "UMLStereotype" ],
            constraint: function (elem) {
                var gens = elem.getGeneralElements();
                return _.every(gens, function (g) { return (g instanceof type.UMLStereotype); });
            }
        },
        {
            id: "UML018",
            message: "A stereotype must contained by a profile.",
            appliesTo: [ "UMLStereotype" ],
            constraint: function (elem) {
                var found = false;
                elem.traverseUp(function (e) {
                    if (e instanceof type.UMLProfile) { found = true; }
                });
                return found;
            }
        },
        {
            id: "UML019",
            message: "An actor only can associate with use cases, components, and classes.",
            appliesTo: [ "UMLActor" ],
            constraint: function (elem) {
                var ends = elem.getAssociationEnds(true);
                return _.every(ends, function (e) {
                    return (e.reference instanceof type.UMLUseCase) ||
                           (e.reference instanceof type.UMLComponent) ||
                           (e.reference instanceof type.UMLClass);
                });
            }
        },
        {
            id: "UML020",
            message: "A use case cannot include use cases that directly or indirectly include it.",
            appliesTo: [ "UMLUseCase" ],
            constraint: function (elem) {
                var includings = elem.getAllIncludedUseCases();
                return (!_.contains(includings, elem));
            }
        },
        {
            id: "UML021",
            message: "An initial vertex can have at most one outgoing transition.",
            appliesTo: [ "UMLPseudostate" ],
            constraint: function (elem) {
                if (elem.kind === 'initial') {
                    return (elem.getOutgoingTransitions().length <= 1);
                }
                return true;
            }
        },
        {
            id: "UML022",
            message: "The outgoing transition from an initial vertex must not have a trigger or guard.",
            appliesTo: [ "UMLPseudostate" ],
            constraint: function (elem) {
                if (elem.kind === 'initial') {
                    var outs = elem.getOutgoingTransitions();
                    return _.every(outs, function (t) {
                        return (t.triggers.length === 0) && (!t.guard);
                    });
                }
                return true;
            }
        },
        {
            id: "UML023",
            message: "History vertices can have at most one outgoing transition.",
            appliesTo: [ "UMLPseudostate" ],
            constraint: function (elem) {
                if (elem.kind === 'deepHistory' || elem.kind === 'shallowHistory') {
                    return (elem.getOutgoingTransitions().length <= 1);
                }
                return true;
            }
        },
        {
            id: "UML024",
            message: "A join vertex must have at least two incoming transitions and exactly one outgoing transition.",
            appliesTo: [ "UMLPseudostate" ],
            constraint: function (elem) {
                if (elem.kind === 'join') {
                    return (elem.getIncomingTransitions().length >= 2) &&
                           (elem.getOutgoingTransitions().length === 1);
                }
                return true;
            }
        },
        {
            id: "UML025",
            message: "A fork vertex must have at least two outgoing transitions and exactly one incoming transition.",
            appliesTo: [ "UMLPseudostate" ],
            constraint: function (elem) {
                if (elem.kind === 'fork') {
                    return (elem.getOutgoingTransitions().length >= 2) &&
                           (elem.getIncomingTransitions().length === 1);
                }
                return true;
            }
        },
        {
            id: "UML026",
            message: "A junction vertex must have at least one incoming and one outgoing transition.",
            appliesTo: [ "UMLPseudostate" ],
            constraint: function (elem) {
                if (elem.kind === 'junction') {
                    return (elem.getOutgoingTransitions().length >= 1) &&
                           (elem.getIncomingTransitions().length >= 1);
                }
                return true;
            }
        },
        {
            id: "UML027",
            message: "A choice vertex must have at least one incoming and one outgoing transition.",
            appliesTo: [ "UMLPseudostate" ],
            constraint: function (elem) {
                if (elem.kind === 'choice') {
                    return (elem.getOutgoingTransitions().length >= 1) &&
                           (elem.getIncomingTransitions().length === 1);
                }
                return true;
            }
        },
        {
            id: "UML028",
            message: "Only submachine states can have connection point references.",
            appliesTo: [ "UMLState" ],
            constraint: function (elem) {
                if (elem.connections.length > 0) {
                    return (elem.submachine instanceof type.UMLStateMachine);
                }
                return true;
            }
        },
        {
            id: "UML029",
            message: "A state is not allowed to have both a submachine and regions.",
            appliesTo: [ "UMLState" ],
            constraint: function (elem) {
                return !(elem.regions.length > 0 && elem.submachine instanceof type.UMLStateMachine);
            }
        },
        {
            id: "UML030",
            message: "A region can have at most one initial vertex.",
            appliesTo: [ "UMLRegion" ],
            constraint: function (elem) {
                var vs = _.filter(elem.vertices, function (v) {
                    return (v instanceof type.UMLPseudostate) && (v.kind === 'initial');
                });
                return vs.length <= 1;
            }
        },
        {
            id: "UML031",
            message: "A region can have at most one deep history vertex.",
            appliesTo: [ "UMLRegion" ],
            constraint: function (elem) {
                var vs = _.filter(elem.vertices, function (v) {
                    return (v instanceof type.UMLPseudostate) && (v.kind === 'deepHistory');
                });
                return vs.length <= 1;
            }
        },
        {
            id: "UML032",
            message: "A region can have at most one shallow history vertex.",
            appliesTo: [ "UMLRegion" ],
            constraint: function (elem) {
                var vs = _.filter(elem.vertices, function (v) {
                    return (v instanceof type.UMLPseudostate) && (v.kind === 'shallowHistory');
                });
                return vs.length <= 1;
            }
        },
        {
            id: "UML033",
            message: "A final state cannot have any outgoing transitions.",
            appliesTo: [ "UMLFinalState" ],
            constraint: function (elem) {
                return (elem.getOutgoingTransitions().length === 0);
            }
        },
        {
            id: "UML034",
            message: "A final state cannot have regions.",
            appliesTo: [ "UMLFinalState" ],
            constraint: function (elem) {
                return (elem.regions.length === 0);
            }
        },
        {
            id: "UML035",
            message: "A final state cannot reference a submachine.",
            appliesTo: [ "UMLFinalState" ],
            constraint: function (elem) {
                return (!elem.submachine);
            }
        },
        {
            id: "UML036",
            message: "A final state has no entry behavior.",
            appliesTo: [ "UMLFinalState" ],
            constraint: function (elem) {
                return (elem.entryActivities.length === 0);
            }
        },
        {
            id: "UML037",
            message: "A final state has no exit behavior.",
            appliesTo: [ "UMLFinalState" ],
            constraint: function (elem) {
                return (elem.exitActivities.length === 0);
            }
        },
        {
            id: "UML038",
            message: "A final state has no state (doActivity) behavior.",
            appliesTo: [ "UMLFinalState" ],
            constraint: function (elem) {
                return (elem.doActivities.length === 0);
            }
        },
        {
            id: "UML039",
            message: "A fork segment must not have guards or triggers.",
            appliesTo: [ "UMLTransition" ],
            constraint: function (elem) {
                if (elem.source instanceof type.UMLPseudostate && elem.source.kind === 'fork') {
                    return (elem.triggers.length === 0) && (!elem.guard);
                }
                return true;
            }
        },
        {
            id: "UML040",
            message: "A join segment must not have guards or triggers.",
            appliesTo: [ "UMLTransition" ],
            constraint: function (elem) {
                if (elem.target instanceof type.UMLPseudostate && elem.target.kind === 'join') {
                    return (elem.triggers.length === 0) && (!elem.guard);
                }
                return true;
            }
        },
        {
            id: "UML041",
            message: "A fork segment must always target a state.",
            appliesTo: [ "UMLTransition" ],
            constraint: function (elem) {
                if (elem.source instanceof type.UMLPseudostate && elem.source.kind === 'fork') {
                    return (elem.target instanceof type.UMLState);
                }
                return true;
            }
        },
        {
            id: "UML042",
            message: "A join segment must always originate from a state.",
            appliesTo: [ "UMLTransition" ],
            constraint: function (elem) {
                if (elem.target instanceof type.UMLPseudostate && elem.target.kind === 'join') {
                    return (elem.source instanceof type.UMLState);
                }
                return true;
            }
        },
        {
            id: "UML043",
            message: "Transitions outgoing pseudostates may not have a trigger (except for those coming out of the initial pseudostate).",
            appliesTo: [ "UMLTransition" ],
            constraint: function (elem) {
                if (elem.source instanceof type.UMLPseudostate && elem.source.kind !== 'initial') {
                    return (elem.triggers.length === 0);
                }
                return true;
            }
        },
        {
            id: "UML044",
            message: "The classifier context of a state machine cannot be an interface.",
            appliesTo: [ "UMLStateMachine" ],
            constraint: function (elem) {
                return !(elem._parent instanceof type.UMLInterface);
            }
        },
        {
            id: "UML045",
            message: "A decision node has one or two incoming edges and at least one outgoing edge.",
            appliesTo: [ "UMLDecisionNode" ],
            constraint: function (elem) {
                return (elem.getIncomingEdges().length === 1 || elem.getIncomingEdges().length === 2) &&
                       (elem.getOutgoingEdges().length >= 1);
            }
        },
        {
            id: "UML046",
            message: "A merge node has one outgoing edge.",
            appliesTo: [ "UMLMergeNode" ],
            constraint: function (elem) {
                return (elem.getOutgoingEdges().length === 1);
            }
        },
        {
            id: "UML047",
            message: "The edges coming into and out of a merge node must be either all object flows or all control flows.",
            appliesTo: [ "UMLMergeNode" ],
            constraint: function (elem) {
                var edges = _.union(elem.getIncomingEdges(), elem.getOutgoingEdges());
                return _.every(edges, function (e) { return (e instanceof type.UMLControlFlow); }) ||
                       _.every(edges, function (e) { return (e instanceof type.UMLObjectFlow); });
            }
        },
        {
            id: "UML048",
            message: "An initial node has no incoming edges.",
            appliesTo: [ "UMLInitialNode" ],
            constraint: function (elem) {
                return (elem.getIncomingEdges().length === 0);
            }
        },
        {
            id: "UML049",
            message: "Only control edges can have initial nodes as source.",
            appliesTo: [ "UMLInitialNode" ],
            constraint: function (elem) {
                return _.every(elem.getOutgoingEdges(), function (e) { return (e instanceof type.UMLControlFlow); });
            }
        },
        {
            id: "UML050",
            message: "A final node has no outgoing edges.",
            appliesTo: [ "UMLFinalNode" ],
            constraint: function (elem) {
                return (elem.getOutgoingEdges().length === 0);
            }
        },
        {
            id: "UML051",
            message: "A fork node has one incoming edge.",
            appliesTo: [ "UMLForkNode" ],
            constraint: function (elem) {
                return (elem.getIncomingEdges().length === 1);
            }
        },
        {
            id: "UML052",
            message: "The edges coming into and out of a fork node must be either all object flows or all control flows.",
            appliesTo: [ "UMLForkNode" ],
            constraint: function (elem) {
                var edges = _.union(elem.getIncomingEdges(), elem.getOutgoingEdges());
                return _.every(edges, function (e) { return (e instanceof type.UMLControlFlow); }) ||
                       _.every(edges, function (e) { return (e instanceof type.UMLObjectFlow); });
            }
        },
        {
            id: "UML053",
            message: "A join node has one outgoing edge.",
            appliesTo: [ "UMLJoinNode" ],
            constraint: function (elem) {
                return (elem.getOutgoingEdges().length === 1);
            }
        },
        {
            id: "UML054",
            message: "The edges coming into and out of a join node must be either all object flows or all control flows.",
            appliesTo: [ "UMLJoinNode" ],
            constraint: function (elem) {
                var edges = _.union(elem.getIncomingEdges(), elem.getOutgoingEdges());
                return _.every(edges, function (e) { return (e instanceof type.UMLControlFlow); }) ||
                       _.every(edges, function (e) { return (e instanceof type.UMLObjectFlow); });
            }
        },
        {
            id: "UML055",
            message: "All edges coming into or going out of object nodes must be object flow edges.",
            appliesTo: [ "UMLObjectNode" ],
            constraint: function (elem) {
                var edges = _.union(elem.getIncomingEdges(), elem.getOutgoingEdges());
                return _.every(edges, function (e) { return (e instanceof type.UMLObjectFlow); });
            }
        },
        {
            id: "UML056",
            message: "Control flows may not have object nodes at either end, except for object nodes with control type.",
            appliesTo: [ "UMLControlFlow" ],
            constraint: function (elem) {
                if (elem.source instanceof type.UMLObjectNode && elem.target instanceof type.UMLObjectNode) {
                    return (elem.source.isControlType || elem.target.isControlType);
                }
                return true;
            }
        },
        {
            id: "UML057",
            message: "Object flows may not have actions at either end.",
            appliesTo: [ "UMLObjectFlow" ],
            constraint: function (elem) {
                return !(elem.source instanceof type.UMLAction && elem.target instanceof type.UMLAction);
            }
        }
    ];

    Validator.addRules(rules);

});
