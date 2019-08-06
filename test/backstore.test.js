// import { h, Component, render } from 'preact';
import createStore from 'stockroom';
import StoreWorker from 'workerize-loader?inline!./worker.fixture.js';
// import jsxChai from 'preact-jsx-chai';
// chai.use(jsxChai);

const sleep = ms => new Promise( r => { setTimeout(r, ms); });

describe('createStore()', () => {
	let worker, store, postMessage = sinon.spy();

	it('should be instantiable', () => {
		worker = new StoreWorker();
		expect(worker).to.be.an.instanceof(Worker);
		let pm = worker.postMessage;
		worker.postMessage = function(data) {
			// best to work on clones here, references get nerfed
			postMessage(JSON.parse(JSON.stringify(data)));
			return pm.apply(this, arguments);
		};
		// worker.postMessage = sinon.spy(worker, 'postMessage');
		sinon.spy(worker, 'postMessage');
		worker.onmessage = sinon.spy();
		// worker.sent = [];
		// worker.received = [];
		// worker.addEventListener('message', e => {
		// 	worker.messages.push(e.data);
		// });
		// let pm = worker.postMessage;
		// worker.postMessage = function(data) {
		// 	worker.sent.push(data);
		// 	return pm.apply(this, arguments);
		// };

		store = createStore(worker);

		expect(store).to.have.property('setState').that.is.a('function');
		expect(store).to.have.property('getState').that.is.a('function');
		expect(store).to.have.property('subscribe').that.is.a('function');
		expect(store).to.have.property('unsubscribe').that.is.a('function');
	});

	it('should set up state', async () => {
		let state = await worker.getState();
		expect(state).to.eql({
			count: 1,
			obj: {
				a: 'b'
			}
		});
	});

	describe('getState()', () => {
		it('should return the current state', () => {
			expect(store.getState()).to.eql({
				count: 1,
				obj: {
					a: 'b'
				}
			});
		});
	});

	describe('setState()', () => {
		it('should update worker state', async () => {
			postMessage.reset();

			store.setState({ foo: 'bar' });

			expect(store.getState()).to.have.property('foo', 'bar');

			// wait for state to sync
			await sleep(10);

			expect(postMessage).to.have.been.calledOnce.and.calledWith([
				{ type: '@@STATE', update: { foo: 'bar' }, partial: true }
			]);

			let state = await worker.getState();
			expect(state).to.have.property('foo', 'bar');
		});
	});

	describe('action()', () => {
		it('should return a function when passed a string action ID', () => {
			expect(store.action('foo')).to.be.a('function');
		});

		it('should invoke action in the worker & update both states', async () => {
			postMessage.reset();

			let increment = store.action('increment');
			increment({ x: 'y' });

			// wait for action to run before grabbing the updated state
			await sleep(10);

			expect(postMessage).to.have.been.calledOnce.and.calledWith([
				{ type: '@@ACTION', action: { type: 'increment', params: [{ x: 'y' }] } }
			]);

			let state = await worker.getState();

			expect(state, 'worker state').to.have.property('count', 2);
			expect(store.getState(), 'main thread state').to.have.property('count', 2);
		});

		it('should batch actions', async () => {
			postMessage.reset();

			let increment = store.action('increment');
			increment({ x: 'y' });
			increment({ x: 'y' });

			await sleep(10);

			expect(postMessage).to.have.been.calledOnce.and.calledWith([
				{ type: '@@ACTION', action: { type: 'increment', params: [{ x: 'y' }] } },
				{ type: '@@ACTION', action: { type: 'increment', params: [{ x: 'y' }] } }
			]);

			let state = await worker.getState();

			expect(state, 'worker state').to.have.property('count', 4);
			expect(store.getState(), 'main thread state').to.have.property('count', 4);
		});

		it('should invoke inline action on main thread', async () => {
			postMessage.reset();

			const action = sinon.spy(state => ({
				foo: 'BAZ'
			}));
			function setFooAction() {
				return action.apply(this, arguments);
			}
			let setFoo = store.action(setFooAction);
			expect(setFoo).to.be.a('function');
			expect(action).not.to.have.been.called;
			setFoo('hello', 'world');

			expect(postMessage).not.to.have.been.called;

			expect(action).to.have.been.calledOnce.and.calledWith('hello', 'world');
			expect(store.getState()).to.have.property('foo', 'BAZ');
			// wait for state to sync to worker
			await sleep(10);

			expect(postMessage).to.have.been.calledOnce.and.calledWith([
				{ type: '@@STATE', partial: true, overwrite: false, action: 'setFooAction', update: { foo: 'BAZ' } }
			]);

			let state = await worker.getState();
			expect(state).to.have.property('foo', 'BAZ');
		});
	});
});
