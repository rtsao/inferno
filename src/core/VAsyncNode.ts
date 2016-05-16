import { HTMLNode, VAsyncNode as VAsyncNodeType, Input } from '../shared';

export default class VAsyncNode implements VAsyncNodeType {
	public _dom: HTMLNode = null;
	public _async: Promise<any>;
	public _key: string | number = null;
	public _cancel: boolean = false;
	public _lastInput: Input = null;
	
	constructor(async: Promise<any>) {
		this._async = async;
	}
}