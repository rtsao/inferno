import { Input, isArray, isTrue, isFalse, isVAsyncNode, VAsyncNode, VTextNode, isVElement, isString, VElement, Hooks, isNull, isStringOrNumber, StatefulComponent, isVComponent, VComponent } from '../shared';
import Lifecycle from './Lifecycle';
import { isVTextNode, removeChild, triggerHook } from './shared';

function unmountArray(array: Array<Input>, domNode: HTMLElement | SVGAElement | DocumentFragment, lifecycle: Lifecycle, instance: StatefulComponent, isRoot: boolean, isReplace: boolean) {
	for (let i = 0; i < array.length; i++) {
		unmount(array[i], domNode, lifecycle, instance, isRoot, isReplace);
	}
}

export function unmount(input: Input, parentDomNode: HTMLElement | SVGAElement | DocumentFragment, lifecycle: Lifecycle, instance: StatefulComponent, isRoot: boolean, isReplace: boolean): void {
	if (isArray(input)) {
		unmountArray(input, parentDomNode, lifecycle, instance, isRoot, isReplace);
	} else if (isVTextNode(input)) {
		unmountVTextNode(input, parentDomNode, isRoot, isReplace);
	} else if (isVAsyncNode(input)) {
		unmountVAsyncNode(input, parentDomNode, isRoot, isReplace);
	} else if (isVElement(input)) {
		unmountVElement(input, parentDomNode, lifecycle, instance, isRoot, isReplace);
	} else if (isVComponent(input)) {
		unmountVComponent(input, parentDomNode, lifecycle, instance, isRoot, isReplace);
	}
}

export function unmountVComponent(vComponent: VComponent, parentDomNode: HTMLElement | SVGAElement | DocumentFragment, lifecycle: Lifecycle, lastInstance: StatefulComponent, isRoot: boolean, isReplace: boolean) {
	const hooks: Hooks = vComponent._hooks;
	const domNode = vComponent._dom;
	const isStateful = vComponent._isStateful;
	const instance: StatefulComponent | Input = vComponent._instance;

	if (isTrue(isStateful)) {
		unmount((instance as StatefulComponent)._lastInput, parentDomNode, lifecycle, lastInstance, isRoot, isReplace);
		(instance as StatefulComponent).componentWillUnmount();
	} else {
		unmount(instance as Input, parentDomNode, lifecycle, lastInstance, isRoot, isReplace);
		if (hooks && hooks.componentWillUnmount) {
			triggerHook('componentWillUnmount', hooks.componentWillUnmount, domNode, lifecycle, null, null);
		}
	}
}

function unmountVElement(vElement: VElement, parentDomNode: HTMLElement | SVGAElement | DocumentFragment, lifecycle: Lifecycle, instance: StatefulComponent, isRoot: boolean, isReplace: boolean) {
	const hooks: Hooks = vElement._hooks;
	const domNode: HTMLElement | SVGAElement | DocumentFragment = vElement._dom;
	const tag: string = vElement._tag;
	
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

		if (!isNull(children)) {
			if (isArray(children)) {
				unmountArray(children, domNode, lifecycle, instance, false, false);
			} else if (!isStringOrNumber(children)) {
				unmount(children, domNode, lifecycle, instance, false, false);
			}
		}
		const ref = vElement._ref;
		
		if (ref) {
			if (instance) {
				delete instance.refs[ref as string];
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