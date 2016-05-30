declare var process;

import {  
	isUndef, 
	Input, 
	isInvalid, 
	isNull, 
	isArray, 
	isStringOrNumber, 
	VTextNode, 
	VComponent, 
	VElement, 
	isVElement, 
	isVComponent, 
	VTemplate, 
	isFalse, 
	isTrue, 
	isVAsyncNode, 
	isPromise, 
	isVNode, 
	isVEmptyNode, 
	VEmptyNode,
	VAsyncNode,
	isString,
	StatefulComponent,
	isVTemplate,
	Context
} from '../shared';
import { 
	replaceInputWithEmptyNode,
	replaceEmptyNodeWithInput,
	normaliseArray, 
	normaliseInput, 
	getDomNodeFromInput, 
	isVTextNode, 
	setText, 
	replaceVTextNodeWithInput, 
	replaceArrayWithInput, 
	replaceInputWithArray, 
	replaceVAsyncNodeWithInput,
	replaceInputWithVComponent,
	replaceInputWithVElement,
	replaceChild,
	setTextContent,
	setProperty,
	setAttribute,
	triggerHook,
	setEvent
} from './shared';
import Lifecycle from './Lifecycle';
import { unmount, unmountVComponent } from './unmounting';
import { mount, mountVEmptyNode, mountVComponent } from './mounting';

const badInput = 'Inferno Error: bad input(s) passed to "patch". Please ensure only valid objects are used in your render.';
const invalidInput = 'Inferno Error: components cannot have an Array as a root input. Use String, Number, VElement, VComponent, VTemplate, Null or False instead.';

export function patch(
	lastInput: Input, 
	nextInput: Input, 
	parentDomNode: HTMLElement | SVGAElement | DocumentFragment, 
	lifecycle: Lifecycle, 
	instance: StatefulComponent, 
	namespace: string, 
	isKeyed: boolean, 
	isRoot: boolean,
	context: Context
): void {
	if (isVEmptyNode(nextInput)) {
		if (isVEmptyNode(lastInput)) {
			patchVEmptyNode(lastInput, nextInput);	
		} else {
			if (isTrue(isRoot)) {
				unmount(lastInput, parentDomNode, lifecycle, instance, isRoot, false);
				lifecycle.deleteRoot();
			} else {
				replaceInputWithEmptyNode(lastInput, nextInput, parentDomNode, lifecycle, instance);	
			}
		}
	} else if (isVEmptyNode(lastInput)) {
		if (isTrue(isRoot)) {
			mount(nextInput, parentDomNode, lifecycle, instance, namespace, false, context);
		} else {
			replaceEmptyNodeWithInput(lastInput, nextInput, parentDomNode, lifecycle, instance, namespace, isKeyed, context);	
		}
	} else if (isArray(lastInput)) {
		if (isArray(nextInput)) {
			if (isKeyed) {
				patchKeyedArray(lastInput, nextInput, parentDomNode, lifecycle, instance, namespace, context);
			} else {
				patchNonKeyedArray(lastInput, nextInput, parentDomNode, lifecycle, instance, namespace, isRoot, context);
			}
		} else {
			replaceArrayWithInput(parentDomNode, mount(nextInput, null, lifecycle, instance, namespace, isKeyed, context), lastInput, lifecycle, instance);
		}	
	} else if (isArray(nextInput)) {
		replaceInputWithArray(lastInput, nextInput, parentDomNode, lifecycle, instance, namespace, isKeyed, context);
	} else if (isVAsyncNode(nextInput)) {
		if (isVAsyncNode(lastInput)) {
			patchVAsyncNode(lastInput, nextInput, parentDomNode, lifecycle, instance, namespace, isKeyed, isRoot, context);
		} else {
			patchInputWithPromiseInput(lastInput, nextInput, parentDomNode, lifecycle, instance, namespace, isKeyed, isRoot, context);
		}
	} else if (isVTemplate(nextInput)) {
		debugger;
	} else if (isVElement(nextInput)) {
		if (isVElement(lastInput)) {
			patchVElement(lastInput, nextInput, parentDomNode, lifecycle, instance, namespace, isKeyed, isRoot, context);
		} else {
			replaceInputWithVElement(lastInput, nextInput, parentDomNode, lifecycle, instance, namespace, isKeyed, isRoot, context);	
		}
	} else if (isVComponent(nextInput)) {
		if (isVComponent(lastInput)) {
			patchVComponent(lastInput, nextInput, parentDomNode, lifecycle, instance, namespace, isKeyed, isRoot, context);
		} else {
			replaceInputWithVComponent(lastInput, nextInput, parentDomNode, lifecycle, instance, namespace, isKeyed, isRoot, context);	
		}
	} else if (isVAsyncNode(lastInput)) {
		const asyncLastInput = lastInput._lastInput;
		
		if (isNull(asyncLastInput)) {
			replaceVAsyncNodeWithInput(lastInput, nextInput, parentDomNode, lifecycle, instance, namespace, isKeyed, context);
		} else {
			patch(asyncLastInput, nextInput, parentDomNode, lifecycle, instance, namespace, isKeyed, isRoot, context);
		}
	} else if (isVTextNode(lastInput)) {
		if (isVTextNode(nextInput)) {
			patchVTextNode(lastInput, nextInput);
		} else {
			replaceVTextNodeWithInput(lastInput, nextInput, parentDomNode, lifecycle, instance, namespace, isKeyed, context);
		}
	} else {
		throw new Error(badInput);
	}
}

