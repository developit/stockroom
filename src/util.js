export function assign(obj, props) {
	for (let i in props) obj[i] = props[i];
	return obj;
}


export function applyUpdate(state, update) {
	if (Array.isArray(state)) {
		state = state.slice(0, update.length);
		for (let i=0; i<update.length; i++) {
			if (update[i]!==undefined) {
				state[i] = applyOne(update[i], state[i]);
			}
		}
	}
	else {
		state = assign({}, state);
		for (let i in update) if (update.hasOwnProperty(i)) {
			if (update[i]===undefined) {
				delete state[i];
			}
			else {
				state[i] = applyOne(update[i], state[i]);
			}
		}
	}
	return state;
}

function applyOne(obj, prev) {
	if (prev!=null && obj!=null && typeof prev==='object' && typeof obj==='object') {
		return applyUpdate(prev, obj);
	}
	return obj;
}


export function diff(obj, prev) {
	let update, i;
	if (Array.isArray(obj)) {
		update = new Array(obj.length);
		for (i=0; i<obj.length; i++) {
			if (obj[i]!==prev[i]) {
				update[i] = diffOne(obj[i], prev[i]);
			}
		}
	}
	else {
		update = {};
		for (i in obj) {
			if (obj.hasOwnProperty(i) && obj[i]!==prev[i]) {
				update[i] = diffOne(obj[i], prev[i]);
			}
		}
	}
	return update;
}

function diffOne(obj, prev) {
	if (obj!=null && prev!=null && typeof obj==='object' && typeof prev==='object') {
		return diff(obj, prev);
	}
	return obj;
}

