import { Input, isArray, isTrue, isFalse, isVAsyncNode, VAsyncNode, VTextNode } from '../shared';
import Lifecycle from './Lifecycle';
import { isVTextNode, removeChild } from './shared';

function unmountArray(array: Array<Input>, domNode: HTMLElement, lifecycle: Lifecycle, isRoot: boolean, isReplace: boolean) {
	for (let i = 0; i < array.length; i++) {
		unmount(array[i], domNode, lifecycle, isRoot, isReplace);
	}
}

export function unmount(input: Input, parentDomNode: HTMLElement, lifecycle: Lifecycle, isRoot: boolean, isReplace: boolean): void {
	if (isArray(input)) {
		unmountArray(input, parentDomNode, lifecycle, isRoot, isReplace);
	} else if (isVTextNode(input)) {
		unmountVTextNode(input, parentDomNode, isRoot, isReplace);
	} else if (isVAsyncNode(input)) {
		unmountVAsyncNode(input, parentDomNode, isRoot, isReplace);
	}
}

function unmountVTextNode(vTextNode: VTextNode, parentDomNode: HTMLElement, isRoot: boolean, isReplace: boolean) {
	if (isTrue(isRoot) && isFalse(isReplace)) {
		removeChild(parentDomNode, vTextNode._dom);
	}
}

function unmountVAsyncNode(vAsyncNode: VAsyncNode, parentDomNode: HTMLElement, isRoot: boolean, isReplace: boolean) {
	vAsyncNode._cancel = true;
	if (isTrue(isRoot) && isFalse(isReplace)) {
		removeChild(parentDomNode, vAsyncNode._dom);
	}
}