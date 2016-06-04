declare var process;

import {  
	isUndef,
	isNullOrUndef, 
	Input, 
	isInvalid, 
	isNull, 
	isArray, 
	isStringOrNumber, 
	VTextNode, 
	VComponent, 
	VElement, 
	isVElement, 
	isVComponent, 
	VTemplate, 
	isFalse, 
	isTrue, 
	isVAsyncNode, 
	isPromise, 
	isVNode, 
	isVEmptyNode, 
	VEmptyNode,
	VAsyncNode,
	isString,
	StatefulComponent,
	isVTemplate,
	Context,
	VNode
} from '../shared';
import { 
	replaceInputWithEmptyNode,
	replaceEmptyNodeWithInput,
	normaliseArray, 
	normaliseInput, 
	getDomNodeFromInput, 
	isVTextNode, 
	setText, 
	replaceVTextNodeWithInput, 
	replaceArrayWithInput, 
	replaceInputWithArray, 
	replaceVAsyncNodeWithInput,
	replaceInputWithVComponent,
	replaceInputWithVElement,
	replaceChild,
	setTextContent,
	setProperty,
	setAttribute,
	triggerHook,
	setEvent,
	getNamespace,
	appendOrInsertChild
} from './shared';
import Lifecycle from './Lifecycle';
import { unmount, unmountVComponent } from './unmounting';
import { mount, mountVEmptyNode, mountVComponent } from './mounting';

const badInput = 'Inferno Error: bad input(s) passed to "patch". Please ensure only valid objects are used in your render.';
export const invalidInput = 'Inferno Error: components cannot have an Array as a root input. Use String, Number, VElement, VComponent, VTemplate, Null or False instead.';

export function patch(
	lastInput: Input, 
	nextInput: Input, 
	parentDomNode: HTMLElement | SVGAElement | DocumentFragment, 
	lifecycle: Lifecycle, 
	instance: StatefulComponent, 
	namespace: string, 
	isKeyed: boolean, 
	isRoot: boolean,
	context: Context
): void {
	if (isVEmptyNode(nextInput)) {
		if (isVEmptyNode(lastInput)) {
			patchVEmptyNode(lastInput, nextInput);	
		} else {
			if (lifecycle.domNode === parentDomNode) {
				unmount(lastInput, parentDomNode, lifecycle, instance, isRoot, false);
				lifecycle.deleteRoot();
			} else {
				replaceInputWithEmptyNode(lastInput, nextInput, parentDomNode, lifecycle, instance);	
			}
		}
	} else if (isVEmptyNode(lastInput)) {
		if (lifecycle.domNode === parentDomNode) {
			mount(nextInput, parentDomNode, lifecycle, instance, namespace, false, context);
		} else {
			replaceEmptyNodeWithInput(lastInput, nextInput, parentDomNode, lifecycle, instance, namespace, isKeyed, context);	
		}
	} else if (isArray(lastInput)) {
		if (isArray(nextInput)) {
			if (isKeyed) {
				patchKeyedArray(lastInput, nextInput, parentDomNode, lifecycle, instance, namespace, context, isRoot);
			} else {
				patchNonKeyedArray(lastInput, nextInput, parentDomNode, lifecycle, instance, namespace, isRoot, context);
			}
		} else {
			replaceArrayWithInput(parentDomNode, mount(nextInput, null, lifecycle, instance, namespace, isKeyed, context), lastInput, lifecycle, instance);
		}	
	} else if (isArray(nextInput)) {
		replaceInputWithArray(lastInput, nextInput, parentDomNode, lifecycle, instance, namespace, isKeyed, context);
	} else if (isVAsyncNode(nextInput)) {
		if (isVAsyncNode(lastInput)) {
			patchVAsyncNode(lastInput, nextInput, parentDomNode, lifecycle, instance, namespace, isKeyed, isRoot, context);
		} else {
			patchInputWithPromiseInput(lastInput, nextInput, parentDomNode, lifecycle, instance, namespace, isKeyed, isRoot, context);
		}
	} else if (isVTemplate(nextInput)) {
		debugger;
	} else if (isVElement(nextInput)) {
		if (isVElement(lastInput)) {
			patchVElement(lastInput, nextInput, parentDomNode, lifecycle, instance, namespace, isKeyed, isRoot, context);
		} else {
			replaceInputWithVElement(lastInput, nextInput, parentDomNode, lifecycle, instance, namespace, isKeyed, isRoot, context);	
		}
	} else if (isVComponent(nextInput)) {
		if (isVComponent(lastInput)) {
			patchVComponent(lastInput, nextInput, parentDomNode, lifecycle, instance, namespace, isKeyed, isRoot, context);
		} else {
			replaceInputWithVComponent(lastInput, nextInput, parentDomNode, lifecycle, instance, namespace, isKeyed, isRoot, context);	
		}
	} else if (isVAsyncNode(lastInput)) {
		const asyncLastInput = lastInput._lastInput;
		
		if (isNull(asyncLastInput)) {
			replaceVAsyncNodeWithInput(lastInput, nextInput, parentDomNode, lifecycle, instance, namespace, isKeyed, context);
		} else {
			patch(asyncLastInput, nextInput, parentDomNode, lifecycle, instance, namespace, isKeyed, isRoot, context);
		}
	} else if (isVTextNode(lastInput)) {
		if (isVTextNode(nextInput)) {
			patchVTextNode(lastInput, nextInput);
		} else {
			replaceVTextNodeWithInput(lastInput, nextInput, parentDomNode, lifecycle, instance, namespace, isKeyed, context);
		}
	} else {
		throw new Error(badInput);
	}
}

