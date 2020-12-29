

/* Explanation of the Viscious data format:
	- "N" holds all nodes which exist throughout the whole time series
		- node labels can be given in letters or numbers
		- "l" describes the depth of the node in the tree
		- "t" is the timestep in which the node exists
		- "w" is the width (size) of the node (if not given, all nodes are equal in size)
	- "EN" holds the edges between nodes for the given timestep
		- the timesteps are given from 0 to t-1
		- each timestep holds a number of labels (representing one node)
		- each of these labels has an array of labels, it connects to (their children)
	- based on "N" and "EN" we can build a tree for each timestep
		- e.g. nodes "A", "B" and "C" form a tree at timestep 0
			- "C" is the root at depth 0 with 1 child "B", which has 1 child "A"
			- "EN" therefore holds the edges from "C" to "B" and "B" to "A"
	- "ET" describes the evolution nodes across timesteps
		- each object in ET is a stream, describing which node evolved into which node (independent of timesteps)
		- e.g. node "C" in timestep 0 became node "G" in timestep 1, which split into 2 nodes "J" and "K" in timestep 2

*/
function transformVisciousFormat(data)
{
	// init
	let format = { timesteps: []};
	for (let t in data.EN) {
		format.timesteps[t] = {
			deleted: {},
			references: {},
			tree: {
				id: "fakeRoot",
				children: []
			}
		};
	}

	for (let t in data.EN) {
		let time = format.timesteps[t];
		let next = format.timesteps[Number(t)+1];
		time.references["fakeRoot"] = time.tree;
		if (next) {
			time.tree.next = [ next.tree ];
			next.tree.prev = [ time.tree ];
		}
	}

	// add all nodes to references
	for (let id in data.N) {
		let node = data.N[id];
		let ref = format.timesteps[node.t].references[id] = { id: id };
		if (node.l == 0) // add roots to fakeRoot
			format.timesteps[node.t].tree.children.push(ref)
	}

	// build tree structure
	for (let t in data.EN) {
		let currentTimestep = format.timesteps[t];

		/*// set tree root
		let nodes = Object.keys(data.EN[t]);
		let last = nodes[nodes.length-1];
		currentTimestep.tree = currentTimestep.references[last];
		*/

		// connect all children
		for (let id in data.EN[t]) {
			let node = currentTimestep.references[id];
			let childArray = data.EN[t][id];
			if (childArray.length > 0)
				node.children = [];
			for (let child of childArray)
				node.children.push(currentTimestep.references[child])
		}
	}

	// set prev, next nodes
	for (let stream in data.ET) {
		for (let nodeId in data.ET[stream]) {
			let t = data.N[nodeId].t;
			let node = format.timesteps[t].references[nodeId];

			for (let nextId of data.ET[stream][nodeId]) {
				let next = format.timesteps[Number(t)+1].references[nextId];
				if (!node.next)
					node.next = [];
				node.next.push(next)

				if (!next.prev)
					next.prev = [];
				next.prev.push(node)
			}
		}

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