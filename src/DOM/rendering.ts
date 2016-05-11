import { mount } from './mounting';
import { patch } from './patching';
import { isUndef } from '../utils';

// We need to know the DOM node to get a root VTemplate, VTextNode, VComponent or VElement,
// we can retrive them faster than using arrays with O(n) lookup
// The key is the DOM node.
const roots : Map<HTMLElement, Root> = new Map();

class Root {
	public input : any;
	
	constructor(domNode : HTMLElement, input : any) {
		this.input = input;
		roots.set(domNode, this);	
	}
}

class Lifecyle {
	private callbacks : Array<Function>;
	
	constructor() {
		this.callbacks = [];    
	}
	callback(callback : function) {
		this.callbacks.push(callback);
	}
	trigger() {
		const callbacks = this.callbacks;
		const length = callbacks.length;

		if (length > 0) {
			for (let i = 0; i < length; i++) {
				callbacks[i]();
			}
		}
	}
}

export function render(input : any, domNode : HTMLElement) {
	const lifecycle = new Lifecyle();
	let root = roots.get(domNode);

	if (isUndef(root)) {
		mount(input, domNode, lifecycle, null, null, false);
		root = new Root(domNode, input);
	} else {
		patch(root.input, input, domNode, lifecycle, null, null, false);
		if (input === null) {
			roots.delete(domNode);
			root = null;
		} else {
			root.input = input;
		}
	}
	lifecycle.trigger();
}