function patchVComponent(
	lastVComponent: VComponent, 
	nextVComponent: VComponent, 
	parentDomNode: HTMLElement | SVGAElement | DocumentFragment, 
	lifecycle: Lifecycle, 
	lastInstance: StatefulComponent, 
	namespace: string, 
	isKeyed: boolean, 
	isRoot: boolean,
	context: Context
) {
	const lastComponent = lastVComponent._component;
	const nextComponent = nextVComponent._component;
	const lastIsStateful = lastVComponent._isStateful;
	const nextIsStateful = nextVComponent._isStateful;
	const lastProps = lastVComponent._props;
	const nextProps = nextVComponent._props;

	if (lastComponent === nextComponent) {
		if (isTrue(lastIsStateful)) {
			if (isTrue(nextIsStateful)) {
				const instance = lastVComponent._instance as StatefulComponent;
				const lastInput = instance._lastInput;
				const nextState = Object.assign({}, instance.state);
				const update = instance.shouldComponentUpdate(nextProps, nextState);
				
				if (update) {
					const lastState = instance.state;
					const nextInput = instance._patchComponent(lastInput, parentDomNode, lastState, nextState, lastProps, nextProps, lifecycle, lastInstance, namespace, isKeyed, isRoot, context);

					instance._lastInput = nextInput;
					nextVComponent._instance = instance;
					nextVComponent._dom = (nextInput as VElement | VTemplate | VComponent)._dom;
				}
			} else{
				debugger;
			}
		} else {
			if (isTrue(nextIsStateful)) {
				debugger;
			} else {
				const hooks = nextVComponent._hooks;
				const hasHooks = !isNull(hooks);
				const lastInput = lastVComponent._instance as Input;
				const nextInput = normaliseInput(nextComponent(nextProps));
				let update = true;
				
				if (isArray(nextInput)) {
					if (process.env.NODE_ENV === 'production') {
						throw new Error(invalidInput);
					}
				}
				if (hasHooks && hooks.componentShouldUpdate) {
					update = hooks.componentShouldUpdate(lastVComponent._dom, lastProps, nextProps);
				}
				if (isTrue(update)) {
					if (hasHooks && hooks.componentWillUpdate) {
						triggerHook('componentWillUpdate', hooks.componentWillUpdate, lastVComponent._dom, lifecycle, null, null);
					}
					patch(lastInput, nextInput, parentDomNode, lifecycle, null, namespace, false, false, context);
					nextVComponent._dom = (nextInput as VElement | VTemplate | VComponent)._dom;
					nextVComponent._instance = nextInput;
					if (hasHooks && hooks.componentDidUpdate) {
						triggerHook('componentDidUpdate', hooks.componentDidUpdate, nextVComponent._dom, lifecycle, null, null);
					}
				} else {
					nextVComponent._dom = (lastInput as VElement | VTemplate | VComponent)._dom;
					nextVComponent._instance = lastInput;
				}
			}
		}
	} else {
		const domNode = mountVComponent(nextVComponent, parentDomNode, lifecycle, lastInstance, namespace, isKeyed, context);

		replaceChild(parentDomNode, domNode, lastVComponent._dom);
		unmountVComponent(lastVComponent, parentDomNode, lifecycle, lastInstance, true, true);
	}
}

