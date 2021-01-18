"use strict";

/**
 * Convenience function for calculating the percentage betwween 2 given values.
 * @param	{Number}	count_so_far	The fractional part (e.g. items done so far)
 * @param	{Number}	total			The total part (e.g. the total number of items to do)
 * @param	{Number}	[range=100]		The range to transform to (default: 100)
 * @return	{Number}	The calculated percentage.
 */
function percentage(count_so_far, total, range=100) {
	if(count_so_far == 0) return 0;
	return (count_so_far/total)*range;
}

/**
 * Converts the given array of boundaries to an array of class objects.
 * @source PhD-Code - common/ai/ModelHelper.mjs
 * @param	{Number[]}	bounds			The bounds to convert.
 * @return	{{min:Number,max:Number}[]}	An array of objects that representa single class each, with min / max values for each class.
 */
function bounds2classes(bounds) {
	if(bounds.length < 2)
		throw new Exception(`Error: Not enough bounds supplied (got ${bounds.length}, but expected at least 2)`);
	
	let result = [];
	result.push({ min: -Infinity, max: bounds[0] });
	for(let i = 1; i < bounds.length; i++) {
		result.push({ min: bounds[i - 1], max: bounds[i] });
	}
	result.push({ min: bounds[bounds.length - 1], max: Infinity });
	return result;
}

export { percentage, bounds2classes };
