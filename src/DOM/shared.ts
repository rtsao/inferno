import { isUndef, VTextNode, VComponent, VTemplate } from '../shared';

// When we mount or patch to an invalid input, instead of doing nothing, we insert a "placeholder"
// which is an empty textNode. To track these placeholders we use a map, where the key is the DOM node.
export const placeholders: Map<HTMLElement | DocumentFragment, Comment> = new Map();

export function isVTextNode(obj: any): obj is VTextNode {
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