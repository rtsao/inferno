import { render } from '../../DOM/rendering';
import { element, component } from '../../core/index';
import createElement from '../../createElement/index';

declare var describe;
declare var it;
declare var beforeEach;
declare var afterEach;
declare var expect;
declare var global;

describe('SVG (non-jsx)', () => {
	let container;

	beforeEach(() => {
		container = document.createElement('div');
	});

	afterEach(() => {
		render(null, container);
	});

	it('should set "class" attribute', () => {
		const template = (val1) =>
			createElement('svg', { height: val1 });

		render(template(null), container);
		render(template(200), container);
		expect(container.firstChild.tagName.toLowerCase()).to.eql('svg');
		expect(container.firstChild.namespaceURI).to.eql('http://www.w3.org/2000/svg');
		expect(container.firstChild.getAttribute('height')).to.eql('200');
		render(template(null), container);
		render(template(200), container);
		expect(container.firstChild.tagName.toLowerCase()).to.eql('svg');
		expect(container.firstChild.namespaceURI).to.eql('http://www.w3.org/2000/svg');
		expect(container.firstChild.getAttribute('height')).to.eql('200');
	});

	it('should respect SVG namespace and render SVG attributes', () => {
		let template;

		template = (val1) =>
			createElement('svg', {
				xmlns: 'http://www.w3.org/2000/svg',
				version: '1.1',
				baseProfile: 'full',
				width: '200',
				height: val1
			}, null);

		render(template(200), container);
		expect(container.firstChild.tagName.toLowerCase()).to.eql('svg');
		expect(container.firstChild.namespaceURI).to.eql('http://www.w3.org/2000/svg');
		expect(container.firstChild.getAttribute('xmlns')).to.eql('http://www.w3.org/2000/svg');
		expect(container.firstChild.getAttribute('version')).to.eql('1.1');
		expect(container.firstChild.getAttribute('baseProfile')).to.eql('full');
		expect(container.firstChild.getAttribute('width')).to.eql('200');

		render(template(null), container);

		template = () =>
			createElement('svg', { width: 200 }, null);
		render(template(), container);

		expect(container.firstChild.tagName.toLowerCase()).to.eql('svg');
		expect(container.firstChild.namespaceURI).to.eql('http://www.w3.org/2000/svg');
		expect(container.firstChild.getAttribute('width')).to.eql('200');

		render(template(), container);

		expect(container.firstChild.tagName.toLowerCase()).to.eql('svg');
		expect(container.firstChild.namespaceURI).to.eql('http://www.w3.org/2000/svg');
		expect(container.firstChild.getAttribute('width')).to.eql('200');
	});

	it('should set SVG as default namespace for <svg>', () => {
		let template;

		template = element('svg');

		render(template, container);
		expect(container.firstChild.namespaceURI).to.equal('http://www.w3.org/2000/svg');

		template = element('svg').children(element('path'));

		render(template, container);
		expect(container.firstChild.namespaceURI).to.equal('http://www.w3.org/2000/svg');
	});

	it('should unset a namespaced attributes #1', () => {
		const template = (val) => element('svg').children(element('image').attrs({
			'xlink:href': val
		}));

		render(template('test.jpg'), container);
		expect(container.firstChild.firstChild.getAttributeNS('http://www.w3.org/1999/xlink', 'href')).to.equal('test.jpg');
		render(template(null), container);
		expect(container.firstChild.firstChild.hasAttributeNS('http://www.w3.org/1999/xlink', 'href')).to.equal(false);
	});

	it('should unset a namespaced attributes #2', () => {
		const template = (val) => element('image').attrs({ 'xlink:href': val }) 

		render(template(null), container);
		expect(container.firstChild.hasAttributeNS('http://www.w3.org/1999/xlink', 'href')).to.equal(false);

		render(template(null), container);
		expect(container.firstChild.hasAttributeNS('http://www.w3.org/1999/xlink', 'href')).to.equal(false);
	});

	it('should unset a namespaced attributes #3', () => {
		const template = (val) => element('image').attrs({
			xmlns: 'http://www.w3.org/2000/svg',
			'xlink:href': val
		});
		
		render(template(null), container);
		expect(container.firstChild.hasAttributeNS('http://www.w3.org/1999/xlink', 'href')).to.equal(false);

		render(template('test.jpg'), container);
		expect(container.firstChild.getAttributeNS('http://www.w3.org/1999/xlink', 'href')).to.equal('test.jpg');
	});

	it('should use the parent namespace by default (static)', () => {
		let template;

		template = element('svg').children(element('circle')); 

		render(template, container);
		expect(container.firstChild.namespaceURI).to.equal('http://www.w3.org/2000/svg');
		expect(container.firstChild.firstChild.namespaceURI).to.equal('http://www.w3.org/2000/svg');

		render(template, container);
		expect(container.firstChild.namespaceURI).to.equal('http://www.w3.org/2000/svg');
		expect(container.firstChild.firstChild.namespaceURI).to.equal('http://www.w3.org/2000/svg');

		template = element('svg').children(element('path')); 

		render(template, container);
		expect(container.firstChild.namespaceURI).to.equal('http://www.w3.org/2000/svg');
		expect(container.firstChild.firstChild.namespaceURI).to.equal('http://www.w3.org/2000/svg');

		template = element('svg');

		render(template, container);
		expect(container.firstChild.namespaceURI).to.equal('http://www.w3.org/2000/svg');
	});

	it('should handle SVG edge case (static)', () => {
		const template = element('div').children(element('svg'));

		render(template, container);
		expect(container.firstChild.firstChild.namespaceURI).to.equal('http://www.w3.org/2000/svg');
		render(template, container);
		expect(container.firstChild.firstChild.namespaceURI).to.equal('http://www.w3.org/2000/svg');
	});

	it('should keep parent namespace (dynamic)', () => {
		let template = (child) => element('svg').children(child); 
		let child = () => element('circle');

		render(template(child()), container);
		expect(container.firstChild.namespaceURI).to.equal('http://www.w3.org/2000/svg');
		render(template(null), container);
		
		child = () => element('circle').children(element('circle')); 

		render(template(child()), container);
		expect(container.firstChild.firstChild.namespaceURI).to.equal('http://www.w3.org/2000/svg');
		expect(container.firstChild.firstChild.firstChild.namespaceURI).to.equal('http://www.w3.org/2000/svg');
		render(template(null), container);

		child = () => element('circle').children(element('circle').children(element('g'))); 

		render(template(child()), container);
		expect(container.firstChild.firstChild.firstChild.namespaceURI).to.equal('http://www.w3.org/2000/svg');
		expect(container.firstChild.firstChild.firstChild.firstChild.namespaceURI).to.equal('http://www.w3.org/2000/svg');

		child = () => element('circle').children(element('circle')).children(element('g').children(element('g')));

		render(template(child()), container);
		expect(container.firstChild.firstChild.firstChild.firstChild.namespaceURI).to.equal('http://www.w3.org/2000/svg');
		
		child = () => element('circle').children(element('circle')).children(element('g').children(element('g').children(element('circle'))));

		render(template(null), container);
		render(template(child()), container);
		expect(container.firstChild.firstChild.firstChild.firstChild.firstChild.namespaceURI).to.equal('http://www.w3.org/2000/svg');
		render(template(null), container);
		render(template(child()), container);
		expect(container.firstChild.firstChild.firstChild.firstChild.firstChild.namespaceURI).to.equal('http://www.w3.org/2000/svg');
	});

	it('should set class attribute', () => {
		const template = (val) => element('image').attrs({
			class: val
		});
		render(template('foo'), container);
		expect(container.firstChild.getAttribute('class')).to.equal('foo');
		render(template(null), container);

		render(template('bar'), container);
		expect(container.firstChild.getAttribute('class')).to.equal('bar');

		render(template(['bar']), container);
		expect(container.firstChild.getAttribute('class')).to.equal('bar');

		render(template([ 'bar', 'zoo' ]), container);
		expect(container.firstChild.getAttribute('class')).to.equal('bar,zoo');
	});

	it('should respect SVG namespace and render SVG attributes #2', () => {
		const template = (val1, val2) => element('svg').attrs({
			xmlns: 'http://www.w3.org/2000/svg',
			version: '1.1',
			baseProfile: 'full',
			width: val1,
			height: val2
		});

		render(template(200, 200), container);

		expect(container.firstChild.tagName.toLowerCase()).to.eql('svg');
		expect(container.firstChild.namespaceURI).to.eql('http://www.w3.org/2000/svg');
		expect(container.firstChild.getAttribute('xmlns')).to.eql('http://www.w3.org/2000/svg');
		expect(container.firstChild.getAttribute('version')).to.eql('1.1');
		expect(container.firstChild.getAttribute('baseProfile')).to.eql('full');
		expect(container.firstChild.getAttribute('width')).to.eql('200');
		expect(container.firstChild.getAttribute('height')).to.eql('200');

		render(template(300, 300), container);

		expect(container.firstChild.tagName.toLowerCase()).to.eql('svg');
		expect(container.firstChild.namespaceURI).to.eql('http://www.w3.org/2000/svg');
		expect(container.firstChild.getAttribute('xmlns')).to.eql('http://www.w3.org/2000/svg');
		expect(container.firstChild.getAttribute('version')).to.eql('1.1');
		expect(container.firstChild.getAttribute('baseProfile')).to.eql('full');
		expect(container.firstChild.getAttribute('width')).to.eql('300');
		expect(container.firstChild.getAttribute('height')).to.eql('300');
	});

	it('should set "viewBox" attribute', () => {
		const template = () => element('svg').attrs({
			xmlns: 'http://www.w3.org/2000/svg',
			viewBox: '0 0 50 20'
		});

		render(template(), container);

		expect(container.firstChild.tagName.toLowerCase()).to.eql('svg');
		expect(container.firstChild.namespaceURI).to.eql('http://www.w3.org/2000/svg');
		expect(container.firstChild.getAttribute('xmlns')).to.eql('http://www.w3.org/2000/svg');
		expect(container.firstChild.getAttribute('viewBox')).to.eql('0 0 50 20');

		render(template(), container);

		expect(container.firstChild.tagName.toLowerCase()).to.eql('svg');
		expect(container.firstChild.namespaceURI).to.eql('http://www.w3.org/2000/svg');
		expect(container.firstChild.getAttribute('xmlns')).to.eql('http://www.w3.org/2000/svg');
		expect(container.firstChild.getAttribute('viewBox')).to.eql('0 0 50 20');
	});

	it('should solve SVG edge when wrapped inside a non-namespace element (static)', () => {
		const template = () => element('div').children(element('svg')); 
		
		render(template(), container);
		expect(container.firstChild.firstChild.namespaceURI).to.equal('http://www.w3.org/2000/svg');
	});

	it('should solve SVG edge case with XMLNS attribute when wrapped inside a non-namespace element (static)', () => {
		const template = () => element('div').attrs({
			xmlns: 'http://www.w3.org/2000/svg'
		}).children(element('svg'));
	
		render(template(), container);
		expect(container.firstChild.firstChild.namespaceURI).to.equal('http://www.w3.org/2000/svg');

	});

	it('should solve SVG edge when wrapped inside a non-namespace element (static)', () => {
		const template = () => element('div').children(element('svg')).attrs({
			xmlns: 'http://www.w3.org/2000/svg'
		});

		render(template(), container);
		expect(container.firstChild.firstChild.namespaceURI).to.equal('http://www.w3.org/2000/svg');
		render(template(), container);
		expect(container.firstChild.firstChild.namespaceURI).to.equal('http://www.w3.org/2000/svg');
	});
});