function patchVComponent(
	lastVComponent: VComponent, 
	nextVComponent: VComponent, 
	parentDomNode: HTMLElement | SVGAElement | DocumentFragment, 
	lifecycle: Lifecycle, 
	lastInstance: StatefulComponent, 
	namespace: string, 
	isKeyed: boolean, 
	isRoot: boolean,
	context: Context
) {
	const lastComponent = lastVComponent._component;
	const nextComponent = nextVComponent._component;
	const lastIsStateful = lastVComponent._isStateful;
	const nextIsStateful = nextVComponent._isStateful;
	const lastProps = lastVComponent._props;
	const nextProps = nextVComponent._props;

	if (lastComponent === nextComponent) {
		if (isTrue(lastIsStateful)) {
			if (isTrue(nextIsStateful)) {
				const instance = lastVComponent._instance as StatefulComponent;
				const lastInput = instance._lastInput;
				const update = instance.componentShouldUpdate();
				
				if (update) {
					const lastState = instance.state;
					const nextState = Object.assign({}, instance.state);
					const childContext = instance.getChildContext();

					if (!isNull(childContext)) {
						context = Object.assign({}, context, childContext);
					}
					instance._blockSetState = true;
					instance.componentWillUpdate(nextProps, nextState);
					instance._blockSetState = false;
					instance.props = nextProps;
					instance.state = nextState;
					const nextInput = normaliseInput(instance.render());

					if (isArray(nextInput)) {
						throw new Error(invalidInput);
					}
					patch(lastInput, nextInput, parentDomNode, lifecycle, lastInstance, namespace, isKeyed, isRoot, context);
					instance.componentDidUpdate(lastProps, lastState);
					instance._lastInput = nextInput;
					nextVComponent._instance = instance;
					nextVComponent._dom = (nextInput as VElement | VTemplate | VComponent)._dom;
				}
			} else{
				debugger;
			}
		} else {
			if (isTrue(nextIsStateful)) {
				debugger;
			} else {
				const hooks = nextVComponent._hooks;
				const hasHooks = !isNull(hooks);
				const lastInput = lastVComponent._instance as Input;
				const nextInput = normaliseInput(nextComponent(nextProps));
				let update = true;
				
				if (isArray(nextInput)) {
					if (process.env.NODE_ENV === 'production') {
						throw new Error(invalidInput);
					}
				}
				if (hasHooks && hooks.componentShouldUpdate) {
					update = hooks.componentShouldUpdate(lastVComponent._dom, lastProps, nextProps);
				}
				if (isTrue(update)) {
					if (hasHooks && hooks.componentWillUpdate) {
						triggerHook('componentWillUpdate', hooks.componentWillUpdate, lastVComponent._dom, lifecycle, null, null);
					}
					patch(lastInput, nextInput, parentDomNode, lifecycle, null, namespace, false, false, context);
					nextVComponent._dom = (nextInput as VElement | VTemplate | VComponent)._dom;
					nextVComponent._instance = nextInput;
					if (hasHooks && hooks.componentDidUpdate) {
						triggerHook('componentDidUpdate', hooks.componentDidUpdate, nextVComponent._dom, lifecycle, null, null);
					}
				} else {
					nextVComponent._dom = (lastInput as VElement | VTemplate | VComponent)._dom;
					nextVComponent._instance = lastInput;
				}
			}
		}
	} else {
		const domNode = mountVComponent(nextVComponent, parentDomNode, lifecycle, lastInstance, namespace, isKeyed, context);

		replaceChild(parentDomNode, domNode, lastVComponent._dom);
		unmountVComponent(lastVComponent, parentDomNode, lifecycle, lastInstance, true, true);
	}
}

