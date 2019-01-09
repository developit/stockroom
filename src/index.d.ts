import { Store } from "unistore";

/**
 * Given a Web Worker instance, sets up RPC-based synchronization with a WorkerStore running within it.
 * @param worker An instantiated Web Worker (eg: `new Worker('./store.worker.js')`)
 * @returns A mock unistore store instance sitting in front of the worker store.
 * @example
 *	import createStore from 'stockroom'
	*	import StoreWorker from 'worker-loader!./store.worker'
	*	let store = createStore(new StoreWorker)
	*/
export default function createStore<K>(worker: Worker): Store<K>;
