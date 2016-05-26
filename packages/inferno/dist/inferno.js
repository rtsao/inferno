/*!
 * inferno v0.7.7
 * (c) 2016 Dominic Gannaway
 * Released under the MIT License.
 */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.Inferno = factory());
}(this, function () { 'use strict';

    var VElement = function VElement(tag) {
        this._dom = null;
        this._children = null;
        this._key = null;
        this._props = null;
        this._attrs = null;
        this._events = null;
        this._hooks = null;
        this._text = null;
        this._ref = null;
        this._isKeyed = false;
        this._tag = tag;
    };
    VElement.prototype.children = function children(children) {
        this._children = children;
        return this;
    };
    VElement.prototype.props = function props(props) {
        this._props = props;
        return this;
    };
    VElement.prototype.attrs = function attrs(attrs) {
        this._attrs = attrs;
        return this;
    };

    function isUndef(obj) {
        return obj === undefined;
    }
    function isStatefulComponent(obj) {
        return !isUndef(obj.prototype) && obj.prototype.render !== undefined;
    }

    var VComponent = function VComponent(component) {
        this._dom = null;
        this._props = null;
        this._hooks = null;
        this._instance = null;
        this._key = null;
        this._ref = null;
        this._component = component;
        this._isStateful = isStatefulComponent(component);
    };
    VComponent.prototype.key = function key(key) {
        this._key = key;
        return this;
    };
    VComponent.prototype.props = function props(props) {
        this._props = props;
        return this;
    };
    VComponent.prototype.ref = function ref(ref) {
        this._ref = ref;
        return this;
    };
    VComponent.prototype.hooks = function hooks(hooks) {
        this._hooks = hooks;
        return this;
    };

    var VAsyncNode = function VAsyncNode(async) {
        this._dom = null;
        this._key = null;
        this._cancel = false;
        this._lastInput = null;
        this._async = async;
    };

    var VEmptyNode = function VEmptyNode() {
        this._dom = null;
        this._key = null;
        this._e = null;
    };

    function element(tag) {
        return new VElement(tag);
    }
    function component(component) {
        return new VComponent(component);
    }
    function async(async) {
        return new VAsyncNode(async);
    }
    function empty() {
        return new VEmptyNode();
    }

    var index = {
        element: element,
        component: component,
        async: async,
        empty: empty
    };

    return index;

}));