import VElement from './VElement';
import VComponent from './VComponent';

export default {
	element(tag: string) {
		return new VElement(tag);
	},
	component(component: Function) {
		return new VComponent(component);
	}	
};