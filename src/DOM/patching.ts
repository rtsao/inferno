import { HTMLNode, isUndef, Input, isInvalid, isNull, isArray, isStringOrNumber, VTextNode, VComponent, VElement, isVElement, isVComponent, VTemplate, isFalse, isTrue, isVAsyncNode, isPromise, isVNode } from '../shared';
import { replaceInputWithPlaceholder, replacePlaceholderWithInput, normaliseArray, normaliseInput, getDomNodeFromInput, isVTextNode, setText, replaceVTextNodeWithInput, replaceArrayWithInput, replaceInputWithArray, replaceVAsyncNodeWithInput, replaceChild } from './shared';
import Lifecycle from './Lifecycle';
import VAsyncNode from '../core/VAsyncNode';
import { unmount } from './unmounting';
import { mount } from './mounting';

const badInput = 'Inferno Error: bad input(s) passed to "patch". Please ensure only valid objects are used in your render.';

export function patch(lastInput: Input, nextInput: Input, parentDomNode: HTMLElement, lifecycle: Lifecycle, instance: Object, namespace: string, isKeyed: boolean, isRoot: boolean): void {
	if (isInvalid(nextInput)) {
		if (!isInvalid(lastInput)) {
			if (isTrue(isRoot)) {
				unmount(lastInput, parentDomNode, lifecycle, isRoot, false);
			} else {
				replaceInputWithPlaceholder(lastInput, parentDomNode, lifecycle);	
			}
		}
	} else if (isInvalid(lastInput)) {
		if (!isInvalid(nextInput)) {
			if (isTrue(isRoot)) {
				mount(nextInput, parentDomNode, lifecycle, instance, namespace, false);
			} else {
				replacePlaceholderWithInput(nextInput, parentDomNode, lifecycle, instance, namespace, isKeyed);	
			}
		}
	} else if (isArray(lastInput)) {
		if (isArray(nextInput)) {
			if (isKeyed) {
				patchKeyedArray(lastInput, nextInput, parentDomNode, lifecycle, instance, namespace);
			} else {
				patchNonKeyedArray(lastInput, nextInput, parentDomNode, lifecycle, instance, namespace, isRoot);
			}
		} else {
			replaceArrayWithInput(parentDomNode, mount(nextInput, null, lifecycle, instance, namespace, isKeyed), lastInput, lifecycle);
		}	
	} else if (isArray(nextInput)) {
		replaceInputWithArray(lastInput, nextInput, parentDomNode, lifecycle, instance, namespace, isKeyed);
	} else if (isVAsyncNode(nextInput)) {
		if (isVAsyncNode(lastInput)) {
			patchVAsyncNode(lastInput, nextInput, parentDomNode, lifecycle, instance, namespace, isKeyed, isRoot);
		} else {
			patchInputWithPromiseInput(lastInput, nextInput, parentDomNode, lifecycle, instance, namespace, isKeyed, isRoot);
		}	
	} else if (isVAsyncNode(lastInput)) {
		const asyncLastInput = lastInput._lastInput;
		
		if (isNull(asyncLastInput)) {
			replaceVAsyncNodeWithInput(lastInput, nextInput, parentDomNode, lifecycle, instance, namespace, isKeyed);
		} else {
			patch(asyncLastInput, nextInput, parentDomNode, lifecycle, instance, namespace, isKeyed, isRoot);
		}
	} else if (isVTextNode(lastInput)) {
		if (isVTextNode(nextInput)) {
			patchVTextNode(lastInput, nextInput);
		} else {
			replaceVTextNodeWithInput(lastInput, nextInput, parentDomNode, lifecycle, instance, namespace, isKeyed)
		}
	} else {
		throw new Error(badInput);
	}
}

