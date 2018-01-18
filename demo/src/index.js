import './style.css';
import { Component } from 'preact';
import { Provider, connect } from 'unistore/preact';
import Button from 'preact-material-components/Button';
import LinearProgress from 'preact-material-components/LinearProgress';
import store from './store';


@connect('spamming,spams', {
	start: 'spam',
	stop: 'haltSpam',
	// example of an action creator (note: only the creation happens on the main thread)
	goInsane() {
		return { type: 'spam', payload: { duration: 10000, interval: 1 } };
	}
})
class PerformanceDemo extends Component {
	renderSpam = spam => (
		<div class="spam">
			{spam.message}
		</div>
	);

	render({ spamming, spams=[], start, stop, goInsane }) {
		let offset = Math.max(0, spams.length - 10);
		let visible = spams.slice(offset).reverse();
		return (
			<div class="demo perf">
				<h2>Performance Demo:</h2>
				<header>
					<Button raised ripple onClick={stop} disabled={!spamming}>Stop Spamming</Button>
					<Button raised ripple onClick={start} disabled={spamming}>Start Spamming</Button>
					<Button raised ripple onClick={goInsane} disabled={spamming}>Go Insane!</Button>
				</header>
				<LinearProgress progress={(spams.length/2500).toFixed(2)} />

				<h3>Last 10 of {spams.length} messages:</h3>
				<div class="spams">
					{visible.map(this.renderSpam)}
				</div>
			</div>
		);
	}
}


/** Example connected Pure Functional Component */
const CountDemo = connect('count', {
	// shorthand action creator to invoke "increment":
	increment: 'increment',

	// "inline" action: runs on the main thread!
	reset() {
		return { count: 0 };
	}
})( ({ count, increment, reset }) => (
	<div class="demo count">
		<h2>Counter Demo:</h2>
		<h3>Count: {count}</h3>
		<Button raised ripple onClick={increment}>Increment</Button>
		<Button raised ripple onClick={reset}>Reset</Button>
	</div>
));


export default () => (
	<Provider store={store}>
		<div class="app">
			<header class="masthead">
				<img src="/assets/stockroom.svg" />
				<h1>Stockroom</h1>
				<a class="github" href="https://github.com/developit/stockroom" target="_blank" rel="noopener noreferrer">Star on Github</a>
			</header>
			<CountDemo />
			<PerformanceDemo />
		</div>
	</Provider>
);
