import { isArray, isString, isStringOrNumber, isNullOrUndef, isNull, isFunction, isInvalid, VElement, VComponent, VNode, Props, Hooks } from './../shared';
import { element, component } from '../core/index';

const propertyNames = {
	className: true,
	htmlFor: true,
	style: true,
	disabled: true,
	selected: true,
	multiple: true,
	checked: true,
	readonly: true,
	ismap: true,
	defer: true,
	declare: true,
	noresize: true,
	nowrap: true,
	noshade: true,
	compact: true	
};

function processElementProps(elementProps: Props) {
	const elementPropsKeys = Object.keys(elementProps);
	const attrs = {};
	const props = {};
	const hooks = {};
	const events = {};
	
	for (let i = 0; i < elementPropsKeys.length; i++) {
		const elementProp = elementPropsKeys[i];
		
		// TODO check for hooks?
		// TODO check for events?
		if (propertyNames[elementProp]) {
			props[elementProp] = elementProps[elementProp];
		} else {
			attrs[elementProp] = elementProps[elementProp];
		}
	}	
	return {
		attrs,
		props,
		hooks,
		events
	};
}

function processComponentProps(componentProps: Props) {
	const componentPropsKeys = Object.keys(componentProps);
	const props = {};
	const hooks = {};
	
	for (let i = 0; i < componentPropsKeys.length; i++) {
		const componentProp = componentPropsKeys[i];
		
		// TODO check for hooks?
		props[componentProp] = componentProps[componentProp];
	}
	return {
		props,
		hooks
	};
}

export default function createElement(tag: string | Function, nodeProps: Props, ...children: Array<string | number | VNode>): VElement | VComponent {
	if (isString(tag)) {
		const vElement: VElement = element(tag);
		
		if (!isNull(nodeProps)) {
			const processedElementProps = processElementProps(nodeProps);
			
			vElement._attrs = processedElementProps.attrs || null;
			vElement._props = processedElementProps.props || null;
			vElement._events = processedElementProps.events || null;
			vElement._hooks = (processedElementProps.hooks as Hooks) || null;
		}
		if (children.length === 1) {
			const child = children[0];
			
			if (isStringOrNumber(child)) {
				vElement._text = child;
			} else {
				vElement._children = child;
			}
		} else if (children.length > 1) {
			vElement._children = children;
		}
		return vElement;
	} else {
		const vComponent: VComponent = component(tag);
		
		if (!isNull(nodeProps)) {
			const processedComponentProps = processComponentProps(nodeProps);
			
			vComponent._hooks = (processedComponentProps.hooks as Hooks) || null;
			vComponent._props = processedComponentProps.props || null;
		}
		if (children.length === 1) {
			if (!vComponent._props) {
				vComponent._props = {};
			}
			vComponent._props.children = children[0]; 
		} else if (children.length > 1) {
			if (!vComponent._props) {
				vComponent._props = {};
			}
			vComponent._props.children = children;
		}
		return vComponent;
	}
}
