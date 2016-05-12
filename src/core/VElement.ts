import { Input, VElement as VElementType } from '../shared';

export default class VElement implements VElementType {
	public _tag: string;
	public _dom: HTMLElement | Text;
	public _children: Input = [];
	
	constructor(tag: string) {
		this._tag = tag;
		this._dom = null;
	}
	children(children: Input): VElement {
		this._children = children;
		return this;
	}
}