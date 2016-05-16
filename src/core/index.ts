import VElement from './VElement';
import VComponent from './VComponent';
import VAsyncNode from './VAsyncNode';

export function element(tag: string): VElement {
	return new VElement(tag);
}

export function component(component: Function): VComponent {
	return new VComponent(component);
}

export function async(async: Promise<any>): VAsyncNode {
	return new VAsyncNode(async);
}