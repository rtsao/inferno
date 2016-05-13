export default class Lifecyle {
	private callbacks: Array<Function>;
	
	constructor() {
		this.callbacks = [];    
	}
	callback(callback: Function) {
		this.callbacks.push(callback);
	}
	trigger() {
		const callbacks = this.callbacks;
		const length = callbacks.length;

		if (length > 0) {
			for (let i = 0; i < length; i++) {
				callbacks[i]();
			}
		}
	}
}