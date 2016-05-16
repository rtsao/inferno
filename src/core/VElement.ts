import { Input, VElement as VElementType, HTMLNode } from '../shared';

export default class VElement implements VElementType {
	public _tag: string;
	public _dom: HTMLNode = null;
	public _children: Input = null;
	public _key: string | number = null;
	public _props: Object = null;
	public _attrs: Object = null;
	public _events: Object = null;
	public _hooks: Object = null;
	public _text: string | number = null;
	public _ref: string | Function = null;
	public _isKeyed: boolean = false;
	
	constructor(tag: string) {
		this._tag = tag;
	}
	children(children: Input): VElement {
		this._children = children;
		return this;
	}
}