import { Blueprint } from '../shared';

export function createTemplate(templateFunc: Function): VTemplate {
	// TODO
	return new VTemplate(null, null, null, null);
}

export class VTemplate {
	public _dom = null;
	public _key: string | number;
	public bp: Blueprint;
	public v0: any;
	public v1: Array<any>;
	
	constructor(bp, key, v0, v1) {
		this._key = key;
		this.bp = bp;
		this.v0 = v0;
		this.v1 = v1;
	}
}
