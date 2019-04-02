/** Used to run your whole store on the main thread.
 *	Useful for non-worker environments or as a fallback.
 *	@name module:stockroom/inline
 */
let inline; // eslint-disable-line

/** For SSR/prerendering, pass your exported worker store through this enhancer
 *	to make an inline synchronous version that runs in the same thread.
 *	@memberof module:stockroom/inline
 *	@param {WorkerStore} workerStore	The exported `store` instance that would have been invoked in a Worker
 *	@returns {Store} inlineStore - a unistore instance with centralized actions
 *	@example
 *	let store
 *	if (SUPPORTS_WEB_WORKERS === false) {
 *		let createStore = require('stockroom/inline')
 *		store = createStore(require('./store.worker'))
 *	}
 *	else {
 *		let createStore = require('stockroom')
 *		let StoreWorker = require('worker-loader!./store.worker')
 *		store = createStore(new StoreWorker())
 *	}
 *	export default store
 */
export default function createInlineStore(workerStore) {
	let notEvent = e => typeof Event!=='function' || !(e instanceof Event);

	workerStore.action = actionCreator => (...params) => {
		let action = typeof actionCreator==='function' ? actionCreator(...params) : actionCreator;
		if (typeof action==='string') action = { type: action, params: params.filter(notEvent) };
		if (action && !action.type) {
			workerStore.setState(action, false, actionCreator.name, true);
		}
		else {
			workerStore.actions[action.type](...(action.params || [action.payload]));
		}
	};
	return workerStore;
}