function patchObjects(lastObject: Object, nextObject: Object, setFunc: Function, patchFunc: Function, domNode: HTMLElement | SVGAElement | DocumentFragment) {
	if (isNull(nextObject)) {
		const keys: Array<string> = Object.keys(lastObject);
		
		for (let i = 0; i < keys.length; i++) {
			const name: string = keys[i];
			
			setFunc(name, null, domNode);
		}		
	} else {
		if (isNull(lastObject)) {
			const keys: Array<string> = Object.keys(nextObject);
		
			for (let i = 0; i < keys.length; i++) {
				const name: string = keys[i];
				
				setFunc(name, nextObject[name], domNode);
			}	
		} else {
			const lastKeys: Array<string> = Object.keys(lastObject);
			const nextKeys: Array<string> = Object.keys(nextObject);
			
			for (let i = 0; i < lastKeys.length; i++) {
				const name: string = lastKeys[i];
				
				if (!isUndef(nextObject[name])) {
					patchFunc(name, lastObject[name], nextObject[name], domNode);
				} else {
					setFunc(name, null, domNode);
				}
			}
			for (let i = 0; i < nextKeys.length; i++) {
				const name: string = nextKeys[i];
				
				if (isUndef(lastObject[name])) {
					setFunc(name, nextObject[name], domNode);
				}
			}
		}
	}
}

function patchVElement(
	lastVElement: VElement, 
	nextVElement: VElement, 
	parentDomNode: HTMLElement | SVGAElement | DocumentFragment, 
	lifecycle: Lifecycle, 
	instance: StatefulComponent, 
	namespace: string, 
	isKeyed: boolean, 
	isRoot: boolean,
	context: Context
) {
	const lastTag: string = lastVElement._tag;
	const nextTag: string = nextVElement._tag;
	const nextHooks = nextVElement._hooks;
	const domNode: HTMLElement | SVGAElement | DocumentFragment = lastVElement._dom;
	const _isKeyed = (lastVElement._isKeyed && nextVElement._isKeyed) || isKeyed;

	nextVElement._dom = domNode;
	if (lastTag !== nextTag) {
		unmount(lastVElement, null, lifecycle, instance, isRoot, true);
		replaceChild(parentDomNode, mount(nextVElement, null, lifecycle, instance, namespace, _isKeyed, context), domNode);
	} else {
		const lastText: string | number = lastVElement._text;
		const nextText: string | number = nextVElement._text;
	
		namespace = getNamespace(namespace, nextTag);
		if (!isNull(nextHooks) && nextHooks.willUpdate) {
			triggerHook('willUpdate', nextHooks.willUpdate, domNode, lifecycle, null, null);
		}
		if (lastText !== nextText) {
			if (isNull(nextText)) {
				setTextContent(null, domNode as HTMLElement, false);
			} else {
				setTextContent(nextText as string, domNode as HTMLElement, !isNull(lastText));
			}
		} else {
			let lastChildren: Array<Input> | Input = lastVElement._children;
			let nextChildren: Array<Input> | Input = nextVElement._children;

			if (lastChildren !== nextChildren) {
				if (isNull(lastChildren)) {
					mount(nextChildren, domNode, lifecycle, instance, namespace, _isKeyed, context);
				} else {
					if (isFalse(isKeyed)) {
						nextChildren = nextVElement._children = normaliseInput(nextChildren);
					}
					patch(lastChildren, nextChildren, domNode, lifecycle, instance, namespace, _isKeyed, true, context);
				}
			}
		}
		const lastProps: Object = lastVElement._props;
		const nextProps: Object = nextVElement._props;
		
		if (lastProps !== nextProps) {
			patchObjects(lastProps, nextProps, setProperty, patchProperty, domNode);
		}
		const lastAttrs: Object = lastVElement._attrs;
		const nextAttrs: Object = nextVElement._attrs;
		
		if (lastAttrs !== nextAttrs) {
			patchObjects(lastAttrs, nextAttrs, setAttribute, patchAttribute, domNode);
		}
		const lastEvents: Object = lastVElement._events;
		const nextEvents: Object = nextVElement._events;
		
		if (lastEvents !== nextEvents) {
			patchObjects(lastEvents, nextEvents, setEvent, patchEvent, domNode);
		}		
		const lastRef: string | Function = lastVElement._ref;
		const nextRef: string | Function = nextVElement._ref;
		
		if (lastRef !== nextRef) {
			patchRef(instance, lastRef, nextRef, domNode);
		}
		if (!isNull(nextHooks) && nextHooks.didUpdate) {
			triggerHook('didUpdate', nextHooks.didUpdate, domNode, lifecycle, null, null);
		}
	}
}

