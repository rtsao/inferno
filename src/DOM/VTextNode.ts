import { VTextNode as VTextNodeType } from '../shared';

export class VTextNode implements VTextNodeType {
	public _text: string;
	public _dom: Text = null;
	public _key: string | number = null;
	public _t = null;
	
	constructor(text: string) {
		this._text = text;
		this._dom = null;
		this._key = null; // we shouldn't have VTextNodes in keyed lists, but this should help if we ever do
		this._t = null; // an id that all VTextNode's have so we don't have to use instanceof
	}
}
