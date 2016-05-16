import { isUndef, Input, isInvalid, isNull, isArray, isStringOrNumber, VComponent, VElement, isVElement, isVComponent, VAsyncNode, isVAsyncNode, VTemplate, isFalse, isPromise, HTMLNode } from '../shared';
import { isVTextNode, isVTemplate, createPlaceholder, createTextNode, appendChild, normaliseArray, replaceChild } from './shared';
import Lifecycle from './Lifecycle';
import VTextNode from './VTextNode';

export function mount(input: Input, parentDomNode: HTMLElement | DocumentFragment, lifecycle: Lifecycle, instance: Object, namespace: string, isKeyed: boolean): HTMLElement | Text | DocumentFragment {
	if (isInvalid(input)) {
		return createPlaceholder(parentDomNode);
	} else if (isStringOrNumber(input)) {
		throw new Error(`Inferno Error: invalid mount input of "${ typeof input }". Ensure the String or Number is wrapped in a VElement, VComponent, VTemplate or Array.`);
	} else if (isVTextNode(input)) {
		return mountVTextNode(input, parentDomNode);
	} else if (isVComponent(input)) {
		return mountVComponent(input, parentDomNode, lifecycle, instance, namespace);
	} else if (isVElement(input)) {
		return mountVElement(input, parentDomNode, lifecycle, instance, namespace);
	} else if (isVTemplate(input)) {
		return mountVTemplate(input, parentDomNode, lifecycle, instance);
	} else if (isVAsyncNode(input)) {
		return mountVAsyncNode(input, parentDomNode, lifecycle, instance, namespace, isKeyed);
	} else if (isArray(input)) {
		let domNode: HTMLElement | DocumentFragment = parentDomNode;
		
		if (isNull(parentDomNode)) {
			domNode = document.createDocumentFragment();
		}
		if (isFalse(isKeyed)) {
			mountArray(normaliseArray(input, true), domNode, lifecycle, instance, namespace, false);
		} else {
			mountArray(input, domNode, lifecycle, instance, namespace, true);
		}
		return domNode;
	} else {
		throw new Error('Inferno Error: failed to "mount", invalid object was detected. Valid "mount" types are Array, Promise, Function, VTextNode, VElement, VComponent, VAsyncNode and VTemplate.');
	}
}

function mountVTextNode(vTextNode: VTextNode, parentDomNode: HTMLElement | DocumentFragment): any {
	const domTextNode = createTextNode(vTextNode._text);

	vTextNode._dom = domTextNode;
	if (!isNull(parentDomNode)) {
		appendChild(parentDomNode, domTextNode);
	}
	return domTextNode;
}

function mountVComponent(vComponent: VComponent, parentDomNode: HTMLElement | DocumentFragment, lifecycle: Lifecycle, instance: Object, namespace: String): any {
	// TODO
}

function mountVElement(vComponent: VElement, parentDomNode: HTMLElement | DocumentFragment, lifecycle: Lifecycle, instance: Object, namespace: String): any {
	// TODO
}

function mountVTemplate(vComponent: VTemplate, parentDomNode: HTMLElement | DocumentFragment, lifecycle: Lifecycle, instance: Object): any {
	// TODO
}

function mountVAsyncNode(vAsyncNode: VAsyncNode, parentDomNode: HTMLElement | DocumentFragment, lifecycle: Lifecycle, instance: Object, namespace: string, isKeyed: boolean): Text {
	const _async = vAsyncNode._async;
	const placeholder = createPlaceholder(null);
	 
	vAsyncNode._dom = placeholder;
	if (isPromise(_async)) {
		_async.then(input => {
			if (isFalse(vAsyncNode._cancel)) {
				if (isStringOrNumber(input)) {
					input = new VTextNode(input as string | number);
				}
				const domNode: HTMLNode = mount(input, null, lifecycle, instance, namespace, isKeyed);
					
				replaceChild(parentDomNode || (placeholder.parentNode as HTMLElement), domNode, placeholder);
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

function mountArray(array: Array<Input>, domNode: HTMLElement | DocumentFragment, lifecycle, instance, namespace, isKeyed) {
	for (let i: number = 0; i < array.length; i++) {
		let arrayItem: Input = array[i];

		mount(arrayItem, domNode, lifecycle, instance, namespace, isKeyed);
	}
}