function transformVisciousFormat(data)
{
	let format = { timesteps: []};
	for (t in data.EN)
	{
		currentTimestep = format.timesteps[t] = { deleted: {}, references: {}, tree: {} };
    }
    return format
}

function transformGumtreeFormat(data)
{
	// we use references instead of hierarchical ids
	// timesteps holds for each timestime the corresponding tree
	// reference keeps for each node its pointers to all timesteps where it exists
	let format = {timesteps: []};
	let idx = 0;
	let currentTimestep,
		previousTimestep;

	// Copy the trees for each timetep from input data to our data format
	let traverse = (src, dest) => {
		// we follow the  data's depth-first post-order traversal for assigning IDs
		dest.children = [];
		for (let i = 0; i < src.children.length; i++) {
			dest.children[i] = { parent: dest };
			traverse(src.children[i], dest.children[i]);
		}

		dest.id = idx;
		//currentTimestep.references[idx] = dest;
		idx++;
		dest.size = src.length;
		dest.pos = src.pos;
	};

	for (t in data.timesteps)
	{
		idx = 0;
		currentTimestep = format.timesteps[t] = { deleted: {}, references: {}, tree: {} };
		traverse(data.timesteps[t].root, currentTimestep.tree);
		/*
		if (t != 0) {
			previousTimestep = format.timesteps[t-1];

			// Find matching nodes
			for (match of data.changes[t-1].matches) {
				let prev = previousTimestep.references[match.src];
				currentTimestep.references[match.dest].prev = prev;
				prev.next = currentTimestep.references[match.dest];
			}

			// find added, deleted nodes
			for (action of data.changes[t-1].actions) {
				if (action.action == "delete")
					currentTimestep.deleted[action.tree] = previousTimestep.references[action.tree];
				
				//if (action.action == "insert") {
				//	currentTimestep.references[action.tree].insertAt = action.at;
				//}
			}
        }*/
    }

	return format;
}