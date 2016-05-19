import {  
	isUndef, 
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
	isVTemplate
} from '../shared';
import { 
	replaceInputWithPlaceholder, 
	normaliseArray, 
	normaliseInput, 
	getDomNodeFromInput, 
	isVTextNode, 
	setText, 
	replaceVTextNodeWithInput, 
	replaceArrayWithInput, 
	replaceInputWithArray, 
	replaceVAsyncNodeWithInput, 
	replaceChild,
	setTextContent,
	setProperty,
	setAttribute
} from './shared';
import Lifecycle from './Lifecycle';
import { unmount } from './unmounting';
import { mount, mountVEmptyNode } from './mounting';

const badInput = 'Inferno Error: bad input(s) passed to "patch". Please ensure only valid objects are used in your render.';

export function patch(lastInput: Input, nextInput: Input, parentDomNode: HTMLElement | SVGAElement | DocumentFragment, lifecycle: Lifecycle, instance: StatefulComponent, namespace: string, isKeyed: boolean, isRoot: boolean): void {
	if (isVEmptyNode(nextInput)) {
		if (isVEmptyNode(lastInput)) {
			patchVEmptyNode(lastInput, nextInput);	
		} else {
			if (isTrue(isRoot)) {
				unmount(lastInput, parentDomNode, lifecycle, isRoot, false);
				lifecycle.deleteRoot();
			} else {
				mountVEmptyNode(nextInput, null);
				// replaceInputWithPlaceholder(lastInput, parentDomNode, lifecycle);	
				debugger;
			}
		}
	} else if (isVEmptyNode(lastInput)) {
		if (isTrue(isRoot)) {
			mount(nextInput, parentDomNode, lifecycle, instance, namespace, false);
		} else {
			// replacePlaceholderWithInput(nextInput, parentDomNode, lifecycle, instance, namespace, isKeyed);	
			debugger;
		}
	} else if (isArray(lastInput)) {
		if (isArray(nextInput)) {
			if (isKeyed) {
				patchKeyedArray(lastInput, nextInput, parentDomNode, lifecycle, instance, namespace);
			} else {
				patchNonKeyedArray(lastInput, nextInput, parentDomNode, lifecycle, instance, namespace, isRoot);
			}
		} else {
			replaceArrayWithInput(parentDomNode, mount(nextInput, null, lifecycle, instance, namespace, isKeyed), lastInput, lifecycle);
		}	
	} else if (isArray(nextInput)) {
		replaceInputWithArray(lastInput, nextInput, parentDomNode, lifecycle, instance, namespace, isKeyed);
	} else if (isVAsyncNode(nextInput)) {
		if (isVAsyncNode(lastInput)) {
			patchVAsyncNode(lastInput, nextInput, parentDomNode, lifecycle, instance, namespace, isKeyed, isRoot);
		} else {
			patchInputWithPromiseInput(lastInput, nextInput, parentDomNode, lifecycle, instance, namespace, isKeyed, isRoot);
		}
	} else if (isVTemplate(nextInput)) {
		debugger;
	} else if (isVTemplate(lastInput)) {
		debugger;
	} else if (isVElement(nextInput)) {
		if (isVElement(lastInput)) {
			patchVElement(lastInput, nextInput, parentDomNode, lifecycle, instance, namespace, isKeyed, isRoot);
		} else {
			debugger;	
		}
	} else if (isVElement(lastInput)) {
		debugger;
	} else if (isVComponent(nextInput)) {
		debugger;
	} else if (isVComponent(lastInput)) {
		debugger;
	} else if (isVAsyncNode(lastInput)) {
		const asyncLastInput = lastInput._lastInput;
		
		if (isNull(asyncLastInput)) {
			replaceVAsyncNodeWithInput(lastInput, nextInput, parentDomNode, lifecycle, instance, namespace, isKeyed);
		} else {
			patch(asyncLastInput, nextInput, parentDomNode, lifecycle, instance, namespace, isKeyed, isRoot);
		}
	} else if (isVTextNode(lastInput)) {
		if (isVTextNode(nextInput)) {
			patchVTextNode(lastInput, nextInput);
		} else {
			replaceVTextNodeWithInput(lastInput, nextInput, parentDomNode, lifecycle, instance, namespace, isKeyed)
		}
	} else {
		throw new Error(badInput);
	}
}

