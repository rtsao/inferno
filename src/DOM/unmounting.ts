import { Input, isArray, isTrue, isFalse, isVAsyncNode, VAsyncNode, VTextNode, isVElement, isString, VElement, Hooks } from '../shared';
import Lifecycle from './Lifecycle';
import { isVTextNode, removeChild, triggerHook } from './shared';

function unmountArray(array: Array<Input>, domNode: HTMLElement | SVGAElement | DocumentFragment, lifecycle: Lifecycle, isRoot: boolean, isReplace: boolean) {
	for (let i = 0; i < array.length; i++) {
		unmount(array[i], domNode, lifecycle, isRoot, isReplace);
	}
}

export function unmount(input: Input, parentDomNode: HTMLElement | SVGAElement | DocumentFragment, lifecycle: Lifecycle, isRoot: boolean, isReplace: boolean): void {
	if (isArray(input)) {
		unmountArray(input, parentDomNode, lifecycle, isRoot, isReplace);
	} else if (isVTextNode(input)) {
		unmountVTextNode(input, parentDomNode, isRoot, isReplace);
	} else if (isVAsyncNode(input)) {
		unmountVAsyncNode(input, parentDomNode, isRoot, isReplace);
	} else if (isVElement(input)) {
		unmountVElement(input, parentDomNode, lifecycle, isRoot, isReplace);
	}
}

function unmountVElement(vElement: VElement, parentDomNode: HTMLElement | SVGAElement | DocumentFragment, lifecycle: Lifecycle, isRoot: boolean, isReplace: boolean) {
	const hooks: Hooks = vElement._hooks;
	const domNode: HTMLElement | SVGAElement | DocumentFragment = vElement._dom;
	const tag = vElement._tag;

	if (isString(tag)) {
		if (hooks) {
			if (hooks.willDetach) {
				triggerHook('willDetach', hooks.willDetach, domNode, lifecycle, null, null);
			}
			if (hooks.detached) {
				triggerHook('detached', hooks.detached, domNode, lifecycle, null, null);
			}
		}
		const children = vElement._children;

		if (children) {
			if (isArray(children)) {
				unmountArray(children, domNode, lifecycle, false, false);
			} else {
				unmount(children, domNode, lifecycle, false, false);
			}
		}
	}
	if (isTrue(isRoot) && isFalse(isReplace)) {
		removeChild(parentDomNode, domNode);
	}
}

function unmountVTextNode(vTextNode: VTextNode, parentDomNode: HTMLElement | SVGAElement | DocumentFragment, isRoot: boolean, isReplace: boolean) {
	if (isTrue(isRoot) && isFalse(isReplace)) {
		removeChild(parentDomNode, vTextNode._dom);
	}
}

function unmountVAsyncNode(vAsyncNode: VAsyncNode, parentDomNode: HTMLElement | SVGAElement | DocumentFragment, isRoot: boolean, isReplace: boolean) {
	vAsyncNode._cancel = true;
	if (isTrue(isRoot) && isFalse(isReplace)) {
		removeChild(parentDomNode, vAsyncNode._dom);
	}
}