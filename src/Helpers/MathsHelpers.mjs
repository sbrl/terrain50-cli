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

export { percentage };
