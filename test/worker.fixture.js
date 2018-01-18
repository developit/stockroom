import createStore from 'stockroom/worker';

let store = createStore({
	count: 1,
	obj: {
		a: 'b'
	}
});

let actionsCalled = [];

store.registerActions({
	increment({ count }) {
		actionsCalled.push(['increment', []]);
		return { count: count + 1 };
	},

	setValue(state, value) {
		actionsCalled.push(['setValue', [value]]);
		return {
			obj: {
				...state.obj,
				a: value
			}
		};
	}
});

export function getActions() {
	return actionsCalled;
}

export function getState() {
	return store.getState();
}