function patchRef(instance: StatefulComponent, lastRef, nextRef, domNode) {
	if (instance) {
		if (isString(lastRef)) {
			delete instance.refs[lastRef];
		}
		if (isString(nextRef)) {
			instance.refs[nextRef] = domNode;
		}
	}
}

function patchVEmptyNode(lastVEmptyNode: VEmptyNode, nextVEmptyNode: VEmptyNode) {
	nextVEmptyNode._dom = lastVEmptyNode._dom;
}

function patchVAsyncNode(
	lastVAsyncNode: VAsyncNode, 
	nextVAsyncNode: VAsyncNode, 
	parentDomNode: HTMLElement | SVGAElement | DocumentFragment, 
	lifecycle: Lifecycle, 
	instance: StatefulComponent, 
	namespace: string, 
	isKeyed: boolean, 
	isRoot: boolean,
	context: Context
) {
	const lastInput: Input = lastVAsyncNode._lastInput;
	const nextAsync: Promise<any> = nextVAsyncNode._async;
	
	if (isNull(lastInput)) {
		if (isPromise(nextAsync)) {
			lastVAsyncNode._cancel = true;
			nextAsync.then(nextInput => {
				if (isFalse(nextVAsyncNode._cancel)) {
					nextInput = normaliseInput(nextInput);
					const domNode: HTMLElement | SVGAElement | DocumentFragment | Text = mount(nextInput, null, lifecycle, instance, namespace, isKeyed, context);
					
					replaceChild(parentDomNode, domNode, lastVAsyncNode._dom);
					nextVAsyncNode._dom = domNode;
					nextVAsyncNode._lastInput = nextInput;
				}
			});
		}
	} else {
		if (isPromise(nextAsync)) {
			patchInputWithPromiseInput(lastInput, nextVAsyncNode, parentDomNode, lifecycle, instance, namespace, isKeyed, isRoot, context);
		}
	}
}

export function patchInputWithPromiseInput(
	lastInput: Input, 
	vAsyncNode: VAsyncNode, 
	parentDomNode: HTMLElement | SVGAElement | DocumentFragment, 
	lifecycle: Lifecycle, 
	instance: StatefulComponent, 
	namespace: string, 
	isKeyed: boolean, 
	isRoot: boolean,
	context: Context
) {
	const promise: Promise<any> = vAsyncNode._async;
	
	promise.then(nextInput => {
		if (isFalse(vAsyncNode._cancel)) {
			nextInput = normaliseInput(nextInput);
			patch(lastInput, nextInput, parentDomNode, lifecycle, instance, namespace, isKeyed, isRoot, context);
			
			vAsyncNode._dom = getDomNodeFromInput(nextInput, parentDomNode);
			vAsyncNode._lastInput = nextInput;
		}
	})
}

