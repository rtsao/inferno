import { Input, VElement as VElementType } from '../shared';

export default class VElement implements VElementType {
	public _tag: string;
	public _dom: HTMLElement | Text = null;
	public _children: Input = null;
	
	constructor(tag: string) {
		this._tag = tag;
	}
	children(children: Input): VElement {
		this._children = children;
		return this;
	}
}