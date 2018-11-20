import { Action, Store } from "unistore";

/**
 * Actions object.
 */
export interface Actions<WorkerState> {
	[action: string]: Action<WorkerState>;
}

/**
 * Types of actions received by registerActions.
 */
export type ActionRegister<WorkerState> = (
	store: WorkerStore<WorkerState>
) => Actions<WorkerState> | Actions<WorkerState>;

/**
 * Enhanced unistore store.
 */
export interface WorkerStore<WorkerState> extends Store<WorkerState> {

	/**
	 * Creates a new instance of WorkerStore.
	 */
	new(): WorkerStore<WorkerState>;

	/**
	 * List of registered actions.
	 */
	actions: Actions<WorkerState>;

	/**
	 * Register new actions.
	 * @param newActions Object or callback function.
	 */
	registerActions(newActions: ActionRegister<WorkerState>): void;

	/**
	 * Queue all additional processing until unfrozen.
	 */
	freeze(): void;

	/**
	 * Remove a freeze lock and process queued work
	 */
	unfreeze(): void;
}

/**
 * Creates a WebWorker unistore instance.
 * @param initialState Initial state to populate.
 */
export default function createWorkerStore<WorkerState>(
	initialState: WorkerState
): WorkerStore<WorkerState>;
