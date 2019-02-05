document.addEventListener("DOMContentLoaded", function(event)
{
	// REMOVE THE FOLLOWING SLASH, TO SWITCH BETWEEN EXAMPLES
	//*
	let currentData =  data.gumtreeMin;
	let formattedData = transformGumtreeFormat(currentData);
	/*/
	let currentData =  data.visciousMin;
	//let currentData =  data.viscious;
	let formattedData = transformVisciousFormat(currentData);
	//*/

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

	document.querySelector('#first pre').innerHTML = print(currentData);
	document.querySelector('#third pre').innerHTML = print(data.reference);
	document.querySelector('#second pre').innerHTML = print(formattedData);
});

function print(obj) {
	var cache = [];
	var returnString = JSON.stringify(obj, function(key, value) {
		if (typeof value === 'object' && value !== null) {
			if (cache.indexOf(value) !== -1) {
				// Duplicate reference found
				try {
					// If this value does not reference a parent it can be deduped
					return JSON.parse(JSON.stringify(value)) + "\n";
				} catch (error) {
					// discard key if value cannot be deduped
					return;
				}
			}
			// Store value in our collection
			cache.push(value);
		}
		return value;
	});
	cache = null; // Enable garbage collection
	if (!returnString) 
		return "";
	else
		return JSON.stringify(JSON.parse(returnString), null, 2);
}