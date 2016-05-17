import { VTextNode as VTextNodeType } from '../shared';

export default class VTextNode implements VTextNodeType {
	public _text: string | number;
	public _dom: Text = null;
	public _key: string | number = null;
	public _t = null;
	 
	constructor(text: string | number) {
		this._text = text;
	}
}
