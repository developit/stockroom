import { WorkerStore } from "./worker";
import { Store } from "unistore";

/**
 * Create a new store based on a Worker.
 * @param worker Instance of WorkerStore.
 */
export default function createStore<WorkerState>(
	worker: WorkerStore<WorkerState>
): WorkerStore<WorkerState>;
