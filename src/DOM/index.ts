import { createTemplate, VTemplate } from './VTemplate';
import VTextNode from './VTextNode';

export function template(templaceFunc: Function): VTemplate {
	return createTemplate(templaceFunc);
}

export function text(text: string): VTextNode {
	return new VTextNode(text);
}