function patchObjects(lastObject: Object, nextObject: Object, setFunc: Function, patchFunc: Function, domNode: HTMLElement | SVGAElement | DocumentFragment, namespace: string) {
	if (isNull(nextObject)) {
		const keys: Array<string> = Object.keys(lastObject);
		
		for (let i = 0; i < keys.length; i++) {
			const name: string = keys[i];
			
			setFunc(name, null, domNode);
		}		
	} else {
		if (isNull(lastObject)) {
			const keys: Array<string> = Object.keys(nextObject);
		
			for (let i = 0; i < keys.length; i++) {
				const name: string = keys[i];
				
				setFunc(name, nextObject[name], domNode);
			}	
		} else {
			const lastKeys: Array<string> = Object.keys(lastObject);
			const nextKeys: Array<string> = Object.keys(nextObject);
			
			for (let i = 0; i < lastKeys.length; i++) {
				const name: string = lastKeys[i];
				
				if (!isUndef(nextObject[name])) {
					patchFunc(name, lastObject[name], nextObject[name], domNode, namespace);
				} else {
					setFunc(name, null, domNode, namespace);
				}
			}
			for (let i = 0; i < nextKeys.length; i++) {
				const name: string = nextKeys[i];
				
				if (isUndef(lastObject[name])) {
					setFunc(name, nextObject[name], domNode, namespace);
				}
			}
		}
	}
}

function patchVElement(
	lastVElement: VElement, 
	nextVElement: VElement, 
	parentDomNode: HTMLElement | SVGAElement | DocumentFragment, 
	lifecycle: Lifecycle, 
	instance: StatefulComponent, 
	namespace: string, 
	isKeyed: boolean, 
	isRoot: boolean,
	context: Context
) {
	const lastTag: string = lastVElement._tag;
	const nextTag: string = nextVElement._tag;
	const nextHooks = nextVElement._hooks;
	const domNode: HTMLElement | SVGAElement | DocumentFragment = lastVElement._dom;
	const _isKeyed = (lastVElement._isKeyed && nextVElement._isKeyed) || isKeyed;

	nextVElement._dom = domNode;
	if (lastTag !== nextTag) {
		unmount(lastVElement, null, lifecycle, instance, isRoot, true);
		replaceChild(parentDomNode, mount(nextVElement, null, lifecycle, instance, namespace, _isKeyed, context), domNode);
	} else {
		const lastText: string | number = lastVElement._text;
		const nextText: string | number = nextVElement._text;
		
		if (!isNull(nextHooks) && nextHooks.willUpdate) {
			triggerHook('willUpdate', nextHooks.willUpdate, domNode, lifecycle, null, null);
		}
		if (lastText !== nextText) {
			if (isNull(nextText)) {
				setTextContent(null, domNode as HTMLElement, false);
			} else {
				setTextContent(nextText as string, domNode as HTMLElement, !isNull(lastText));
			}
		} else {
			let lastChildren: Array<Input> | Input = lastVElement._children;
			let nextChildren: Array<Input> | Input = nextVElement._children;

			if (lastChildren !== nextChildren) {
				if (isNull(lastChildren)) {
					mount(nextChildren, domNode, lifecycle, instance, namespace, _isKeyed, context);
				} else {
					nextChildren = nextVElement._children = normaliseInput(nextChildren);
					patch(lastChildren, nextChildren, domNode, lifecycle, instance, namespace, _isKeyed, false, context);
				}
			}
		}
		const lastProps: Object = lastVElement._props;
		const nextProps: Object = nextVElement._props;
		
		if (lastProps !== nextProps) {
			patchObjects(lastProps, nextProps, setProperty, patchProperty, domNode, namespace);
		}
		const lastAttrs: Object = lastVElement._attrs;
		const nextAttrs: Object = nextVElement._attrs;
		
		if (lastAttrs !== nextAttrs) {
			patchObjects(lastAttrs, nextAttrs, setAttribute, patchAttribute, domNode, namespace);
		}
		const lastEvents: Object = lastVElement._events;
		const nextEvents: Object = nextVElement._events;
		
		if (lastEvents !== nextEvents) {
			patchObjects(lastEvents, nextEvents, setEvent, patchEvent, domNode, namespace);
		}		
		const lastRef: string | Function = lastVElement._ref;
		const nextRef: string | Function = nextVElement._ref;
		
		if (lastRef !== nextRef) {
			patchRef(instance, lastRef, nextRef, domNode);
		}
		if (!isNull(nextHooks) && nextHooks.didUpdate) {
			triggerHook('didUpdate', nextHooks.didUpdate, domNode, lifecycle, null, null);
		}
	}
}