function patchVAsyncNode(lastVAsyncNode: VAsyncNode, nextVAsyncNode: VAsyncNode, parentDomNode: HTMLElement, lifecycle: Lifecycle, instance: Object, namespace: string, isKeyed: boolean, isRoot: boolean) {
	const lastInput: Input = lastVAsyncNode._lastInput;
	const nextAsync: Promise<any> = nextVAsyncNode._async;
	
	if (isNull(lastInput)) {
		if (isPromise(nextAsync)) {
			lastVAsyncNode._cancel = true;
			nextAsync.then(nextInput => {
				if (isFalse(nextVAsyncNode._cancel)) {
					if (!isInvalid(nextInput) && !isVNode(nextInput)) {
						nextInput = normaliseInput(nextInput);
					}
					const domNode: HTMLNode = mount(nextInput, null, lifecycle, instance, namespace, isKeyed);
					
					replaceChild(parentDomNode, domNode, lastVAsyncNode._dom);
					nextVAsyncNode._dom = domNode;
					nextVAsyncNode._lastInput = nextInput;
				}
			});
		}
	} else {
		if (isPromise(nextAsync)) {
			patchInputWithPromiseInput(lastInput, nextVAsyncNode, parentDomNode, lifecycle, instance, namespace, isKeyed, isRoot);
		}
	}
}

export function patchInputWithPromiseInput(lastInput: Input, vAsyncNode: VAsyncNode, parentDomNode: HTMLElement, lifecycle: Lifecycle, instance: Object, namespace: string, isKeyed: boolean, isRoot: boolean) {
	const promise: Promise<any> = vAsyncNode._async;
	
	promise.then(nextInput => {
		if (isFalse(vAsyncNode._cancel)) {
			if (!isInvalid(nextInput) && !isVNode(nextInput)) {
				nextInput = normaliseInput(nextInput);
			}
			patch(lastInput, nextInput, parentDomNode, lifecycle, instance, namespace, isKeyed, isRoot);
			
			vAsyncNode._dom = getDomNodeFromInput(nextInput, parentDomNode);
			vAsyncNode._lastInput = nextInput;
		}
	})
}

function patchNonKeyedArray(lastArray: Array<Input>, nextArray: Array<Input>, parentDomNode: HTMLElement, lifecycle: Lifecycle, instance: Object, namespace: string, isRoot: boolean) {
	// optimisaiton technique, can we delay doing this upon finding an invalid child and then falling back?
	// it is expensive to do if we somehow know both arrays are the same length, even once flattened
	lastArray = normaliseArray(lastArray, false);
	nextArray = normaliseArray(nextArray, true);
	let lastArrayLength: number = lastArray.length;
	let nextArrayLength: number = nextArray.length;
	let commonLength: number = lastArrayLength > nextArrayLength ? nextArrayLength : lastArrayLength;
	let i: number = 0;
	
	for (; i < commonLength; i++) {
		patch(lastArray[i], nextArray[i], parentDomNode, lifecycle, instance, namespace, false, isRoot);
	}
	if (lastArrayLength < nextArrayLength) {
		for (i = commonLength; i < nextArrayLength; i++) {
			mount(nextArray[i], parentDomNode, lifecycle, instance, namespace, false);
		}
	} else if (lastArrayLength > nextArrayLength) {
		for (i = commonLength; i < lastArrayLength; i++) {
			unmount(lastArray[i], parentDomNode, lifecycle, true, false);
		}
	}	
}

function patchVTextNode(lastVTextNode: VTextNode, nextVTextNode: VTextNode) {
	const nextText = nextVTextNode._text;
	const domTextNode = lastVTextNode._dom;

	nextVTextNode._dom = domTextNode;
	if (lastVTextNode._text !== nextText) {
		setText(domTextNode as Text, nextVTextNode._text);
	}
}

// TODO this function should throw if it can't find the key on an item
function patchKeyedArray(lastArray: Array<Input>, nextArray: Array<Input>, parentDomNode: HTMLElement, lifecycle: Lifecycle, instance: Object, namespace: string) {
	
}