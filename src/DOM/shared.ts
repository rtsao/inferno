import { isUndef, isArray, isInvalid, isStringOrNumber, Input, VComponent, VTemplate, VTextNode as VTextNodeType } from '../shared';
import VTextNode from './VTextNode';
import { unmount } from './unmounting';
import { mount } from './mounting';
import Lifecycle from './Lifecycle';

// When we mount or patch to an invalid input, instead of doing nothing, we insert a "placeholder"
// which is an empty textNode. To track these placeholders we use a map, where the key is the DOM node.
export const placeholders: Map<HTMLElement | DocumentFragment, Comment> = new Map();
const normalisedArrays: Map<Array<any>, boolean> = new Map();

export function isVTextNode(obj: any): obj is VTextNodeType {
	return !isUndef(obj._t);
}

export function isVTemplate(obj: any): obj is VTemplate {
	return !isUndef(obj.bp);
}

export function createPlaceholder(parentDomNode: HTMLElement | DocumentFragment): Comment {
	const placeholder: Comment = document.createComment('');

	placeholders.set(parentDomNode, placeholder);
	return placeholder;
}

export function appendChild(parentDomNode: HTMLElement | DocumentFragment, childDomNode: HTMLElement | Text | Comment | DocumentFragment) {
	parentDomNode.appendChild(childDomNode);
}

export function replaceChild(parentDomNode: HTMLElement, newDomNode: HTMLElement | Text | Comment | DocumentFragment, oldDomNode: HTMLElement | Text | Comment | DocumentFragment) {
	parentDomNode.replaceChild(newDomNode, oldDomNode);
}

export function createTextNode(text: string) {
	return document.createTextNode(text);
}

function deepNormaliseArray(oldArr: Array<any>, newArr: Array<any>) {
	for (let i = 0; i < oldArr.length; i++) {
		const item = oldArr[i];

		if (isArray(item)) {
			deepNormaliseArray(item, newArr);
		} else if (isStringOrNumber(item)) {
			newArr.push(new VTextNode(item));
		} else if (!isInvalid(item)) {
			newArr.push(item);
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

export function getDomNodeFromInput(input: Input, parentDomNode: HTMLElement): HTMLElement | Text {
	if (!isUndef(input._dom)) {
		return input._dom;
	} else if (isArray(input)) {
		return getDomNodeFromInput(input[0], parentDomNode);
	} else {
		// TODO
	}
}

export function replaceInputWithPlaceholder(input: Input, parentDomNode: HTMLElement, lifecycle: Lifecycle) {
	const placeholder = createPlaceholder(parentDomNode);

	replaceChild(parentDomNode, placeholder, getDomNodeFromInput(input, parentDomNode));
	unmount(input, parentDomNode, lifecycle, true, true);
}

export function replacePlaceholderWithInput(input: Input, parentDomNode: HTMLElement, lifecycle: Lifecycle, instance: Object, namespace: string, isKeyed: boolean) {
	const placeholder = placeholders.get(parentDomNode);

	if (placeholder) {
		const domNode = mount(input, null, lifecycle, instance, namespace, isKeyed);

		replaceChild(parentDomNode, domNode, placeholder);
		placeholders.delete(parentDomNode);
	}
}