function patchRef(instance: StatefulComponent, lastRef, nextRef, domNode) {
	if (instance) {
		if (isString(lastRef)) {
			delete instance.refs[lastRef];
		}
		if (isString(nextRef)) {
			instance.refs[nextRef] = domNode;
		}
	}
}

function patchVEmptyNode(lastVEmptyNode: VEmptyNode, nextVEmptyNode: VEmptyNode) {
	nextVEmptyNode._dom = lastVEmptyNode._dom;
}

function patchVAsyncNode(
	lastVAsyncNode: VAsyncNode, 
	nextVAsyncNode: VAsyncNode, 
	parentDomNode: HTMLElement | SVGAElement | DocumentFragment, 
	lifecycle: Lifecycle, 
	instance: StatefulComponent, 
	namespace: string, 
	isKeyed: boolean, 
	isRoot: boolean,
	context: Context
) {
	const lastInput: Input = lastVAsyncNode._lastInput;
	const nextAsync: Promise<any> = nextVAsyncNode._async;
	
	if (isNull(lastInput)) {
		if (isPromise(nextAsync)) {
			lastVAsyncNode._cancel = true;
			nextAsync.then(nextInput => {
				if (isFalse(nextVAsyncNode._cancel)) {
					nextInput = normaliseInput(nextInput);
					const domNode: HTMLElement | SVGAElement | DocumentFragment | Text = mount(nextInput, null, lifecycle, instance, namespace, isKeyed, context);
					
					replaceChild(parentDomNode, domNode, lastVAsyncNode._dom);
					nextVAsyncNode._dom = domNode;
					nextVAsyncNode._lastInput = nextInput;
				}
			});
		}
	} else {
		if (isPromise(nextAsync)) {
			patchInputWithPromiseInput(lastInput, nextVAsyncNode, parentDomNode, lifecycle, instance, namespace, isKeyed, isRoot, context);
		}
	}
}

export function patchInputWithPromiseInput(
	lastInput: Input, 
	vAsyncNode: VAsyncNode, 
	parentDomNode: HTMLElement | SVGAElement | DocumentFragment, 
	lifecycle: Lifecycle, 
	instance: StatefulComponent, 
	namespace: string, 
	isKeyed: boolean, 
	isRoot: boolean,
	context: Context
) {
	const promise: Promise<any> = vAsyncNode._async;
	
	promise.then(nextInput => {
		if (isFalse(vAsyncNode._cancel)) {
			nextInput = normaliseInput(nextInput);
			patch(lastInput, nextInput, parentDomNode, lifecycle, instance, namespace, isKeyed, isRoot, context);
			
			vAsyncNode._dom = getDomNodeFromInput(nextInput, parentDomNode);
			vAsyncNode._lastInput = nextInput;
		}
	})
}

