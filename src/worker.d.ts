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
 * Creates a unistore instance for use in a Web Worker that synchronizes itself to the main thread.
 * @param initialState Initial state to populate
 * @returns Enhanced unistore store
 * @example
 *	import createWorkerStore from 'stockroom/worker'
 *	let initialState = { count: 0 }
 *	let store = createWorkerStore(initialState)
 *	store.registerActions({
 *		increment(state) {
 *			return { count: state.count + 1 }
 *		}
 *	})
 */
export default function createWorkerStore<K>(initialState?: K): WorkerStore<K>;
