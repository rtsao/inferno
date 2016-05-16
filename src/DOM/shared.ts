import { isUndef, isArray, isInvalid, isStringOrNumber, HTMLNode, Input, VComponent, VTemplate, VElement, VNode, VTextNode as VTextNodeType, isNull, isPromise, isFalse, isVNode } from '../shared';
import VTextNode from './VTextNode';
import VAsyncNode from '../core/VAsyncNode';
import { unmount } from './unmounting';
import { mount } from './mounting';
import { patch, patchInputWithPromiseInput } from './patching';
import Lifecycle from './Lifecycle';

// When we mount or patch to an invalid input, instead of doing nothing, we insert a "placeholder"
// which is an empty textNode. To track these placeholders we use a map, where the key is the DOM node.
export const placeholders: Map<HTMLElement | DocumentFragment, Text> = new Map();
const normalisedArrays: Map<Array<any>, boolean> = new Map();

export function isVTextNode(obj: any): obj is VTextNodeType {
	return !isUndef(obj._t);
}

export function isVTemplate(obj: any): obj is VTemplate {
	return !isUndef(obj.bp);
}

export function createPlaceholder(parentDomNode: HTMLElement | DocumentFragment): Text {
	const placeholder: Text = document.createTextNode('');
	
	if (!isNull(parentDomNode)) {
		placeholders.set(parentDomNode, placeholder);
	}
	return placeholder;
}

export function appendChild(parentDomNode: HTMLElement | DocumentFragment, childDomNode: HTMLNode) {
	parentDomNode.appendChild(childDomNode);
}

export function replaceChild(parentDomNode: HTMLElement | DocumentFragment, newDomNode: HTMLNode, oldDomNode: HTMLNode) {
	parentDomNode.replaceChild(newDomNode, oldDomNode);
}

export function removeChild(parentDomNode: HTMLElement | DocumentFragment, childDomNode: HTMLNode) {
	parentDomNode.removeChild(childDomNode);
}

function appendOrInsertChild(parentDomNode: HTMLElement | DocumentFragment, newDomNode: HTMLNode, nextDomNode: HTMLNode) {
	if (isUndef(nextDomNode)) {
		parentDomNode.appendChild(newDomNode);
	} else {
		parentDomNode.insertBefore(newDomNode, nextDomNode);
	}
}

export function setText(textNode: Text, text: string | number) {
	textNode.nodeValue = (text as string);
}

export function createTextNode(text: string | number) {
	return document.createTextNode(text as string);
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

export function normaliseArray(array: Array<any>, mutate: boolean) {
	if (isUndef(normalisedArrays.get(array))) {
		if (mutate) {
			const copy: Array<any> = array.slice(0);

			normalisedArrays.set(array, true);
			array.length = 0;
			deepNormaliseArray(copy, array);
		} else {
			const newArray: Array<any> = [];

			normalisedArrays.set(array, true);
			deepNormaliseArray(array, newArray);
			return newArray;
		}
	}
	return array;
}

export function normaliseInput(input: Input): Input {
	if (isStringOrNumber(input)) {
		return new VTextNode(input as string | number);
	} else if (isPromise(input)) {
		return new VAsyncNode(input as Promise<any>);
	}
	return input;
}

export function getDomNodeFromInput(input: Input, parentDomNode: HTMLElement): HTMLNode {
	if (!isUndef((input as VNode)._dom)) {
		return (input as VNode)._dom;
	} else if (isArray(input)) {
		return getDomNodeFromInput(input[0], parentDomNode);
	} else {
		debugger;
		// TODO
	}
}

export function replaceInputWithPlaceholder(input: Input, parentDomNode: HTMLElement, lifecycle: Lifecycle): void {
	const placeholder = createPlaceholder(parentDomNode);

	if (isArray(input)) {
		appendOrInsertChild(parentDomNode, placeholder, getDomNodeFromInput(input, parentDomNode));
		unmount(input, parentDomNode, lifecycle, true, false);
	} else {
		replaceChild(parentDomNode, placeholder, getDomNodeFromInput(input, parentDomNode));
		unmount(input, parentDomNode, lifecycle, true, true);
	}
}

export function replacePlaceholderWithInput(input: Input, parentDomNode: HTMLElement, lifecycle: Lifecycle, instance: Object, namespace: string, isKeyed: boolean): void {
	const placeholder = placeholders.get(parentDomNode);

	if (placeholder) {
		const domNode = mount(input, null, lifecycle, instance, namespace, isKeyed);

		replaceChild(parentDomNode, domNode, placeholder);
		placeholders.delete(parentDomNode);
	}
}

export function replaceVTextNodeWithInput(vTextNode: VTextNode, input: Input, parentDomNode: HTMLElement, lifecycle: Lifecycle, instance: Object, namespace: string, isKeyed: boolean): void {
	const domTextNode = vTextNode._dom;

	if (!isInvalid(input) && !isVNode(input)) {
		input = normaliseInput(input);
	}
	replaceChild(parentDomNode, mount(input, null, lifecycle, instance, namespace, isKeyed), domTextNode);
}

export function replaceArrayWithInput(parentDomNode, newDomNode, oldArray, lifecycle): void {
	// we need to insert out new object before the first item of the array, then unmount the array
	const firstItem: Array<Input> = oldArray[0];
	let firstDomNode: HTMLElement | Text;

	appendOrInsertChild(parentDomNode, newDomNode, getDomNodeFromInput(firstItem, null));
	unmount(oldArray, parentDomNode, lifecycle, true, false);	
}

export function replaceInputWithArray(input: Input, array: Array<Input>, parentDomNode: HTMLElement, lifecycle: Lifecycle, instance, namespace, isKeyed): void {
	replaceChild(parentDomNode, mount(array, null, lifecycle, instance, namespace, isKeyed), getDomNodeFromInput(input, null));
}

export function replaceVAsyncNodeWithInput(vAsyncNode: VAsyncNode, input: Input, parentDomNode: HTMLElement, lifecycle: Lifecycle, instance: Object, namespace: string, isKeyed: boolean): void {
	const domNode: HTMLNode = vAsyncNode._dom;
	
	vAsyncNode._cancel = true;
	if (!isInvalid(input) && !isVNode(input)) {
		input = normaliseInput(input);
	}
	replaceChild(parentDomNode, mount(input, null, lifecycle, instance, namespace, isKeyed), domNode);
}