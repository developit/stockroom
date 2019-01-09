import { Store } from "unistore";

export interface WorkerStore<K> extends Store<K> {
	/**
	 * Queue all additional processing until unfrozen.
	 */
	freeze: () => void;
	/**
	 * Remove a freeze lock and process queued work.
	 */
	unfreeze: () => void;
}

/**
 * For SSR/prerendering, pass your exported worker store through this enhancer to make an inline synchronous version that runs in the same thread.
 * @param workerStore The exported `store` instance that would have been invoked in a Worker
 * @returns A unistore instance with centralized actions
 * @example
 *	let store
 *	if (SUPPORTS_WEB_WORKERS) {
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
export default function createInlineStore<K>(
	workerStore: WorkerStore<K>
): WorkerStore<K>;
