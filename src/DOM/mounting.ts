import { 
	isUndef, 
	Input, 
	isInvalid, 
	isNull, 
	isArray, 
	isString, 
	isStringOrNumber, 
	VComponent, 
	VElement, 
	isVElement, 
	isVComponent, 
	VAsyncNode, 
	isVAsyncNode, 
	VTemplate, 
	isFalse, 
	isPromise,  
	isVEmptyNode, 
	VEmptyNode,
	Hooks,
	StatefulComponent
} from '../shared';
import { 
	isVTextNode, 
	isVTemplate, 
	createPlaceholder, 
	createTextNode, 
	appendChild, 
	normaliseArray, 
	replaceChild, 
	normaliseInput, 
	createElement,
	setTextContent,
	setAttribute,
	setProperty
} from './shared';
import Lifecycle from './Lifecycle';
import VTextNode from './VTextNode';

export function mount(input: Input, parentDomNode: HTMLElement | SVGAElement | DocumentFragment, lifecycle: Lifecycle, instance: StatefulComponent, namespace: string, isKeyed: boolean): HTMLElement | SVGAElement | Text | DocumentFragment {
	if (isVEmptyNode(input)) {
		return mountVEmptyNode(input, parentDomNode as HTMLElement);
	} else if (isVTextNode(input)) {
		return mountVTextNode(input, parentDomNode);
	} else if (isVComponent(input)) {
		return mountVComponent(input, parentDomNode, lifecycle, instance, namespace);
	} else if (isVElement(input)) {
		return mountVElement(input, parentDomNode, lifecycle, instance, namespace);
	} else if (isVTemplate(input)) {
		return mountVTemplate(input, parentDomNode, lifecycle, instance);
	} else if (isVAsyncNode(input)) {
		return mountVAsyncNode(input, parentDomNode, lifecycle, instance, namespace, isKeyed);
	} else if (isArray(input)) {
		let domNode: HTMLElement | SVGAElement | DocumentFragment = parentDomNode;
		
		if (isNull(parentDomNode)) {
			domNode = document.createDocumentFragment();
		}
		if (isFalse(isKeyed)) {
			mountArray(normaliseArray(input, true), domNode, lifecycle, instance, namespace, false);
		} else {
			mountArray(input, domNode, lifecycle, instance, namespace, true);
		}
		return domNode;
	} else if (isStringOrNumber(input)) {
		throw new Error(`Inferno Error: invalid mount input of "${ typeof input }". Ensure the String or Number is wrapped in a VElement, VComponent, VTemplate or Array.`);
	} else {
		throw new Error('Inferno Error: failed to "mount", invalid object was detected. Valid "mount" types are Array, Promise, Function, VTextNode, VElement, VComponent, VAsyncNode and VTemplate.');
	}
}

export function mountVEmptyNode(vEmptyNode: VEmptyNode, parentDomNode: HTMLElement): Text {
	const placeholder: Text = createPlaceholder();
	
	vEmptyNode._dom = placeholder;
	if (!isNull(parentDomNode)) {
		appendChild(parentDomNode, placeholder);
	}
	return placeholder;
}

function mountVTextNode(vTextNode: VTextNode, parentDomNode: HTMLElement | SVGAElement | DocumentFragment): Text {
	const domTextNode = createTextNode(vTextNode._text);

	vTextNode._dom = domTextNode;
	if (!isNull(parentDomNode)) {
		appendChild(parentDomNode, domTextNode);
	}
	return domTextNode;
}

function mountVComponent(vComponent: VComponent, parentDomNode: HTMLElement | SVGAElement | DocumentFragment, lifecycle: Lifecycle, instance: StatefulComponent, namespace: string): any {
	// TODO
}

