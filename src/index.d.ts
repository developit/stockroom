// K - Store state

import { Store } from "unistore";

export default function createStore<K>(worker: Worker): Store<K>;
