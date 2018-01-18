import createStore from 'stockroom/worker';

let store = createStore({
	count: 0,
	spamming: false,
	spams: []
});

const actions = store => ({
	increment: ({ count }) => ({ count: count + 1 }),

	spam(state, { duration=5000, interval=100 }={}) {
		let start = Date.now();
		clearInterval(state.timer);
		let spams = [];
		let count = 0;
		let timer = setInterval( () => {
			let now = Date.now();
			if (now-start > duration) {
				clearInterval(timer);
				return store.setState({ timer: null, spamming: false });
			}
			spams = spams.concat({
				message: `Spam #${++count}.`,
				time: Date.now()
			});
			store.setState({ spams });
		}, interval);
		return { timer, spamming: true, spams };
	},

	haltSpam({ timer }) {
		clearInterval(timer);
		return { timer: null, spamming: false, spams: [] };
	}
});

store.registerActions(actions);

// used for stockroom/inline as a fallback:
export default store;