function mountVElement(vElement: VElement, parentDomNode: HTMLElement | SVGAElement | DocumentFragment, lifecycle: Lifecycle, instance: StatefulComponent, namespace: string): any {
	const tag = vElement._tag;
	let domNode;

	if (isString(tag)) {
		const domNode: HTMLElement | SVGAElement = createElement(tag, namespace);
		const text: string | number = vElement._text;
		const hooks: Hooks = vElement._hooks;
		
		vElement._dom = domNode;
		if (hooks) {
			if (hooks.created) {
				hooks.created(domNode);
			}
			if (hooks.attached) {
				lifecycle.callback(() => {
					hooks.attached(domNode);
				});
			}
		}
		if (text) {
			setTextContent(text as string, domNode, false);
		}
		let children: Array<any> | Input = vElement._children;
		const isKeyed = vElement._isKeyed;
		
		if (!isNull(children)) {
			if (isArray(children)) {
				if (!isKeyed) {
					children = vElement._children = normaliseArray(children as Array<Input>, false);
				}
				mountArray(children as Array<Input>, domNode, lifecycle, instance, namespace, isKeyed);
			} else {
				mount(children, domNode, lifecycle, instance, namespace, isKeyed);
			}
		}
		const events: Object = vElement._events;

		if (!isNull(events)) {
			const eventsKeys: Array<string> = Object.keys(events);

			for (let i: number = 0; i < eventsKeys.length; i++) {
				const eventName: string = eventsKeys[i];
				const eventValue: Function = events[eventName];

				mountEvent(eventName, eventValue, domNode);
			}
		}
		const attrs: Object = vElement._attrs;

		if (!isNull(attrs)) {
			const attrsKeys: Array<string> = Object.keys(attrs);

			for (let i: number = 0; i < attrsKeys.length; i++) {
				const attrName: string = attrsKeys[i];
				const attrValue: string | number = attrs[attrName];

				setAttribute(attrName, attrValue, domNode, namespace);
			}
		}		
		const props: Object = vElement._props;

		if (!isNull(props)) {
			const propsKeys: Array<string> = Object.keys(props);

			for (let i = 0; i < propsKeys.length; i++) {
				const propName: string = propsKeys[i];
				const propValue: string | number | boolean | Object = props[propName];

				setProperty(propName, propValue, domNode);
			}
		}
		const ref: string | Function = vElement._ref;

		if (!isNull(ref)) {
			mountRef(instance, ref, domNode);
		}
		if (!isNull(parentDomNode)) {
			appendChild(parentDomNode, domNode);
		}
		return domNode;
	} else {
		throw new Error('Inferno Error: expected a String for VElement tag type');
	}
}

function mountVTemplate(vComponent: VTemplate, parentDomNode: HTMLElement | SVGAElement | DocumentFragment, lifecycle: Lifecycle, instance: Object): any {
	// TODO
}

function mountVAsyncNode(vAsyncNode: VAsyncNode, parentDomNode: HTMLElement | SVGAElement | DocumentFragment, lifecycle: Lifecycle, instance: StatefulComponent, namespace: string, isKeyed: boolean): Text {
	const _async = vAsyncNode._async;
	const placeholder = createPlaceholder();
	 
	vAsyncNode._dom = placeholder;
	if (isPromise(_async)) {
		_async.then(input => {
			if (isFalse(vAsyncNode._cancel)) {
				input = normaliseInput(input);
				const domNode: HTMLElement | SVGAElement | DocumentFragment | Text = mount(input, null, lifecycle, instance, namespace, isKeyed);
					
				replaceChild(parentDomNode || (placeholder.parentNode as HTMLElement), domNode, placeholder);
				vAsyncNode._dom = domNode;
				vAsyncNode._lastInput = input;
			}
		});
	}
	if (!isNull(parentDomNode)) {
		appendChild(parentDomNode, placeholder);
	}
	return placeholder;
}

function mountArray(array: Array<Input>, domNode: HTMLElement | SVGAElement | DocumentFragment, lifecycle, instance, namespace, isKeyed) {
	for (let i: number = 0; i < array.length; i++) {
		let arrayItem: Input = array[i];

		mount(arrayItem, domNode, lifecycle, instance, namespace, isKeyed);
	}
}

function mountEvent(event: string, value: Function, domNode: HTMLElement | SVGAElement | DocumentFragment) {
	domNode[event] = value;
}

function mountRef(instance: StatefulComponent, value: string | Function, refValue: HTMLElement | SVGAElement | DocumentFragment) {
	if (!isInvalid(instance) && isString(value)) {
		instance.refs[value] = refValue;
	}
}