function patchObjects(lastObject, nextObject, setFunc, patchFunc, domNode, namespace) {
	if (isNull(nextObject)) {
		const keys = Object.keys(lastObject);
		
		for (let i = 0; i < keys.length; i++) {
			const name = keys[i];
			
			setFunc(name, null, domNode);
		}		
	} else {
		if (isNull(lastObject)) {
			const keys = Object.keys(nextObject);
		
			for (let i = 0; i < keys.length; i++) {
				const name = keys[i];
				
				setFunc(name, nextObject[name], domNode);
			}	
		} else {
			const lastKeys = Object.keys(lastObject);
			const nextKeys = Object.keys(nextObject);
			
			for (let i = 0; i < lastKeys.length; i++) {
				const name = lastKeys[i];
				
				if (!isUndef(nextObject[name])) {
					patchFunc(name, lastObject[name], nextObject[name], domNode, namespace);
				} else {
					setFunc(name, null, domNode, namespace);
				}
			}
			for (let i = 0; i < nextKeys.length; i++) {
				const name = nextKeys[i];
				
				if (isUndef(lastObject[name])) {
					setFunc(name, nextObject[name], domNode, namespace);
				}
			}
		}
	}
}

function patchVElement(lastVElement: VElement, nextVElement: VElement, parentDomNode, lifecycle, instance, namespace, isKeyed, isRoot) {
	const lastTag: string = lastVElement._tag;
	const nextTag: string = nextVElement._tag;
	const nextHooks = nextVElement._hooks;
	const domNode: HTMLElement | SVGAElement | DocumentFragment = lastVElement._dom;
	const _isKeyed = (lastVElement._isKeyed && nextVElement._isKeyed) || isKeyed;

	nextVElement._dom = domNode;
	if (lastTag !== nextTag) {
		unmount(lastVElement, null, lifecycle, isRoot, true);
		replaceChild(parentDomNode, mount(nextVElement, null, lifecycle, instance, namespace, _isKeyed), domNode);
	} else {
		const lastText: string | number = lastVElement._text;
		const nextText: string | number = nextVElement._text;

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
				lastChildren = normaliseInput(lastChildren);
				nextChildren = normaliseInput(nextChildren);
				patch(lastChildren, nextChildren, domNode, lifecycle, instance, namespace, _isKeyed, isRoot);
			}
		}
		const lastProps = lastVElement._props;
		const nextProps = nextVElement._props;
		
		if (lastProps !== nextProps) {
			patchObjects(lastProps, nextProps, setProperty, patchProperty, domNode, namespace);
		}
		const lastAttrs = lastVElement._attrs;
		const nextAttrs = nextVElement._attrs;
		
		if (lastAttrs !== nextAttrs) {
			patchObjects(lastAttrs, nextAttrs, setAttribute, patchAttribute, domNode, namespace);
		}		
		// TODO events
	}
}

function patchVEmptyNode(lastVEmptyNode: VEmptyNode, nextVEmptyNode: VEmptyNode) {
	nextVEmptyNode._dom = lastVEmptyNode._dom;
}

function patchVAsyncNode(lastVAsyncNode: VAsyncNode, nextVAsyncNode: VAsyncNode, parentDomNode: HTMLElement | SVGAElement | DocumentFragment, lifecycle: Lifecycle, instance: StatefulComponent, namespace: string, isKeyed: boolean, isRoot: boolean) {
	const lastInput: Input = lastVAsyncNode._lastInput;
	const nextAsync: Promise<any> = nextVAsyncNode._async;
	
	if (isNull(lastInput)) {
		if (isPromise(nextAsync)) {
			lastVAsyncNode._cancel = true;
			nextAsync.then(nextInput => {
				if (isFalse(nextVAsyncNode._cancel)) {
					nextInput = normaliseInput(nextInput);
					const domNode: HTMLElement | SVGAElement | DocumentFragment | Text = mount(nextInput, null, lifecycle, instance, namespace, isKeyed);
					
					replaceChild(parentDomNode, domNode, lastVAsyncNode._dom);
					nextVAsyncNode._dom = domNode;
					nextVAsyncNode._lastInput = nextInput;
				}
			});
		}
	} else {
		if (isPromise(nextAsync)) {
			patchInputWithPromiseInput(lastInput, nextVAsyncNode, parentDomNode, lifecycle, instance, namespace, isKeyed, isRoot);
		}
	}
}

