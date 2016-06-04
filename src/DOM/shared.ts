import { 
	isUndef, 
	isArray, 
	isInvalid, 
	isStringOrNumber,
	Input, 
	VComponent, 
	VTemplate, 
	VElement, 
	VNode, 
	VTextNode as VTextNodeType, 
	isNull, 
	isPromise, 
	isFalse, 
	isVNode,
	StatefulComponent,
	Context
} from '../shared';
import VTextNode from './VTextNode';
import VAsyncNode from '../core/VAsyncNode';
import VEmptyNode from '../core/VEmptyNode';
import { unmount } from './unmounting';
import { mount, mountVComponent, mountVElement, mountVEmptyNode } from './mounting';
import { patch, patchInputWithPromiseInput, patchStyle } from './patching';
import Lifecycle from './Lifecycle';

export const SVGNamespace = 'http://www.w3.org/2000/svg';

const normalisedArrays: Map<Array<any>, boolean> = new Map();

export function isVTextNode(obj: any): obj is VTextNodeType {
	return !isUndef(obj._t);
}

export function isVTemplate(obj: any): obj is VTemplate {
	return !isUndef(obj.bp);
}

export function createPlaceholder(): Text {
	return createTextNode('');
}

export function appendChild(
	parentDomNode: HTMLElement | SVGAElement | DocumentFragment, 
	childDomNode: HTMLElement | SVGAElement | DocumentFragment | Text
) {
	parentDomNode.appendChild(childDomNode);
}

export function replaceChild(
	parentDomNode: HTMLElement | SVGAElement | DocumentFragment, 
	newDomNode: HTMLElement | SVGAElement | DocumentFragment | Text, 
	oldDomNode: HTMLElement | SVGAElement | DocumentFragment | Text
) {
	parentDomNode.replaceChild(newDomNode, oldDomNode);
}

export function removeChild(
	parentDomNode: HTMLElement | SVGAElement | DocumentFragment, 
	childDomNode: HTMLElement | SVGAElement | DocumentFragment | Text
) {
	parentDomNode.removeChild(childDomNode);
}

export function appendOrInsertChild(
	parentDomNode: HTMLElement | SVGAElement | DocumentFragment, 
	newDomNode: HTMLElement | SVGAElement | DocumentFragment | Text, 
	nextDomNode: HTMLElement | SVGAElement | DocumentFragment | Text
) {
	if (isUndef(nextDomNode)) {
		parentDomNode.appendChild(newDomNode);
	} else {
		parentDomNode.insertBefore(newDomNode, nextDomNode);
	}
}

export function setEvent(event: string, value: Function, domNode: HTMLElement | SVGAElement | DocumentFragment) {
	domNode[event] = value;
}

export function setText(textNode: Text, text: string | number) {
	textNode.nodeValue = (text as string);
}

export function setTextContent(text: string, domNode: HTMLElement | SVGAElement, update: boolean) {
	if (update) {
		setText(domNode.firstChild as Text, text);
	} else {
		if (text === null) {
			domNode.textContent = '';
		} else {
			if (text !== '') {
				domNode.textContent = text;
			} else {
				appendChild(domNode, createTextNode(''));
			}
		}
	}
}

export function createTextNode(text: string | number): Text {
	return document.createTextNode(text as string);
}

export function createElement(tag, namespace): HTMLElement | SVGAElement {
	if (namespace) {
		return document.createElementNS(namespace, tag);
	} else {
		return document.createElement(tag);
	}
}

export function getNamespace(namespace, tag) {
	if (!namespace && tag === 'svg') {
		return SVGNamespace;
	}
	return namespace;
}

function getAttrNamespace(name: string): string {
	if (name.substring(0, 6) === 'xlink:') {
		return 'http://www.w3.org/1999/xlink';
	} else if (name.substring(0, 4) === 'xml:') {
		return 'http://www.w3.org/XML/1998/namespace';
	}
	return null;
}

