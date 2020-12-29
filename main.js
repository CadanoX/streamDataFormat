document.addEventListener("DOMContentLoaded", function(event)
{
	// REMOVE THE FOLLOWING SLASH, TO SWITCH BETWEEN EXAMPLES
	/*
	let currentData =  data.gumtreeMin;
	let formattedData = transformGumtreeFormat(currentData);
	/*/
	let currentData =  data.visciousMin;
	//let currentData =  data.viscious;
	let formattedData = transformVisciousFormat(currentData);
	//*/

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