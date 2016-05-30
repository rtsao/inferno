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
	StatefulComponent,
	isTrue,
	Context
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
	setProperty,
	setEvent,
	triggerHook
} from './shared';
import { patch } from './patching';
import Lifecycle from './Lifecycle';
import VTextNode from './VTextNode';

export function mount(
	input: Input, 
	parentDomNode: HTMLElement | SVGAElement | DocumentFragment, 
	lifecycle: Lifecycle, 
	instance: StatefulComponent, 
	namespace: string, 
	isKeyed: boolean,
	context: Context
): HTMLElement | SVGAElement | Text | DocumentFragment {
	if (isVEmptyNode(input)) {
		return mountVEmptyNode(input, parentDomNode as HTMLElement);
	} else if (isVTextNode(input)) {
		return mountVTextNode(input, parentDomNode);
	} else if (isVComponent(input)) {
		return mountVComponent(input, parentDomNode, lifecycle, instance, namespace, isKeyed, context);
	} else if (isVElement(input)) {
		return mountVElement(input, parentDomNode, lifecycle, instance, namespace, context);
	} else if (isVTemplate(input)) {
		return mountVTemplate(input, parentDomNode, lifecycle, instance, context);
	} else if (isVAsyncNode(input)) {
		return mountVAsyncNode(input, parentDomNode, lifecycle, instance, namespace, isKeyed, context);
	} else if (isArray(input)) {
		let domNode: HTMLElement | SVGAElement | DocumentFragment = parentDomNode;
		
		if (isNull(parentDomNode)) {
			domNode = document.createDocumentFragment();
		}
		if (isFalse(isKeyed)) {
			mountArray(normaliseArray(input, true), domNode, lifecycle, instance, namespace, false, context);
		} else {
			mountArray(input, domNode, lifecycle, instance, namespace, true, context);
		}
		return domNode;
	} else if (isStringOrNumber(input)) {
		throw new Error(`Inferno Error: invalid mount input of "${ typeof input }". Ensure the String or Number is wrapped in a VElement, VComponent, VTemplate or Array.`);
	} else {
		throw new Error('Inferno Error: failed to "mount", invalid object was detected. Valid "mount" types are Array, Promise, Function, VTextNode, VElement, VComponent, VAsyncNode and VTemplate.');
	}
}

export function mountVEmptyNode(vEmptyNode: VEmptyNode, parentDomNode: HTMLElement | SVGAElement | DocumentFragment): Text {
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

export function mountVComponent(
	vComponent: VComponent, 
	parentDomNode: HTMLElement | SVGAElement | DocumentFragment, 
	lifecycle: Lifecycle, 
	lastInstance: StatefulComponent, 
	namespace: string, 
	isKeyed: boolean, 
	context: Context
): any {
	const isStateful = vComponent._isStateful;
	const component: StatefulComponent | Function | any = vComponent._component; // we need to use "any" as InfernoComponent is externally available only
	const props = vComponent._props;
	const ref = vComponent._ref;
	let domNode;

	if (isTrue(isStateful)) {
		const instance = new component(props);
		const ref = vComponent._ref;
		
		instance._patch = patch;
		if (!isNull(lastInstance) && ref) {
			mountRef(lastInstance, ref, instance);
		}
		// TODO add context to Inferno, it's missing for now
		const childContext = instance.getChildContext();

		if (!isNull(childContext)) {
			context = Object.assign({}, context, childContext);
		}
		
		instance._unmounted = false;
		instance._pendingSetState = true;
		instance.componentWillMount();
		const input = normaliseInput(instance.render());
				
		instance._pendingSetState = false;
		domNode = mount(input, parentDomNode, lifecycle, instance, namespace, isKeyed, context);
		instance._lastInput = input;
		instance.componentDidMount();
		vComponent._dom = domNode;
		vComponent._instance = instance;
	} else {
		const hooks: Hooks = vComponent._hooks;
		const input = normaliseInput(component(props));

		if (isArray(input)) {
			throw new Error('Inferno Error: components cannot have an Array as a root input. Use String, Number, VElement, VComponent, VTemplate, Null or False instead.');
		}
		domNode = mount(input, parentDomNode, lifecycle, null, namespace, isKeyed, context);	
		vComponent._dom = domNode;
		vComponent._instance = input;

		if (hooks) {
			if (hooks.componentWillMount) {
				triggerHook('componentWillMount', hooks.componentWillMount, domNode, lifecycle, null, null);
			}
			if (hooks.componentDidMount) {
				triggerHook('componentDidMount', hooks.componentDidMount, domNode, lifecycle, null, null);
			}
		}
	}
	return domNode;
}

export function mountVElement(
	vElement: VElement, 
	parentDomNode: HTMLElement | SVGAElement | DocumentFragment, 
	lifecycle: Lifecycle, 
	instance: StatefulComponent, 
	namespace: string, 
	context: Context
): any {
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
				mountArray(children as Array<Input>, domNode, lifecycle, instance, namespace, isKeyed, context);
			} else {
				mount(children, domNode, lifecycle, instance, namespace, isKeyed, context);
			}
		}
		const events: Object = vElement._events;

		if (!isNull(events)) {
			const eventsKeys: Array<string> = Object.keys(events);

			for (let i: number = 0; i < eventsKeys.length; i++) {
				const eventName: string = eventsKeys[i];
				const eventValue: Function = events[eventName];

				setEvent(eventName, eventValue, domNode);
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

function mountVTemplate(
	vComponent: VTemplate, 
	parentDomNode: HTMLElement | SVGAElement | DocumentFragment, 
	lifecycle: Lifecycle, 
	instance: Object, 
	context: Context
): any {
	// TODO
}

function mountVAsyncNode(
	vAsyncNode: VAsyncNode, 
	parentDomNode: HTMLElement | SVGAElement | DocumentFragment, 
	lifecycle: Lifecycle, 
	instance: StatefulComponent, 
	namespace: string, 
	isKeyed: boolean, 
	context: Context
): Text {
	const _async = vAsyncNode._async;
	const placeholder = createPlaceholder();
	 
	vAsyncNode._dom = placeholder;
	if (isPromise(_async)) {
		_async.then(input => {
			if (isFalse(vAsyncNode._cancel)) {
				input = normaliseInput(input);
				const domNode: HTMLElement | SVGAElement | DocumentFragment | Text = mount(input, null, lifecycle, instance, namespace, isKeyed, context);
					
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

export function mountArray(
	array: Array<Input>, 
	domNode: HTMLElement | SVGAElement | DocumentFragment, 
	lifecycle: Lifecycle, 
	instance: StatefulComponent, 
	namespace: string, 
	isKeyed: boolean, 
	context: Context
) {
	for (let i: number = 0; i < array.length; i++) {
		let arrayItem: Input = array[i];

		mount(arrayItem, domNode, lifecycle, instance, namespace, isKeyed, context);
	}
}

function mountRef(instance: StatefulComponent, value: string | Function, refValue: HTMLElement | SVGAElement | DocumentFragment) {
	if (!isInvalid(instance) && isString(value)) {
		instance.refs[value] = refValue;
	}
}