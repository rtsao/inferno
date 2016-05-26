/*!
 * inferno-dom v0.7.7
 * (c) 2016 Dominic Gannaway
 * Released under the MIT License.
 */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.InfernoDOM = factory());
}(this, function () { 'use strict';

    function isVEmptyNode(obj) {
        return !isUndef(obj._e);
    }
    function isVComponent(obj) {
        return !isUndef(obj._component);
    }
    function isVAsyncNode(obj) {
        return !isUndef(obj._async);
    }
    function isVNode(obj) {
        return !isUndef(obj._dom);
    }
    function isVElement(obj) {
        return !isUndef(obj._tag);
    }
    function isVTemplate(obj) {
        return !isUndef(obj.bp);
    }
    function isUndef(obj) {
        return obj === undefined;
    }
    function isNull(obj) {
        return obj === null;
    }
    function isInvalid(obj) {
        return isUndef(obj) || isNull(obj) || isFalse(obj);
    }
    function isArray(obj) {
        return Array.isArray(obj);
    }
    function isPromise(obj) {
        return !isUndef(obj.then);
    }
    function isString(obj) {
        return typeof obj === 'string';
    }
    function isNumber(obj) {
        return typeof obj === 'number';
    }
    function isFalse(obj) {
        return obj === false;
    }
    function isTrue(obj) {
        return obj === true;
    }
    function isStringOrNumber(obj) {
        return isString(obj) || isNumber(obj);
    }

    var VTextNode = function VTextNode(text) {
        this._dom = null;
        this._key = null;
        this._t = null;
        this._text = text;
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

    function unmountArray(array, domNode, lifecycle, instance, isRoot, isReplace) {
        for (var i = 0; i < array.length; i++) {
            unmount(array[i], domNode, lifecycle, instance, isRoot, isReplace);
        }
    }
    function unmount(input, parentDomNode, lifecycle, instance, isRoot, isReplace) {
        if (isArray(input)) {
            unmountArray(input, parentDomNode, lifecycle, instance, isRoot, isReplace);
        }
        else if (isVTextNode(input)) {
            unmountVTextNode(input, parentDomNode, isRoot, isReplace);
        }
        else if (isVAsyncNode(input)) {
            unmountVAsyncNode(input, parentDomNode, isRoot, isReplace);
        }
        else if (isVElement(input)) {
            unmountVElement(input, parentDomNode, lifecycle, instance, isRoot, isReplace);
        }
        else if (isVComponent(input)) {
            unmountVComponent(input, parentDomNode, lifecycle, instance, isRoot, isReplace);
        }
    }
    function unmountVComponent(vComponent, parentDomNode, lifecycle, lastInstance, isRoot, isReplace) {
        var hooks = vComponent._hooks;
        var domNode = vComponent._dom;
        var isStateful = vComponent._isStateful;
        var instance = vComponent._instance;
        if (isTrue(isStateful)) {
            unmount(instance._lastInput, parentDomNode, lifecycle, lastInstance, isRoot, isReplace);
            instance.componentWillUnmount();
        }
        else {
            unmount(instance, parentDomNode, lifecycle, lastInstance, isRoot, isReplace);
            if (hooks && hooks.componentWillUnmount) {
                triggerHook('componentWillUnmount', hooks.componentWillUnmount, domNode, lifecycle, null, null);
            }
        }
    }
    function unmountVElement(vElement, parentDomNode, lifecycle, instance, isRoot, isReplace) {
        var hooks = vElement._hooks;
        var domNode = vElement._dom;
        var tag = vElement._tag;
        if (isString(tag)) {
            if (hooks) {
                if (hooks.willDetach) {
                    triggerHook('willDetach', hooks.willDetach, domNode, lifecycle, null, null);
                }
                if (hooks.detached) {
                    triggerHook('detached', hooks.detached, domNode, lifecycle, null, null);
                }
            }
            var children = vElement._children;
            if (!isNull(children)) {
                if (isArray(children)) {
                    unmountArray(children, domNode, lifecycle, instance, false, false);
                }
                else if (!isStringOrNumber(children)) {
                    unmount(children, domNode, lifecycle, instance, false, false);
                }
            }
            var ref = vElement._ref;
            if (ref) {
                if (instance) {
                    delete instance.refs[ref];
                }
            }
        }
        if (isTrue(isRoot) && isFalse(isReplace)) {
            removeChild(parentDomNode, domNode);
        }
    }
    function unmountVTextNode(vTextNode, parentDomNode, isRoot, isReplace) {
        if (isTrue(isRoot) && isFalse(isReplace)) {
            removeChild(parentDomNode, vTextNode._dom);
        }
    }
    function unmountVAsyncNode(vAsyncNode, parentDomNode, isRoot, isReplace) {
        vAsyncNode._cancel = true;
        if (isTrue(isRoot) && isFalse(isReplace)) {
            removeChild(parentDomNode, vAsyncNode._dom);
        }
    }

    var badInput = 'Inferno Error: bad input(s) passed to "patch". Please ensure only valid objects are used in your render.';
    function patch(lastInput, nextInput, parentDomNode, lifecycle, instance, namespace, isKeyed, isRoot) {
        if (isVEmptyNode(nextInput)) {
            if (isVEmptyNode(lastInput)) {
                patchVEmptyNode(lastInput, nextInput);
            }
            else {
                if (isTrue(isRoot)) {
                    unmount(lastInput, parentDomNode, lifecycle, instance, isRoot, false);
                    lifecycle.deleteRoot();
                }
                else {
                    mountVEmptyNode(nextInput, null);
                    // replaceInputWithPlaceholder(lastInput, parentDomNode, lifecycle);	
                    debugger;
                }
            }
        }
        else if (isVEmptyNode(lastInput)) {
            if (isTrue(isRoot)) {
                mount(nextInput, parentDomNode, lifecycle, instance, namespace, false);
            }
            else {
                // replacePlaceholderWithInput(nextInput, parentDomNode, lifecycle, instance, namespace, isKeyed);	
                debugger;
            }
        }
        else if (isArray(lastInput)) {
            if (isArray(nextInput)) {
                if (isKeyed) {
                    patchKeyedArray(lastInput, nextInput, parentDomNode, lifecycle, instance, namespace);
                }
                else {
                    patchNonKeyedArray(lastInput, nextInput, parentDomNode, lifecycle, instance, namespace, isRoot);
                }
            }
            else {
                replaceArrayWithInput(parentDomNode, mount(nextInput, null, lifecycle, instance, namespace, isKeyed), lastInput, lifecycle, instance);
            }
        }
        else if (isArray(nextInput)) {
            replaceInputWithArray(lastInput, nextInput, parentDomNode, lifecycle, instance, namespace, isKeyed);
        }
        else if (isVAsyncNode(nextInput)) {
            if (isVAsyncNode(lastInput)) {
                patchVAsyncNode(lastInput, nextInput, parentDomNode, lifecycle, instance, namespace, isKeyed, isRoot);
            }
            else {
                patchInputWithPromiseInput(lastInput, nextInput, parentDomNode, lifecycle, instance, namespace, isKeyed, isRoot);
            }
        }
        else if (isVTemplate(nextInput)) {
            debugger;
        }
        else if (isVTemplate(lastInput)) {
            debugger;
        }
        else if (isVElement(nextInput)) {
            if (isVElement(lastInput)) {
                patchVElement(lastInput, nextInput, parentDomNode, lifecycle, instance, namespace, isKeyed, isRoot);
            }
            else {
                debugger;
            }
        }
        else if (isVElement(lastInput)) {
            debugger;
        }
        else if (isVComponent(nextInput)) {
            if (isVComponent(lastInput)) {
                patchVComponent(lastInput, nextInput, parentDomNode, lifecycle, instance, namespace, isKeyed, isRoot);
            }
            else {
                debugger;
            }
        }
        else if (isVComponent(lastInput)) {
            debugger;
        }
        else if (isVAsyncNode(lastInput)) {
            var asyncLastInput = lastInput._lastInput;
            if (isNull(asyncLastInput)) {
                replaceVAsyncNodeWithInput(lastInput, nextInput, parentDomNode, lifecycle, instance, namespace, isKeyed);
            }
            else {
                patch(asyncLastInput, nextInput, parentDomNode, lifecycle, instance, namespace, isKeyed, isRoot);
            }
        }
        else if (isVTextNode(lastInput)) {
            if (isVTextNode(nextInput)) {
                patchVTextNode(lastInput, nextInput);
            }
            else {
                replaceVTextNodeWithInput(lastInput, nextInput, parentDomNode, lifecycle, instance, namespace, isKeyed);
            }
        }
        else {
            throw new Error(badInput);
        }
    }
    function patchVComponent(lastVComponent, nextVComponent, parentDomNode, lifecycle, lastInstance, namespace, isKeyed, isRoot) {
        var lastComponent = lastVComponent._component;
        var nextComponent = nextVComponent._component;
        var lastIsStateful = lastVComponent._isStateful;
        var nextIsStateful = nextVComponent._isStateful;
        var lastProps = lastVComponent._props;
        var nextProps = nextVComponent._props;
        if (lastComponent === nextComponent) {
            if (isTrue(lastIsStateful)) {
            }
            else {
                if (isTrue(nextIsStateful)) {
                }
                else {
                    var hooks = nextVComponent._hooks;
                    var lastInput = lastVComponent._instance;
                    var nextInput = nextComponent(nextProps);
                    var update = true;
                    if (hooks && hooks.componentShouldUpdate) {
                        update = hooks.componentShouldUpdate(lastVComponent._dom, lastProps, nextProps);
                    }
                    if (isTrue(update)) {
                        patch(lastInput, nextInput, parentDomNode, lifecycle, null, namespace, false, false);
                        nextVComponent._dom = nextInput._dom;
                        nextVComponent._instance = nextInput;
                    }
                    else {
                        nextVComponent._dom = lastInput._dom;
                        nextVComponent._instance = lastInput;
                    }
                }
            }
        }
        else {
            var domNode = mountVComponent(nextVComponent, parentDomNode, lifecycle, lastInstance, namespace, isKeyed);
            replaceChild(parentDomNode, domNode, lastVComponent._dom);
            unmountVComponent(lastVComponent, parentDomNode, lifecycle, lastInstance, true, true);
        }
    }
    function patchObjects(lastObject, nextObject, setFunc, patchFunc, domNode, namespace) {
        if (isNull(nextObject)) {
            var keys = Object.keys(lastObject);
            for (var i = 0; i < keys.length; i++) {
                var name = keys[i];
                setFunc(name, null, domNode);
            }
        }
        else {
            if (isNull(lastObject)) {
                var keys$1 = Object.keys(nextObject);
                for (var i$1 = 0; i$1 < keys$1.length; i$1++) {
                    var name$1 = keys$1[i$1];
                    setFunc(name$1, nextObject[name$1], domNode);
                }
            }
            else {
                var lastKeys = Object.keys(lastObject);
                var nextKeys = Object.keys(nextObject);
                for (var i$2 = 0; i$2 < lastKeys.length; i$2++) {
                    var name$2 = lastKeys[i$2];
                    if (!isUndef(nextObject[name$2])) {
                        patchFunc(name$2, lastObject[name$2], nextObject[name$2], domNode, namespace);
                    }
                    else {
                        setFunc(name$2, null, domNode, namespace);
                    }
                }
                for (var i$3 = 0; i$3 < nextKeys.length; i$3++) {
                    var name$3 = nextKeys[i$3];
                    if (isUndef(lastObject[name$3])) {
                        setFunc(name$3, nextObject[name$3], domNode, namespace);
                    }
                }
            }
        }
    }
    function patchVElement(lastVElement, nextVElement, parentDomNode, lifecycle, instance, namespace, isKeyed, isRoot) {
        var lastTag = lastVElement._tag;
        var nextTag = nextVElement._tag;
        var nextHooks = nextVElement._hooks;
        var domNode = lastVElement._dom;
        var _isKeyed = (lastVElement._isKeyed && nextVElement._isKeyed) || isKeyed;
        nextVElement._dom = domNode;
        if (lastTag !== nextTag) {
            unmount(lastVElement, null, lifecycle, instance, isRoot, true);
            replaceChild(parentDomNode, mount(nextVElement, null, lifecycle, instance, namespace, _isKeyed), domNode);
        }
        else {
            var lastText = lastVElement._text;
            var nextText = nextVElement._text;
            if (!isNull(nextHooks) && nextHooks.willUpdate) {
                triggerHook('willUpdate', nextHooks.willUpdate, domNode, lifecycle, null, null);
            }
            if (lastText !== nextText) {
                if (isNull(nextText)) {
                    setTextContent(null, domNode, false);
                }
                else {
                    setTextContent(nextText, domNode, !isNull(lastText));
                }
            }
            else {
                var lastChildren = lastVElement._children;
                var nextChildren = nextVElement._children;
                if (lastChildren !== nextChildren) {
                    lastChildren = normaliseInput(lastChildren);
                    nextChildren = normaliseInput(nextChildren);
                    patch(lastChildren, nextChildren, domNode, lifecycle, instance, namespace, _isKeyed, isRoot);
                }
            }
            var lastProps = lastVElement._props;
            var nextProps = nextVElement._props;
            if (lastProps !== nextProps) {
                patchObjects(lastProps, nextProps, setProperty, patchProperty, domNode, namespace);
            }
            var lastAttrs = lastVElement._attrs;
            var nextAttrs = nextVElement._attrs;
            if (lastAttrs !== nextAttrs) {
                patchObjects(lastAttrs, nextAttrs, setAttribute, patchAttribute, domNode, namespace);
            }
            var lastEvents = lastVElement._events;
            var nextEvents = nextVElement._events;
            if (lastEvents !== nextEvents) {
                patchObjects(lastEvents, nextEvents, setEvent, patchEvent, domNode, namespace);
            }
            var lastRef = lastVElement._ref;
            var nextRef = nextVElement._ref;
            if (lastRef !== nextRef) {
                patchRef(instance, lastRef, nextRef, domNode);
            }
            if (!isNull(nextHooks) && nextHooks.didUpdate) {
                triggerHook('didUpdate', nextHooks.didUpdate, domNode, lifecycle, null, null);
            }
        }
    }
    function patchRef(instance, lastRef, nextRef, domNode) {
        if (instance) {
            if (isString(lastRef)) {
                delete instance.refs[lastRef];
            }
            if (isString(nextRef)) {
                instance.refs[nextRef] = domNode;
            }
        }
    }
    function patchVEmptyNode(lastVEmptyNode, nextVEmptyNode) {
        nextVEmptyNode._dom = lastVEmptyNode._dom;
    }
    function patchVAsyncNode(lastVAsyncNode, nextVAsyncNode, parentDomNode, lifecycle, instance, namespace, isKeyed, isRoot) {
        var lastInput = lastVAsyncNode._lastInput;
        var nextAsync = nextVAsyncNode._async;
        if (isNull(lastInput)) {
            if (isPromise(nextAsync)) {
                lastVAsyncNode._cancel = true;
                nextAsync.then(function ( nextInput ) {
                    if (isFalse(nextVAsyncNode._cancel)) {
                        nextInput = normaliseInput(nextInput);
                        var domNode = mount(nextInput, null, lifecycle, instance, namespace, isKeyed);
                        replaceChild(parentDomNode, domNode, lastVAsyncNode._dom);
                        nextVAsyncNode._dom = domNode;
                        nextVAsyncNode._lastInput = nextInput;
                    }
                });
            }
        }
        else {
            if (isPromise(nextAsync)) {
                patchInputWithPromiseInput(lastInput, nextVAsyncNode, parentDomNode, lifecycle, instance, namespace, isKeyed, isRoot);
            }
        }
    }
    function patchInputWithPromiseInput(lastInput, vAsyncNode, parentDomNode, lifecycle, instance, namespace, isKeyed, isRoot) {
        var promise = vAsyncNode._async;
        promise.then(function ( nextInput ) {
            if (isFalse(vAsyncNode._cancel)) {
                nextInput = normaliseInput(nextInput);
                patch(lastInput, nextInput, parentDomNode, lifecycle, instance, namespace, isKeyed, isRoot);
                vAsyncNode._dom = getDomNodeFromInput(nextInput, parentDomNode);
                vAsyncNode._lastInput = nextInput;
            }
        });
    }
    function patchNonKeyedArray(lastArray, nextArray, parentDomNode, lifecycle, instance, namespace, isRoot) {
        // optimisaiton technique, can we delay doing this upon finding an invalid child and then falling back?
        // it is expensive to do if we somehow know both arrays are the same length, even once flattened
        lastArray = normaliseArray(lastArray, false);
        nextArray = normaliseArray(nextArray, true);
        var lastArrayLength = lastArray.length;
        var nextArrayLength = nextArray.length;
        var commonLength = lastArrayLength > nextArrayLength ? nextArrayLength : lastArrayLength;
        var i = 0;
        for (; i < commonLength; i++) {
            patch(lastArray[i], nextArray[i], parentDomNode, lifecycle, instance, namespace, false, isRoot);
        }
        if (lastArrayLength < nextArrayLength) {
            for (i = commonLength; i < nextArrayLength; i++) {
                mount(nextArray[i], parentDomNode, lifecycle, instance, namespace, false);
            }
        }
        else if (lastArrayLength > nextArrayLength) {
            for (i = commonLength; i < lastArrayLength; i++) {
                unmount(lastArray[i], parentDomNode, lifecycle, instance, true, false);
            }
        }
    }
    function patchVTextNode(lastVTextNode, nextVTextNode) {
        var nextText = nextVTextNode._text;
        var domTextNode = lastVTextNode._dom;
        nextVTextNode._dom = domTextNode;
        if (lastVTextNode._text !== nextText) {
            setText(domTextNode, nextVTextNode._text);
        }
    }
    // TODO this function should throw if it can't find the key on an item
    function patchKeyedArray(lastArray, nextArray, parentDomNode, lifecycle, instance, namespace) {
    }
    function patchAttribute(name, lastValue, nextValue, domNode, namespace) {
        if (lastValue !== nextValue) {
            setAttribute(name, nextValue, domNode, namespace);
        }
    }
    function patchEvent(name, lastValue, nextValue, domNode, namespace) {
        if (lastValue !== nextValue) {
            setEvent(name, nextValue, domNode);
        }
    }
    function patchProperty(name, lastValue, nextValue, domNode) {
        if (lastValue !== nextValue) {
            if (name === 'className') {
                domNode.className = nextValue;
            }
            else if (name === 'style') {
                patchStyle(lastValue, nextValue, domNode);
            }
            else {
                domNode[name] = nextValue;
            }
        }
    }
    function patchStyle(lastValue, nextValue, domNode) {
        if (isString(nextValue)) {
            domNode.style.cssText = nextValue;
        }
        else if (isUndef(lastValue)) {
            if (!isUndef(nextValue)) {
                var styleKeys = Object.keys(nextValue);
                for (var i = 0; i < styleKeys.length; i++) {
                    var style = styleKeys[i];
                    domNode.style[style] = nextValue[style];
                }
            }
        }
        else if (isUndef(nextValue)) {
            domNode.removeAttribute('style');
        }
        else {
            var styleKeys$1 = Object.keys(nextValue);
            for (var i$1 = 0; i$1 < styleKeys$1.length; i$1++) {
                var style$1 = styleKeys$1[i$1];
                domNode.style[style$1] = nextValue[style$1];
            }
            var lastStyleKeys = Object.keys(lastValue);
            for (var i$2 = 0; i$2 < lastStyleKeys.length; i$2++) {
                var style$2 = lastStyleKeys[i$2];
                if (isUndef(nextValue[style$2])) {
                    domNode.style[style$2] = '';
                }
            }
        }
    }

    var normalisedArrays = new Map();
    function isVTextNode(obj) {
        return !isUndef(obj._t);
    }
    function isVTemplate$1(obj) {
        return !isUndef(obj.bp);
    }
    function createPlaceholder() {
        return createTextNode('');
    }
    function appendChild(parentDomNode, childDomNode) {
        parentDomNode.appendChild(childDomNode);
    }
    function replaceChild(parentDomNode, newDomNode, oldDomNode) {
        parentDomNode.replaceChild(newDomNode, oldDomNode);
    }
    function removeChild(parentDomNode, childDomNode) {
        parentDomNode.removeChild(childDomNode);
    }
    function appendOrInsertChild(parentDomNode, newDomNode, nextDomNode) {
        if (isUndef(nextDomNode)) {
            parentDomNode.appendChild(newDomNode);
        }
        else {
            parentDomNode.insertBefore(newDomNode, nextDomNode);
        }
    }
    function setEvent(event, value, domNode) {
        domNode[event] = value;
    }
    function setText(textNode, text) {
        textNode.nodeValue = text;
    }
    function setTextContent(text, domNode, update) {
        if (update) {
            setText(domNode.firstChild, text);
        }
        else {
            if (text === null) {
                domNode.textContent = '';
            }
            else {
                if (text !== '') {
                    domNode.textContent = text;
                }
                else {
                    appendChild(domNode, createTextNode(''));
                }
            }
        }
    }
    function createTextNode(text) {
        return document.createTextNode(text);
    }
    function createElement(tag, namespace) {
        if (namespace) {
            return document.createElementNS(namespace, tag);
        }
        else {
            return document.createElement(tag);
        }
    }
    function setAttribute(name, value, domNode, namespace) {
        if (!isInvalid(value)) {
            if (namespace) {
                domNode.setAttributeNS(namespace, name, value);
            }
            else {
                domNode.setAttribute(name, value);
            }
        }
        else {
            domNode.removeAttribute(name);
        }
    }
    function setProperty(name, value, domNode) {
        if (!isInvalid(value)) {
            if (name === 'className') {
                domNode.className = value;
            }
            else if (name === 'style') {
                patchStyle(null, value, domNode);
            }
            else {
                domNode[name] = value;
            }
        }
        else {
            if (name === 'className') {
                domNode.removeAttribute('class');
            }
            else if (name === 'style') {
                domNode.removeAttribute('style');
            }
            else {
                domNode[name] = '';
            }
        }
    }
    function deepNormaliseArray(oldArr, newArr) {
        for (var i = 0; i < oldArr.length; i++) {
            var item = oldArr[i];
            if (isArray(item)) {
                deepNormaliseArray(item, newArr);
            }
            else if (!isInvalid(item)) {
                if (isStringOrNumber(item)) {
                    newArr.push(new VTextNode(item));
                }
                else if (isPromise(item)) {
                    newArr.push(new VAsyncNode(item));
                }
                else {
                    newArr.push(item);
                }
            }
        }
    }
    function normaliseArray(array, mutate) {
        if (isUndef(normalisedArrays.get(array))) {
            if (mutate) {
                var copy = array.slice(0);
                normalisedArrays.set(array, true);
                array.length = 0;
                deepNormaliseArray(copy, array);
            }
            else {
                var newArray = [];
                normalisedArrays.set(array, true);
                deepNormaliseArray(array, newArray);
                return newArray;
            }
        }
        return array;
    }
    function normaliseInput(input) {
        if (isInvalid(input)) {
            return new VEmptyNode();
        }
        else if (isVNode(input)) {
            return input;
        }
        else if (isStringOrNumber(input)) {
            return new VTextNode(input);
        }
        else if (isPromise(input)) {
            return new VAsyncNode(input);
        }
        return input;
    }
    function getDomNodeFromInput(input, parentDomNode) {
        if (!isUndef(input._dom)) {
            return input._dom;
        }
        else if (isArray(input)) {
            return getDomNodeFromInput(input[0], parentDomNode);
        }
        else {
            debugger;
        }
    }
    function triggerHook(name, func, domNode, lifecycle, lastProps, nextProps) {
        switch (name) {
            case 'attached':
            case 'detached':
            case 'componentDidMount':
                lifecycle.callback(function () {
                    func(domNode);
                });
                break;
            default:
                return func(domNode, lastProps, nextProps);
        }
    }
    function replaceVTextNodeWithInput(vTextNode, input, parentDomNode, lifecycle, instance, namespace, isKeyed) {
        var domTextNode = vTextNode._dom;
        if (!isInvalid(input) && !isVNode(input)) {
            input = normaliseInput(input);
        }
        replaceChild(parentDomNode, mount(input, null, lifecycle, instance, namespace, isKeyed), domTextNode);
    }
    function replaceArrayWithInput(parentDomNode, newDomNode, oldArray, lifecycle, instance) {
        // we need to insert out new object before the first item of the array, then unmount the array
        var firstItem = oldArray[0];
        var firstDomNode;
        appendOrInsertChild(parentDomNode, newDomNode, getDomNodeFromInput(firstItem, null));
        unmount(oldArray, parentDomNode, lifecycle, instance, true, false);
    }
    function replaceInputWithArray(input, array, parentDomNode, lifecycle, instance, namespace, isKeyed) {
        replaceChild(parentDomNode, mount(array, null, lifecycle, instance, namespace, isKeyed), getDomNodeFromInput(input, null));
    }
    function replaceVAsyncNodeWithInput(vAsyncNode, input, parentDomNode, lifecycle, instance, namespace, isKeyed) {
        var domNode = vAsyncNode._dom;
        vAsyncNode._cancel = true;
        if (!isInvalid(input) && !isVNode(input)) {
            input = normaliseInput(input);
        }
        replaceChild(parentDomNode, mount(input, null, lifecycle, instance, namespace, isKeyed), domNode);
    }

    function mount(input, parentDomNode, lifecycle, instance, namespace, isKeyed) {
        if (isVEmptyNode(input)) {
            return mountVEmptyNode(input, parentDomNode);
        }
        else if (isVTextNode(input)) {
            return mountVTextNode(input, parentDomNode);
        }
        else if (isVComponent(input)) {
            return mountVComponent(input, parentDomNode, lifecycle, instance, namespace, isKeyed);
        }
        else if (isVElement(input)) {
            return mountVElement(input, parentDomNode, lifecycle, instance, namespace);
        }
        else if (isVTemplate$1(input)) {
            return mountVTemplate(input, parentDomNode, lifecycle, instance);
        }
        else if (isVAsyncNode(input)) {
            return mountVAsyncNode(input, parentDomNode, lifecycle, instance, namespace, isKeyed);
        }
        else if (isArray(input)) {
            var domNode = parentDomNode;
            if (isNull(parentDomNode)) {
                domNode = document.createDocumentFragment();
            }
            if (isFalse(isKeyed)) {
                mountArray(normaliseArray(input, true), domNode, lifecycle, instance, namespace, false);
            }
            else {
                mountArray(input, domNode, lifecycle, instance, namespace, true);
            }
            return domNode;
        }
        else if (isStringOrNumber(input)) {
            throw new Error(("Inferno Error: invalid mount input of \"" + (typeof input) + "\". Ensure the String or Number is wrapped in a VElement, VComponent, VTemplate or Array."));
        }
        else {
            throw new Error('Inferno Error: failed to "mount", invalid object was detected. Valid "mount" types are Array, Promise, Function, VTextNode, VElement, VComponent, VAsyncNode and VTemplate.');
        }
    }
    function mountVEmptyNode(vEmptyNode, parentDomNode) {
        var placeholder = createPlaceholder();
        vEmptyNode._dom = placeholder;
        if (!isNull(parentDomNode)) {
            appendChild(parentDomNode, placeholder);
        }
        return placeholder;
    }
    function mountVTextNode(vTextNode, parentDomNode) {
        var domTextNode = createTextNode(vTextNode._text);
        vTextNode._dom = domTextNode;
        if (!isNull(parentDomNode)) {
            appendChild(parentDomNode, domTextNode);
        }
        return domTextNode;
    }
    function mountVComponent(vComponent, parentDomNode, lifecycle, instance, namespace, isKeyed) {
        var isStateful = vComponent._isStateful;
        var component = vComponent._component; // we need to use "any" as InfernoComponent is externally available only
        var props = vComponent._props;
        var ref = vComponent._ref;
        var domNode;
        if (isTrue(isStateful)) {
            var instance$1 = new component(props);
        }
        else {
            var hooks = vComponent._hooks;
            var input = normaliseInput(component(props));
            domNode = mount(input, parentDomNode, lifecycle, null, namespace, isKeyed);
            vComponent._dom = domNode;
            vComponent._instance = input;
            if (hooks) {
                if (hooks.componentWillMount) {
                    triggerHook('componentWillMount', hooks.componentWillMount, domNode, lifecycle, null, null);
                }
                if (hooks.componentDidMount) {
                    triggerHook('componentDidMount', hooks.componentDidMount, domNode, lifecycle, null, null);
                }
            }
        }
        return domNode;
    }
    function mountVElement(vElement, parentDomNode, lifecycle, instance, namespace) {
        var tag = vElement._tag;
        var domNode;
        if (isString(tag)) {
            var domNode$1 = createElement(tag, namespace);
            var text = vElement._text;
            var hooks = vElement._hooks;
            vElement._dom = domNode$1;
            if (hooks) {
                if (hooks.created) {
                    hooks.created(domNode$1);
                }
                if (hooks.attached) {
                    lifecycle.callback(function () {
                        hooks.attached(domNode$1);
                    });
                }
            }
            if (text) {
                setTextContent(text, domNode$1, false);
            }
            var children = vElement._children;
            var isKeyed = vElement._isKeyed;
            if (!isNull(children)) {
                if (isArray(children)) {
                    if (!isKeyed) {
                        children = vElement._children = normaliseArray(children, false);
                    }
                    mountArray(children, domNode$1, lifecycle, instance, namespace, isKeyed);
                }
                else {
                    mount(children, domNode$1, lifecycle, instance, namespace, isKeyed);
                }
            }
            var events = vElement._events;
            if (!isNull(events)) {
                var eventsKeys = Object.keys(events);
                for (var i = 0; i < eventsKeys.length; i++) {
                    var eventName = eventsKeys[i];
                    var eventValue = events[eventName];
                    setEvent(eventName, eventValue, domNode$1);
                }
            }
            var attrs = vElement._attrs;
            if (!isNull(attrs)) {
                var attrsKeys = Object.keys(attrs);
                for (var i$1 = 0; i$1 < attrsKeys.length; i$1++) {
                    var attrName = attrsKeys[i$1];
                    var attrValue = attrs[attrName];
                    setAttribute(attrName, attrValue, domNode$1, namespace);
                }
            }
            var props = vElement._props;
            if (!isNull(props)) {
                var propsKeys = Object.keys(props);
                for (var i$2 = 0; i$2 < propsKeys.length; i$2++) {
                    var propName = propsKeys[i$2];
                    var propValue = props[propName];
                    setProperty(propName, propValue, domNode$1);
                }
            }
            var ref = vElement._ref;
            if (!isNull(ref)) {
                mountRef(instance, ref, domNode$1);
            }
            if (!isNull(parentDomNode)) {
                appendChild(parentDomNode, domNode$1);
            }
            return domNode$1;
        }
        else {
            throw new Error('Inferno Error: expected a String for VElement tag type');
        }
    }
    function mountVTemplate(vComponent, parentDomNode, lifecycle, instance) {
        // TODO
    }
    function mountVAsyncNode(vAsyncNode, parentDomNode, lifecycle, instance, namespace, isKeyed) {
        var _async = vAsyncNode._async;
        var placeholder = createPlaceholder();
        vAsyncNode._dom = placeholder;
        if (isPromise(_async)) {
            _async.then(function ( input ) {
                if (isFalse(vAsyncNode._cancel)) {
                    input = normaliseInput(input);
                    var domNode = mount(input, null, lifecycle, instance, namespace, isKeyed);
                    replaceChild(parentDomNode || placeholder.parentNode, domNode, placeholder);
                    vAsyncNode._dom = domNode;
                    vAsyncNode._lastInput = input;
                }
            });
        }
        if (!isNull(parentDomNode)) {
            appendChild(parentDomNode, placeholder);
        }
        return placeholder;
    }
    function mountArray(array, domNode, lifecycle, instance, namespace, isKeyed) {
        for (var i = 0; i < array.length; i++) {
            var arrayItem = array[i];
            mount(arrayItem, domNode, lifecycle, instance, namespace, isKeyed);
        }
    }
    function mountRef(instance, value, refValue) {
        if (!isInvalid(instance) && isString(value)) {
            instance.refs[value] = refValue;
        }
    }

    var Lifecyle = function Lifecyle(domNode) {
        this.domNode = domNode;
        this.callbacks = [];
    };
    Lifecyle.prototype.callback = function callback(callback) {
        this.callbacks.push(callback);
    };
    Lifecyle.prototype.trigger = function trigger() {
        var callbacks = this.callbacks;
        var length = callbacks.length;
        if (length > 0) {
            for (var i = 0; i < length; i++) {
                callbacks[i]();
            }
        }
    };
    Lifecyle.prototype.deleteRoot = function deleteRoot() {
        roots.delete(this.domNode);
    };

    // We need to know the DOM node to get a root VTemplate, VTextNode, VComponent or VElement,
    // we can retrive them faster than using arrays with O(n) lookup
    // The key is the DOM node.
    var roots = new Map();
    var Root = function Root(domNode, input) {
        this.input = input;
        roots.set(domNode, this);
    };
    function render(input, domNode) {
        var root = roots.get(domNode);
        var lifecycle = new Lifecyle(domNode);
        input = normaliseInput(input);
        if (isUndef(root)) {
            mount(input, domNode, lifecycle, null, null, false);
            root = new Root(domNode, input);
        }
        else {
            patch(root.input, input, domNode, lifecycle, null, null, false, true);
            root.input = input;
        }
        lifecycle.trigger();
    }

    function createTemplate(templateFunc) {
        // TODO
        return new VTemplate(null, null, null, null);
    }
    var VTemplate = function VTemplate(bp, key, v0, v1) {
        this._dom = null;
        this._key = key;
        this.bp = bp;
        this.v0 = v0;
        this.v1 = v1;
    };

    function template(templaceFunc) {
        return createTemplate(templaceFunc);
    }

    var index = {
        render: render,
        template: template
    };

    return index;

}));