export function setAttribute(name: string, value: string | number, domNode: HTMLElement | SVGAElement) {
	const namespace = getAttrNamespace(name);

	if (!isInvalid(value)) {
		if (namespace) { 
			domNode.setAttributeNS(namespace, name, value as string);
		} else {
			domNode.setAttribute(name, value as string);	
		}
	} else {
		domNode.removeAttribute(name);
	}
}

export function setProperty(name: string, value: string | number | boolean | Object, domNode : HTMLElement | SVGAElement) {
	if (!isInvalid(value)) {
		if (name === 'className') {
			domNode.className = value;
		} else if (name === 'style') {
			patchStyle(null, value, domNode);
		} else {
			domNode[name] = value;
		}
	} else {
		if (name === 'className') {
			domNode.removeAttribute('class');
		} else if (name === 'style') {
			domNode.removeAttribute('style');	
		} else {
			domNode[name] = '';	
		}
	}
}

function deepNormaliseArray(oldArr: Array<any>, newArr: Array<any>) {
	for (let i = 0; i < oldArr.length; i++) {
		const item = oldArr[i];

		if (isArray(item)) {
			deepNormaliseArray(item, newArr);
		} else if (!isInvalid(item)) {
			if (isStringOrNumber(item)) {
				newArr.push(new VTextNode(item));
			} else if (isPromise(item)) {
				newArr.push(new VAsyncNode(item));
			} else {
				newArr.push(item);
			}
		}
	}
}

export function normaliseArray(array: Array<any>, mutate: boolean): Array<Input> {
	if (!isUndef(normalisedArrays.get(array)) && mutate) {
		return array;
	}
	if (mutate) {
		const copy: Array<any> = array.slice(0);

		normalisedArrays.set(array, true);
		array.length = 0;
		deepNormaliseArray(copy, array);
		return array;
	} else {
		const newArray: Array<any> = [];

		normalisedArrays.set(array, true);
		deepNormaliseArray(array, newArray);
		return newArray;
	}
}

export function normaliseInput(input: Input): Input {
	if (isInvalid(input)) {
		return new VEmptyNode();
	} else if (isVNode(input)) {
		return input;
	} else if (isStringOrNumber(input)) {
		return new VTextNode(input as string | number);
	} else if (isPromise(input)) {
		return new VAsyncNode(input as Promise<any>);
	}
	return input;
}

export function getDomNodeFromInput(
	input: Input, 
	parentDomNode: HTMLElement | SVGAElement | DocumentFragment
): HTMLElement | DocumentFragment | SVGAElement | Text {
	if (!isUndef((input as VNode)._dom)) {
		return (input as VNode)._dom;
	} else if (isArray(input)) {
		return getDomNodeFromInput(input[0], parentDomNode);
	} else {
		debugger;
		// TODO
	}
}

export function triggerHook(
	name: string, 
	func: Function, 
	domNode: HTMLElement | SVGAElement | DocumentFragment, 
	lifecycle: Lifecycle, 
	lastProps: Object, 
	nextProps: Object
) {
	switch (name) {
		case 'attached':
		case 'detached':
		case 'componentDidMount':
			lifecycle.callback(() => {
				func(domNode);
			});
			break;
		default:
			return func(domNode, lastProps, nextProps);
	}
}

export function replaceInputWithVElement(
	input: Input, 
	vElement: VElement, 
	parentDomNode: HTMLElement | SVGAElement | DocumentFragment, 
	lifecycle: Lifecycle, 
	instance: StatefulComponent, 
	namespace: string, 
	isKeyed: boolean, 
	isRoot: boolean,
	context: Context
) {
	const domNode = mountVElement(vElement, null, lifecycle, instance, namespace, context);
	
	replaceChild(parentDomNode, domNode, getDomNodeFromInput(input, null));
	unmount(input, parentDomNode, lifecycle, instance, isRoot, true);
}

export function replaceInputWithVComponent(
	input: Input, 
	vComponent: VComponent, 
	parentDomNode: HTMLElement | SVGAElement | DocumentFragment, 
	lifecycle: Lifecycle, 
	instance: StatefulComponent, 
	namespace: string, 
	isKeyed: boolean, 
	isRoot: boolean,
	context: Context
) {
	const domNode = mountVComponent(vComponent, null, lifecycle, instance, namespace, isKeyed, context);
	
	replaceChild(parentDomNode, domNode, getDomNodeFromInput(input, null));
	unmount(input, parentDomNode, lifecycle, instance, isRoot, true);
}