function patchNonKeyedArray(
	lastArray: Array<Input>, 
	nextArray: Array<Input>, 
	parentDomNode: HTMLElement | SVGAElement | DocumentFragment, 
	lifecycle: Lifecycle, 
	instance: StatefulComponent, 
	namespace: string, 
	isRoot: boolean,
	context: Context
) {
	// optimisaiton technique, can we delay doing this upon finding an invalid child and then falling back?
	// it is expensive to do if we somehow know both arrays are the same length, even once flattened
	normaliseArray(nextArray, true);
	let lastArrayLength: number = lastArray.length;
	let nextArrayLength: number = nextArray.length;
	let commonLength: number = lastArrayLength > nextArrayLength ? nextArrayLength : lastArrayLength;
	let i: number = 0;
	
	for (; i < commonLength; i++) {
		patch(lastArray[i], nextArray[i], parentDomNode, lifecycle, instance, namespace, false, isRoot, context);
	}
	if (lastArrayLength < nextArrayLength) {
		for (i = commonLength; i < nextArrayLength; i++) {
			mount(nextArray[i], parentDomNode, lifecycle, instance, namespace, false, context);
		}
	} else if (lastArrayLength > nextArrayLength) {
		for (i = commonLength; i < lastArrayLength; i++) {
			unmount(lastArray[i], parentDomNode, lifecycle, instance, isRoot, false);
		}
	}	
}

function patchVTextNode(lastVTextNode: VTextNode, nextVTextNode: VTextNode) {
	const nextText = nextVTextNode._text;
	const domTextNode = lastVTextNode._dom;

	nextVTextNode._dom = domTextNode;
	if (lastVTextNode._text !== nextText) {
		setText(domTextNode as Text, nextVTextNode._text);
	}
}

