import { Root, isTrue } from '../shared'; 
import { roots } from './rendering';

export default class Lifecyle {
	private callbacks: Array<Function>;
	public domNode: HTMLElement | SVGAElement | DocumentFragment;
	
	constructor(domNode: HTMLElement | SVGAElement | DocumentFragment) {
		this.domNode = domNode;
		this.callbacks = [];
	}
	callback(callback: Function) {
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
	deleteRoot() {
		roots.delete(this.domNode);
	}
}