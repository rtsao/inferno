import { isUndef, isArray, isInvalid, isStringOrNumber, VComponent, VTemplate, VTextNode as VTextNodeType } from '../shared';
import VTextNode from './VTextNode';

// When we mount or patch to an invalid input, instead of doing nothing, we insert a "placeholder"
// which is an empty textNode. To track these placeholders we use a map, where the key is the DOM node.
export const placeholders: Map<HTMLElement | DocumentFragment, Comment> = new Map();
const normalisedArrays: Map<HTMLElement, boolean> = new Map();

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

export function appendChild(parentDomNode, childDomNode) {
	parentDomNode.appendChild(childDomNode);
}

export function createTextNode(text: string) {
	return document.createTextNode(text);
}

function deepNormaliseArray(oldArr, newArr) {
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

export function normaliseArray(array, mutate) {
	if (isUndef(normalisedArrays.get(array))) {
		if (mutate) {
			const copy = array.slice(0);

			normalisedArrays.set(array, true);
			array.length = 0;
			deepNormaliseArray(copy, array);
		} else {
			const newArray = [];

			normalisedArrays.set(array, true);
			deepNormaliseArray(array, newArray);
			return newArray;
		}
	}
	return array;
}