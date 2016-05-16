import { mount } from './mounting';
import { patch } from './patching';
import Lifecycle from './Lifecycle';
import { isUndef, Input, isStringOrNumber, isVNode, isPromise, isInvalid } from '../shared';
import { normaliseInput } from './shared';
import VTextNode from './VTextNode';
import VAsyncNode from '../core/VAsyncNode';

// We need to know the DOM node to get a root VTemplate, VTextNode, VComponent or VElement,
// we can retrive them faster than using arrays with O(n) lookup
// The key is the DOM node.
const roots: Map<HTMLElement, Root> = new Map();

class Root {
	public input: Input;
	
	constructor(domNode: HTMLElement, input: Input) {
		this.input = input;
		roots.set(domNode, this);	
	}
}

export function render(input: Input, domNode: HTMLElement) {
	const lifecycle: Lifecycle = new Lifecycle();
	let root: Root = roots.get(domNode);

	if (!isInvalid(input) && !isVNode(input)) {
		input = normaliseInput(input);
	}	
	if (isUndef(root)) {
		mount(input, domNode, lifecycle, null, null, false);
		root = new Root(domNode, input);
	} else {
		patch(root.input, input, domNode, lifecycle, null, null, false, true);
		if (input === null) {
			roots.delete(domNode);
			root = null;
		} else {
			root.input = input;
		}
	}
	lifecycle.trigger();
}