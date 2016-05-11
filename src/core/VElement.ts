interface Input {
	| string;
	number;
	VElement:?;
}

export default class VElement {
	public tag : string;
	public children : Array<Input>;
	
	constructor(tag : string) {
		this.tag = tag;
		this.children.push('foo')
	}
}