import { VTextNode as VTextNodeType, HTMLNode } from '../shared';

export default class VTextNode implements VTextNodeType {
	public _text: string | number;
	public _dom: HTMLNode = null;
	public _key: string | number = null;
	public _t: boolean = true;
	 
	constructor(text: string | number) {
		this._text = text;
	}
}