export function replaceEmptyNodeWithInput(
	vEmptyNode: VEmptyNode, 
	input: Input, 
	parentDomNode: HTMLElement | SVGAElement | DocumentFragment, 
	lifecycle: Lifecycle, 
	instance: StatefulComponent, 
	namespace: string,
	isKeyed: boolean,
	context: Context
) {
	const emptyDomNode = vEmptyNode._dom;

	if (!isInvalid(input) && !isVNode(input)) {
		input = normaliseInput(input);
	}
	replaceChild(parentDomNode, mount(input, null, lifecycle, instance, namespace, isKeyed, context), emptyDomNode);
}

export function replaceInputWithEmptyNode(
	input: Input, 
	vEmptyNode: VEmptyNode, 
	parentDomNode: HTMLElement | SVGAElement | DocumentFragment, 
	lifecycle: Lifecycle, 
	instance: StatefulComponent
): void {
	replaceChild(parentDomNode, mountVEmptyNode(vEmptyNode, null), getDomNodeFromInput(input, null));
}

export function replaceVTextNodeWithInput(
	vTextNode: VTextNode, 
	input: Input, 
	parentDomNode: HTMLElement | SVGAElement | DocumentFragment, 
	lifecycle: Lifecycle, 
	instance: StatefulComponent, 
	namespace: string, 
	isKeyed: boolean,
	context: Context
): void {
	const domTextNode = vTextNode._dom;

	if (!isInvalid(input) && !isVNode(input)) {
		input = normaliseInput(input);
	}
	replaceChild(parentDomNode, mount(input, null, lifecycle, instance, namespace, isKeyed, context), domTextNode);
}

export function replaceArrayWithInput(
	parentDomNode: HTMLElement | SVGAElement | DocumentFragment, 
	newDomNode: HTMLElement | SVGAElement | DocumentFragment | Text, 
	oldArray: Array<any>, 
	lifecycle: Lifecycle, 
	instance: StatefulComponent
): void {
	// we need to insert out new object before the first item of the array, then unmount the array
	const firstItem: Array<Input> = oldArray[0];
	let firstDomNode: HTMLElement | Text;

	appendOrInsertChild(parentDomNode, newDomNode, getDomNodeFromInput(firstItem, null));
	unmount(oldArray, parentDomNode, lifecycle, instance, true, false);	
}

export function replaceInputWithArray(
	input: Input, 
	array: Array<Input>, 
	parentDomNode: HTMLElement | SVGAElement | DocumentFragment, 
	lifecycle: Lifecycle, 
	instance: StatefulComponent, 
	namespace: string, 
	isKeyed: boolean,
	context: Context
): void {
	replaceChild(parentDomNode, mount(array, null, lifecycle, instance, namespace, isKeyed, context), getDomNodeFromInput(input, null));
}

export function replaceVAsyncNodeWithInput(
	vAsyncNode: VAsyncNode, 
	input: Input, 
	parentDomNode: HTMLElement | SVGAElement | DocumentFragment, 
	lifecycle: Lifecycle, 
	instance: StatefulComponent, 
	namespace: string, 
	isKeyed: boolean,
	context: Context
): void {
	const domNode: HTMLElement | SVGAElement | DocumentFragment | Text = vAsyncNode._dom;
	
	vAsyncNode._cancel = true;
	if (!isInvalid(input) && !isVNode(input)) {
		input = normaliseInput(input);
	}
	replaceChild(parentDomNode, mount(input, null, lifecycle, instance, namespace, isKeyed, context), domNode);
}

// TODO: for node we need to check if document is valid
export function getActiveNode() {
	return document.activeElement;
}

export function resetActiveNode(activeNode) {
	if (activeNode !== null && activeNode !== document.body && document.activeElement !== activeNode) {
		activeNode.focus(); // TODO: verify are we doing new focus event, if user has focus listener this might trigger it
	}
}