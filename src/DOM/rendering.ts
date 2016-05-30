import { mount } from './mounting';
import { patch } from './patching';
import Lifecycle from './Lifecycle';
import { isUndef, Input, isStringOrNumber, isVNode, isPromise, isVEmptyNode, isTrue, Root as RootType } from '../shared';
import { normaliseInput } from './shared';
import VTextNode from './VTextNode';
import VAsyncNode from '../core/VAsyncNode';

// We need to know the DOM node to get a root VTemplate, VTextNode, VComponent or VElement,
// we can retrive them faster than using arrays with O(n) lookup
// The key is the DOM node.
export const roots: Map<HTMLElement, Root> = new Map();

class Root implements RootType {
	public input: Input;
	
	constructor(domNode: HTMLElement, input: Input) {
		this.input = input;
		roots.set(domNode, this);	
	}
}

export function render(input: Input, domNode: HTMLElement) {
	let root: Root = roots.get(domNode);
	const lifecycle: Lifecycle = new Lifecycle(domNode);

	input = normaliseInput(input);
	if (isUndef(root)) {
		mount(input, domNode, lifecycle, null, null, false, {});
		root = new Root(domNode, input);
	} else {
		patch(root.input, input, domNode, lifecycle, null, null, false, true, {});
		root.input = input;
	}
	lifecycle.trigger();
}