// TODO this function should throw if it can't find the key on an item
function patchKeyedArray(
	lastArray: Array<Input>, 
	nextArray: Array<Input>, 
	parentDomNode: HTMLElement | SVGAElement | DocumentFragment, 
	lifecycle: Lifecycle, 
	instance: StatefulComponent, 
	namespace: string,
	context: Context,
	isRoot: boolean
) {
	let lastArrayLength = lastArray.length;
	let nextArrayLength = nextArray.length;
	let i;
	let lastEndIndex = lastArrayLength - 1;
	let nextEndIndex = nextArrayLength - 1;
	let lastStartIndex = 0;
	let nextStartIndex = 0;
	let lastStartNode = null;
	let nextStartNode = null;
	let nextEndNode = null;
	let lastEndNode = null;
	let index;
	let nextNode;
	let lastTarget = 0;
	let pos;
	let prevItem;
	
	while (lastStartIndex <= lastEndIndex && nextStartIndex <= nextEndIndex) {
		nextStartNode = nextArray[nextStartIndex];
		lastStartNode = lastArray[lastStartIndex];
		if (nextStartNode._key !== lastStartNode._key) {
			break;
		}
		patch(lastStartNode, nextStartNode, parentDomNode, lifecycle, instance, namespace, true, isRoot, context);
		nextStartIndex++;
		lastStartIndex++;
	}	
	while (lastStartIndex <= lastEndIndex && nextStartIndex <= nextEndIndex) {
		nextEndNode = nextArray[nextEndIndex];
		lastEndNode = lastArray[lastEndIndex];
		if (nextEndNode._key !== lastEndNode._key) {
			break;
		}
		patch(lastEndNode, nextEndNode, parentDomNode, lifecycle, instance, namespace, true, isRoot, context);
		nextEndIndex--;
		lastEndIndex--;
	}	
	while (lastStartIndex <= lastEndIndex && nextStartIndex <= nextEndIndex) {
		nextEndNode = nextArray[nextEndIndex];
		lastStartNode = lastArray[lastStartIndex];
		if (nextEndNode._key !== lastStartNode._key) {
			break;
		}
		nextNode = (nextEndIndex + 1 < nextArrayLength) ? (nextArray[nextEndIndex + 1] as VNode)._dom : null;
		patch(lastStartNode, nextEndNode, parentDomNode, lifecycle, instance, namespace, true, isRoot, context);
		appendOrInsertChild(parentDomNode, nextEndNode._dom, nextNode);
		nextEndIndex--;
		lastStartIndex++;
	}
	while (lastStartIndex <= lastEndIndex && nextStartIndex <= nextEndIndex) {
		nextStartNode = nextArray[nextStartIndex];
		lastEndNode = lastArray[lastEndIndex];
		if (nextStartNode._key !== lastEndNode._key) {
			break;
		}
		nextNode = (lastArray[lastStartIndex] as VNode)._dom;
		patch(lastEndNode, nextStartNode, parentDomNode, lifecycle, instance, namespace, true, isRoot, context);
		appendOrInsertChild(parentDomNode, nextStartNode._dom, nextNode);
		nextStartIndex++;
		lastEndIndex--;
	}	
	
	if (lastStartIndex > lastEndIndex) {
		if (nextStartIndex <= nextEndIndex) {
			nextNode = (nextEndIndex + 1 < nextArrayLength) ? (nextArray[nextEndIndex + 1] as VNode)._dom : null;
			for (; nextStartIndex <= nextEndIndex; nextStartIndex++) {
				appendOrInsertChild(parentDomNode, mount(nextArray[nextStartIndex], null, lifecycle, instance, namespace, true, context), nextNode);
			}
		}
	} else if (nextStartIndex > nextEndIndex) {
		while (lastStartIndex <= lastEndIndex) {
			unmount(lastArray[lastStartIndex++], parentDomNode, lifecycle, instance, isRoot, false);
		}
	} else {
		let aLength = lastEndIndex - lastStartIndex + 1;
		let bLength = nextEndIndex - nextStartIndex + 1;
		const sources = new Array(bLength);

		// Mark all nodes as inserted.
		for (i = 0; i < bLength; i++) {
			sources[i] = -1;
		}
		let moved = false;
		let removeOffset = 0;

		if (aLength * bLength <= 16) {
			for (i = lastStartIndex; i <= lastEndIndex; i++) {
				let removed = true;

				lastEndNode = lastArray[i];
				for (index = nextStartIndex; index <= nextEndIndex; index++) {
					nextEndNode = nextArray[index];
					if (lastEndNode._key === nextEndNode._key) {
						sources[index - nextStartIndex] = i;
						if (lastTarget > index) {
							moved = true;
						} else {
							lastTarget = index;
						}
						patch(lastEndNode, nextEndNode, parentDomNode, lifecycle, instance, namespace, true, isRoot, context);
						removed = false;
						break;
					}
				}
				if (removed) {
					unmount(lastEndNode, parentDomNode, lifecycle, instance, isRoot, false);
					removeOffset++;
				}
			}
		} else {
			const prevItemsMap = new Map();

			for (i = nextStartIndex; i <= nextEndIndex; i++) {
				prevItem = nextArray[i];
				prevItemsMap.set(prevItem._key, i);
			}
			for (i = lastEndIndex; i >= lastStartIndex; i--) {
				lastEndNode = lastArray[i];
				index = prevItemsMap.get(lastEndNode._key);

				if (index === undefined) {
					unmount(lastEndNode, parentDomNode, lifecycle, instance, isRoot, false);
					removeOffset++;
				} else {
					nextEndNode = nextArray[index];

					sources[index - nextStartIndex] = i;
					if (lastTarget > index) {
						moved = true;
					} else {
						lastTarget = index;
					}
					patch(lastEndNode, nextEndNode, parentDomNode, lifecycle, instance, namespace, true, isRoot, context);
				}
			}
		}
		if (moved) {
			const seq = lisAlgorithm(sources);

			index = seq.length - 1;
			for (i = bLength - 1; i >= 0; i--) {
				if (sources[i] === -1) {
					pos = i + nextStartIndex;
					nextNode = (pos + 1 < nextArrayLength) ? (nextArray[pos + 1] as VNode)._dom : null;
					appendOrInsertChild(parentDomNode, mount(nextArray[pos], null, lifecycle, instance, namespace, true, context), nextNode);
				} else {
					if (index < 0 || i !== seq[index]) {
						pos = i + nextStartIndex;
						nextNode = (pos + 1 < nextArrayLength) ? (nextArray[pos + 1]  as VNode)._dom : null;
						appendOrInsertChild(parentDomNode, (nextArray[pos]  as VNode)._dom, nextNode);
					} else {
						index--;
					}
				}
			}
		} else if (aLength - removeOffset !== bLength) {
			for (i = bLength - 1; i >= 0; i--) {
				if (sources[i] === -1) {
					pos = i + nextStartIndex;
					nextNode = (pos + 1 < nextArrayLength) ? (nextArray[pos + 1] as VNode)._dom : null;
					appendOrInsertChild(parentDomNode, mount(nextArray[pos], null, lifecycle, instance, namespace, true, context), nextNode);
				}
			}
		}
	}
}