function patchNonKeyedArray(
	lastArray: Array<Input>, 
	nextArray: Array<Input>, 
	parentDomNode: HTMLElement | SVGAElement | DocumentFragment, 
	lifecycle: Lifecycle, 
	instance: StatefulComponent, 
	namespace: string, 
	isRoot: boolean,
	context: Context
) {
	// optimisaiton technique, can we delay doing this upon finding an invalid child and then falling back?
	// it is expensive to do if we somehow know both arrays are the same length, even once flattened
	lastArray = normaliseArray(lastArray, false);
	nextArray = normaliseArray(nextArray, true);
	let lastArrayLength: number = lastArray.length;
	let nextArrayLength: number = nextArray.length;
	let commonLength: number = lastArrayLength > nextArrayLength ? nextArrayLength : lastArrayLength;
	let i: number = 0;
	
	for (; i < commonLength; i++) {
		patch(lastArray[i], nextArray[i], parentDomNode, lifecycle, instance, namespace, false, isRoot, context);
	}
	if (lastArrayLength < nextArrayLength) {
		for (i = commonLength; i < nextArrayLength; i++) {
			mount(nextArray[i], parentDomNode, lifecycle, instance, namespace, false, context);
		}
	} else if (lastArrayLength > nextArrayLength) {
		for (i = commonLength; i < lastArrayLength; i++) {
			unmount(lastArray[i], parentDomNode, lifecycle, instance, true, false);
		}
	}	
}

function patchVTextNode(lastVTextNode: VTextNode, nextVTextNode: VTextNode) {
	const nextText = nextVTextNode._text;
	const domTextNode = lastVTextNode._dom;

	nextVTextNode._dom = domTextNode;
	if (lastVTextNode._text !== nextText) {
		setText(domTextNode as Text, nextVTextNode._text);
	}
}

// TODO this function should throw if it can't find the key on an item
function patchKeyedArray(
	lastArray: Array<Input>, 
	nextArray: Array<Input>, 
	parentDomNode: HTMLElement | SVGAElement | DocumentFragment, 
	lifecycle: Lifecycle, 
	instance: Object, 
	namespace: string,
	context: Context
) {
	// TODO
}

function patchAttribute(name, lastValue, nextValue, domNode, namespace) {
	if (lastValue !== nextValue) {
		setAttribute(name, nextValue, domNode, namespace);
	}
}

function patchEvent(name, lastValue, nextValue, domNode, namespace) {
	if (lastValue !== nextValue) {
		setEvent(name, nextValue, domNode);
	}
}

function patchProperty(name, lastValue, nextValue, domNode) {
	if (lastValue !== nextValue) {
		if (name === 'className') {
			domNode.className = nextValue;
		} else if (name === 'style') {
			patchStyle(lastValue, nextValue, domNode)
		} else {
			domNode[name] = nextValue;
		}
	}
}

export function patchStyle(lastValue: string | number | boolean | Object, nextValue: string | number | boolean | Object, domNode: HTMLElement | SVGAElement) {
	if (isString(nextValue)) {
		domNode.style.cssText = nextValue;
	} else if (isUndef(lastValue)) {
		if (!isUndef(nextValue)) {
			const styleKeys = Object.keys(nextValue);

			for (let i = 0; i < styleKeys.length; i++) {
				const style = styleKeys[i];

				domNode.style[style] = nextValue[style];
			}
		}
	} else if (isUndef(nextValue)) {
		domNode.removeAttribute('style');
	} else {
		const styleKeys = Object.keys(nextValue);

		for (let i = 0; i < styleKeys.length; i++) {
			const style = styleKeys[i];

			domNode.style[style] = nextValue[style];
		}
		const lastStyleKeys = Object.keys(lastValue);

		for (let i = 0; i < lastStyleKeys.length; i++) {
			const style = lastStyleKeys[i];
			if (isUndef(nextValue[style])) {
				domNode.style[style] = '';
			}
		}
	}
}