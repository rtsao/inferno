import { isUndef } from '../shared';

// When we mount or patch to an invalid input, instead of doing nothing, we insert a "placeholder"
// which is an empty textNode. To track these placeholders we use a map, where the key is the DOM node.
export const placeholders: Map<HTMLElement, Comment> = new Map();

export function isVTextNode(obj: any): boolean {
	return !isUndef(obj._t);
}

export function isVComponent(obj: any): boolean {
	return !isUndef(obj._component);
}

export function createPlaceholder(parentDomNode: HTMLElement): Comment {
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