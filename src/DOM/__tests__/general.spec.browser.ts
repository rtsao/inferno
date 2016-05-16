import { render } from './../rendering';

const describe = window['describe'];
const it = window['it'];
const beforeEach = window['beforeEach'];
const afterEach = window['afterEach'];
const expect = window['expect'];

describe('General sweep tests - (non-JSX)', () => {
	let container: HTMLElement;

	beforeEach(function () {
		container = document.createElement('div');
	});

	afterEach(function () {
		render(null, container);
		container.innerHTML = '';
	});
	
	describe('Single string', () => {
		it('Mount', () => {
			render('123', container);
			expect(container.innerHTML).to.equal('123');
		});
		it('Unmount', () => {
			render('123', container);
			expect(container.innerHTML).to.equal('123');
			render(null, container);
			expect(container.innerHTML).to.equal('');
		});
		it('Patch', () => {
			render('123', container);
			expect(container.innerHTML).to.equal('123');
			render('456', container);
			expect(container.innerHTML).to.equal('456');
			render('987', container);
			expect(container.innerHTML).to.equal('987');
		});
	});
	
	describe('Array of strings', () => {
		it('Mount', () => {
			render([ 1, 2, 3 ], container);
			expect(container.innerHTML).to.equal('123');
		});
		it('Unmount', () => {
			render([ 1, 2, 3 ], container);
			render([], container);
			expect(container.innerHTML).to.equal('');
			render([ 1, 2, 3 ], container);
			expect(container.innerHTML).to.equal('123');
			render(null, container);
			expect(container.innerHTML).to.equal('');
			render([ 1, 2, 3 ], container);
			expect(container.innerHTML).to.equal('123');
			render([ null ], container);
			expect(container.innerHTML).to.equal('');
		});
		it('Patch', () => {
			render([ 1, 2, 3 ], container);
			expect(container.innerHTML).to.equal('123');
			render([ 3, 2, 1 ], container);
			expect(container.innerHTML).to.equal('321');
			render([ 3, 2, 1, 0 ], container);
			expect(container.innerHTML).to.equal('3210');
		});
	});
	
	describe('Mix of arrays and strings', () => {
		it('Mount', () => {
			render([ 1, 2, 3 ], container);
			expect(container.innerHTML).to.equal('123');
			render(null, container);
			render('123', container);
			expect(container.innerHTML).to.equal('123');
		});
		it('Unmount', () => {
			render([ 1, 2, 3 ], container);
			render([], container);
			expect(container.innerHTML).to.equal('');
			render([ 1, 2, 3 ], container);
			expect(container.innerHTML).to.equal('123');
			render(null, container);
			expect(container.innerHTML).to.equal('');
			render([ 1, 2, 3 ], container);
			expect(container.innerHTML).to.equal('123');
			render([ null ], container);
			expect(container.innerHTML).to.equal('');
		});
		it('Patch', () => {
			render([ 1, 2, 3 ], container);
			expect(container.innerHTML).to.equal('123');
			render('3210', container);
			expect(container.innerHTML).to.equal('3210');
			render([ 3, 2, 1 ], container);
			expect(container.innerHTML).to.equal('321');
			render([ 3, 2, 1, 0 ], container);
			expect(container.innerHTML).to.equal('3210');
			render('3210', container);
			expect(container.innerHTML).to.equal('3210');
			render([ 3, 2, 1, 0 ], container);
			expect(container.innerHTML).to.equal('3210');
			render(null, container);
			expect(container.innerHTML).to.equal('');
			render(null, container);
			expect(container.innerHTML).to.equal('');
			render([ 3, 2, 1, 0 ], container);
			expect(container.innerHTML).to.equal('3210');
		});
	});	
	
	describe('Promises', () => {
		function createPromise() {
			return new Promise((resolve, reject) => { resolve('Hello world!'); });
		}
		function createPromise2() {
			return new Promise((resolve, reject) => { resolve('Hello world 2!'); });
		}
		
		it('Mount', done => {
			render(createPromise(), container);
			setTimeout(() => {
				expect(container.innerHTML).to.equal('Hello world!');
				done();
			}, 10);
		});
		it('Mount #2', done => {
			render([createPromise(), createPromise(), createPromise()], container);
			setTimeout(() => {
				expect(container.innerHTML).to.equal('Hello world!Hello world!Hello world!');
				done();
			}, 10);
		});
		it('Unmount', done => {
			render(createPromise(), container);
			render(null, container);
			
			setTimeout(() => {
				expect(container.innerHTML).to.equal('');
				done();
			}, 10);
		});
		it('Unmount #2', done => {
			render(createPromise(), container);
			
			setTimeout(() => {
				render(null, container);
				expect(container.innerHTML).to.equal('');
				done();
			}, 10);
		});
		it('Patch', () => {
			render(createPromise(), container);
			render('456', container);
			expect(container.innerHTML).to.equal('456');
		});
		it('Patch #2', done => {
			render(createPromise(), container);
			setTimeout(() => {
				expect(container.innerHTML).to.equal('Hello world!');
				render('456', container);
				expect(container.innerHTML).to.equal('456');
				done();
			}, 10);
		});
		it('Patch #3', done => {
			render('456', container);
			expect(container.innerHTML).to.equal('456');
			render(createPromise(), container);
			setTimeout(() => {
				expect(container.innerHTML).to.equal('Hello world!');
				done();
			}, 10);
		});
		it('Patch #4', done => {
			render(createPromise(), container);
			setTimeout(() => {
				expect(container.innerHTML).to.equal('Hello world!');
				render(createPromise2(), container);
				setTimeout(() => {
					expect(container.innerHTML).to.equal('Hello world 2!');
					done();
				});
			}, 10);
		});
		it('Patch #5', done => {
			render(createPromise(), container);
			render(createPromise2(), container);
			setTimeout(() => {
				expect(container.innerHTML).to.equal('Hello world 2!');
				done();
			});
		});
	});
});