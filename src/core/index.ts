import { isFunction } from '../shared';
import VElement from './VElement';
import VComponent from './VComponent';
import VAsyncNode from './VAsyncNode';
import VEmptyNode from './VEmptyNode';

export function element(tag: string): VElement {
	return new VElement(tag);
}

export function component(component: Function): VComponent {
	if (!isFunction(component)) {
		throw new Error(`Inferno Error: you passed in "${ component }" to Inferno.component(). Inferno.component() expects a Class or Function as the first paramater.`);
	}
	return new VComponent(component);
}

export function async(async: Promise<any>): VAsyncNode {
	return new VAsyncNode(async);
}

export function empty(): VEmptyNode {
	return new VEmptyNode();
}