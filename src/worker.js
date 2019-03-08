import createStore from 'unistore';
import { diff, applyUpdate } from './util';


/** The other half of stockroom, which runs inside a Web Worker.
 *	@name module:stockroom/worker
 */
let worker; // eslint-disable-line


/** Creates a unistore instance for use in a Web Worker that synchronizes itself to the main thread.
 *	@memberof module:stockroom/worker
 *  @param {Object} [initialState={}]	Initial state to populate
 *  @returns {WorkerStore} workerStore (enhanced unistore store)
 *	@example
 *	import createWorkerStore from 'stockroom/worker'
 *	let initialState = { count: 0 }
 *	let store = createWorkerStore(initialState)
 *	store.registerActions({
 *		increment(state) {
 *			return { count: state.count + 1 }
 *		}
 *	})
 */
export default function createWorkerStore(initialState) {
	let store = createStore(initialState),
		actions = store.actions = {},
		currentState = {},
		frozen = 0,
		onThaw = [],
		sendQueue = [],
		lock = false;

	for (let i in initialState) currentState[i] = initialState[i];

	function send(opts) {
		if (sendQueue.push(opts)===1) {
			setTimeout(processSendQueue);
		}
	}

	function processSendQueue() {
		if (typeof postMessage==='function' && postMessage.length === 1) postMessage(sendQueue);
		sendQueue.length = 0;
	}

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
		if (frozen>0) return onThaw.push(data);
		let { type, id, overwrite, partial, update, action } = data;
		if (type==='@@STATE') {
			if (partial===true) {
				update = applyUpdate(store.getState(), update);
				overwrite = true;
			}
			store.setState(update, overwrite===true, action);
		}
		else if (type==='@@ACTION') {
			let fn = actions[action.type];
			if (action.params) fn.apply(actions, action.params);
			else fn.call(actions, action.payload);
			if (id) send({ type: '@@ACTIONCOMPLETE', id });
		}
	}
	if (typeof addEventListener==='function') addEventListener('message', handleMessage);

	store.subscribe( (state, action) => {
		if (lock===true) return;
		let update = diff(state, currentState);
		// console.log('sub: ', { action, lock, update, state, currentState });
		currentState = state;
		send({ type: '@@STATE', update, action: action && action.name, partial: true });
	});

	store.registerActions = newActions => {
		if (typeof newActions==='function') newActions = newActions(store);
		for (let i in newActions) {
			actions[i] = store.action(newActions[i]);
		}
	};

	/** Queue all additional processing until unfrozen.
	 *	freeze/unfreeze manages a cumulative lock:
	 *	unfreeze must be called as many times as freeze was called in order to remove the lock.
	 */
	store.freeze = () => {
		frozen++;
	};

	/** Remove a freeze lock and process queued work. */
	store.unfreeze = () => {
		if (--frozen) return;
		let r = onThaw;
		onThaw = [];
		for (let i=0; i<r.length; i++) process(r[i]);
	};

	send({ type: '@@STATE', initial: true, update: store.getState() });

	return store;
}