// https://en.wikipedia.org/wiki/Longest_increasing_subsequence
	function lisAlgorithm(a) {
		let p = a.slice(0);
		let result = [];

		result.push(0);
		let i;
		let j;
		let u;
		let v;
		let c;

		for (i = 0; i < a.length; i++) {
			if (a[i] === -1) {
				continue;
			}
			j = result[result.length - 1];
			if (a[j] < a[i]) {
				p[i] = j;
				result.push(i);
				continue;
			}
			u = 0;
			v = result.length - 1;
			while (u < v) {
				c = ((u + v) / 2) | 0;
				if (a[result[c]] < a[i]) {
					u = c + 1;
				} else {
					v = c;
				}
			}
			if (a[i] < a[result[u]]) {
				if (u > 0) {
					p[i] = result[u - 1];
				}
				result[u] = i;
			}
		}
		u = result.length;
		v = result[u - 1];
		while (u-- > 0) {
			result[u] = v;
			v = p[v];
		}
		return result;
	}

function patchAttribute(name, lastValue, nextValue, domNode) {
	if (lastValue !== nextValue) {
		setAttribute(name, nextValue, domNode);
	}
}

function patchEvent(name, lastValue, nextValue, domNode, namespace) {
	if (lastValue !== nextValue) {
		setEvent(name, nextValue, domNode);
	}
}

function patchProperty(name, lastValue, nextValue, domNode: HTMLElement | SVGAElement | DocumentFragment) {
	if (lastValue !== nextValue) {
		if (name === 'className') {
			if (isNull(nextValue)) {
				(domNode as HTMLElement).removeAttribute('class')	
			} else {
				(domNode as HTMLElement).className = nextValue;
			}
		} else if (name === 'style') {
			patchStyle(lastValue, nextValue, domNode as HTMLElement)
		} else {
			domNode[name] = nextValue;
		}
	}
}

export function patchStyle(lastValue: string | number | boolean | Object, nextValue: string | number | boolean | Object, domNode: HTMLElement | SVGAElement) {
	if (isString(nextValue)) {
		domNode.style.cssText = nextValue;
	} else if (isNullOrUndef(lastValue)) {
		if (!isNullOrUndef(nextValue)) {
			const styleKeys = Object.keys(nextValue);

			for (let i = 0; i < styleKeys.length; i++) {
				const style = styleKeys[i];

				domNode.style[style] = nextValue[style];
			}
		}
	} else if (isNullOrUndef(nextValue)) {
		domNode.removeAttribute('style');
	} else {
		const styleKeys = Object.keys(nextValue);

		for (let i = 0; i < styleKeys.length; i++) {
			const style = styleKeys[i];

			domNode.style[style] = nextValue[style];
		}
		if (!isNullOrUndef(lastValue)) {
			const lastStyleKeys = Object.keys(lastValue);

			for (let i = 0; i < lastStyleKeys.length; i++) {
				const style = lastStyleKeys[i];
				if (isUndef(nextValue[style])) {
					domNode.style[style] = '';
				}
			}
		} else {
			debugger;
		}
	}
}