// K - Store state

import { Store } from "unistore";

export interface WorkerStore<K> extends Store<K> {
	freeze: () => void;
	unfreeze: () => void;
}

export default function createWorkerStore<K>(initialState?: K): WorkerStore<K>;
