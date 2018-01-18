import { assign, diff, applyUpdate } from './util';

/** The main stockroom module, which runs on the main thread.
 *	@name module:stockroom
 */
let stockroom; // eslint-disable-line


/** Given a Web Worker instance, sets up RPC-based synchronization with a WorkerStore running within it.
 *	@memberof module:stockroom
 *  @param {Worker} worker		An instantiated Web Worker (eg: `new Worker('./store.worker.js')`)
 *  @returns {Store} synchronizedStore - a mock unistore store instance sitting in front of the worker store.
 *	@example
 *	import createStore from 'stockroom'
 *	import StoreWorker from 'worker-loader!./store.worker'
 *	let store = createStore(new StoreWorker)
 */
export default function createStore(worker) {
	let listeners = [],
		state = {},
		sendQueue = [],
		initialized = false;
	
	function handleMessage({ data }) {
		if (typeof data!=='object') {}
		else if ('pop' in data) {
			if (data.length===1) {
				process(data[0]);
			}
			else {
				for (let i=0; i<data.length; i++) process(data[i]);
			}
		}
		else {
			process(data);
		}
	}

	function process(data) {
		let { type, overwrite, update, action, initial, partial } = data;

		if (type==='@@STATE') {
			if (partial===true) {
				update = applyUpdate(state, update);
				overwrite = true;
			}

			setState(update, overwrite===true, action, false);

			if (initial) {
				initialized = true;
				processSendQueue();
			}
		}
	}


	worker.addEventListener('message', handleMessage);

	function setState(update, overwrite, action, replicate) {
		let oldState = state;
		state = assign(overwrite ? {} : assign({}, state), update);
		if (replicate) {
			let update = overwrite ? state : diff(state, oldState);
			send({ type: '@@STATE', overwrite, update, action, partial: !overwrite });
			// send({ type: '@@STATE', overwrite, update, action });
		}
		let currentListeners = listeners;
		for (let i=0; i<currentListeners.length; i++) currentListeners[i](state, action);
	}

	function send(opts) {
		if (sendQueue.push(opts)===1) {
			setTimeout(processSendQueue);
		}
	}

	function processSendQueue() {
		if (initialized && sendQueue.length>0) {
			worker.postMessage(sendQueue);
			sendQueue.length = 0;
		}
	}
	
	function unsubscribe(listener) {
		let out = [];
		for (let i=0; i<listeners.length; i++) {
			if (listeners[i]===listener) {
				listener = null;
			}
			else {
				out.push(listeners[i]);
			}
		}
		listeners = out;
	}

	return {
		action(actionCreator) {
			return (...params) => {
				let action = typeof actionCreator==='function' ? actionCreator(...params) : actionCreator;
				if (typeof action==='string') action = { type: action, params: params.filter(notEvent) };
				if (action && !action.type) {
					// console.warn('Action running on main thread: ', actionCreator.name);
					setState(action, false, actionCreator.name, true);
				}
				else {
					// console.log('ACTION', action.type, ...(action.params || [action.payload]));
					send({ type: '@@ACTION', action });
				}
			};
		},
		setState(update, overwrite, action) {
			return setState(update, overwrite, action, true);
		},
		getState() {
			return state;
		},
		subscribe(listener) {
			listeners.push(listener);
			return () => { unsubscribe(listener); };
		},
		unsubscribe
	};
}

// Filter out DOM Events
const notEvent = e => !(e instanceof Event);