export function patchInputWithPromiseInput(lastInput: Input, vAsyncNode: VAsyncNode, parentDomNode: HTMLElement | SVGAElement | DocumentFragment, lifecycle: Lifecycle, instance: StatefulComponent, namespace: string, isKeyed: boolean, isRoot: boolean) {
	const promise: Promise<any> = vAsyncNode._async;
	
	promise.then(nextInput => {
		if (isFalse(vAsyncNode._cancel)) {
			nextInput = normaliseInput(nextInput);
			patch(lastInput, nextInput, parentDomNode, lifecycle, instance, namespace, isKeyed, isRoot);
			
			vAsyncNode._dom = getDomNodeFromInput(nextInput, parentDomNode);
			vAsyncNode._lastInput = nextInput;
		}
	})
}

function patchNonKeyedArray(lastArray: Array<Input>, nextArray: Array<Input>, parentDomNode: HTMLElement | SVGAElement | DocumentFragment, lifecycle: Lifecycle, instance: StatefulComponent, namespace: string, isRoot: boolean) {
	// optimisaiton technique, can we delay doing this upon finding an invalid child and then falling back?
	// it is expensive to do if we somehow know both arrays are the same length, even once flattened
	lastArray = normaliseArray(lastArray, false);
	nextArray = normaliseArray(nextArray, true);
	let lastArrayLength: number = lastArray.length;
	let nextArrayLength: number = nextArray.length;
	let commonLength: number = lastArrayLength > nextArrayLength ? nextArrayLength : lastArrayLength;
	let i: number = 0;
	
	for (; i < commonLength; i++) {
		patch(lastArray[i], nextArray[i], parentDomNode, lifecycle, instance, namespace, false, isRoot);
	}
	if (lastArrayLength < nextArrayLength) {
		for (i = commonLength; i < nextArrayLength; i++) {
			mount(nextArray[i], parentDomNode, lifecycle, instance, namespace, false);
		}
	} else if (lastArrayLength > nextArrayLength) {
		for (i = commonLength; i < lastArrayLength; i++) {
			unmount(lastArray[i], parentDomNode, lifecycle, true, false);
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
function patchKeyedArray(lastArray: Array<Input>, nextArray: Array<Input>, parentDomNode: HTMLElement | SVGAElement | DocumentFragment, lifecycle: Lifecycle, instance: Object, namespace: string) {
	
}

function patchAttribute(name, lastValue, nextValue, domNode, namespace) {
	if (lastValue !== nextValue) {
		setAttribute(name, nextValue, domNode, namespace);
	}
}

function patchProperty(name, lastValue, nextValue, domNode) {
	if (lastValue !== nextValue) {
		if (name === 'className') {
			domNode.className = nextValue;
		} else if (name === 'style') {
			patchStyle(lastValue, nextValue, domNode)
		} else {
			domNode[name] = nextValue;
		}
	}
}

export function patchStyle(lastValue: string | number | boolean | Object, nextValue: string | number | boolean | Object, domNode: HTMLElement | SVGAElement) {
	if (isString(nextValue)) {
		domNode.style.cssText = nextValue;
	} else if (isUndef(lastValue)) {
		if (!isUndef(nextValue)) {
			const styleKeys = Object.keys(nextValue);

			for (let i = 0; i < styleKeys.length; i++) {
				const style = styleKeys[i];

				domNode.style[style] = nextValue[style];
			}
		}
	} else if (isUndef(nextValue)) {
		domNode.removeAttribute('style');
	} else {
		const styleKeys = Object.keys(nextValue);

		for (let i = 0; i < styleKeys.length; i++) {
			const style = styleKeys[i];

			domNode.style[style] = nextValue[style];
		}
		const lastStyleKeys = Object.keys(lastValue);

		for (let i = 0; i < lastStyleKeys.length; i++) {
			const style = lastStyleKeys[i];
			if (isUndef(nextValue[style])) {
				domNode.style[style] = '';
			}
		}
	}
}