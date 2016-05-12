import { isUndef, Input, isInvalid, isStringOrNumber, VTextNode, VElement } from '../shared';
import { isVTextNode, isVComponent, createPlaceholder, createTextNode, appendChild } from './shared';
import { Lifecyle } from './rendering';

export function mount(input: Input, parentDomNode: HTMLElement, lifecycle: Lifecyle, instance: Function, namespace: string, isKeyed: boolean): HTMLElement | Text | Comment {
	let domNode: HTMLElement | Text | Comment;

	if (isInvalid(input)) {
		domNode = createPlaceholder(parentDomNode);
	} else if (isStringOrNumber(input)) {
		throw new Error(`Inferno Error: invalid mount input of "${ typeof input }". Ensure the String or Number is wrapped in a VElement, VComponent, VTemplate or Array.`);
	} else if (isVTextNode(input)) {
		domNode = mountVTextNode(input, parentDomNode);
	} else if (isVComponent(input)) {
		domNode = mountVComponent(input, parentDomNode, lifecycle, instance, namespace);
	}
	return domNode;
}

function mountVTextNode(vTextNode: VTextNode, parentDomNode): any {
	const domTextNode = createTextNode(vTextNode._text);

	vTextNode._dom = domTextNode;
	if (parentDomNode) {
		appendChild(parentDomNode, domTextNode);
	}
	return domTextNode;
}

function mountVComponent(vComponent, parentDomNodem, lifecycle, instance, namespace): any {
	// TODO
}