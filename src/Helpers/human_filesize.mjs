"use strict";

/**
 * Converts a filesize into a human-readable string.
 * Ported from PHP: https://github.com/sbrl/Pepperminty-Wiki/blob/0a81c940c5803856db250b29f54658476bc81e21/core/05-functions.php#L57-L73
 * @see	http://php.net/manual/en/function.filesize.php#106569	The original source
 * @author	rommel
 * @author	Edited by Starbeamrainbowlabs
 * @param	{number}	bytes		The number of bytes to convert.
 * @param	{number}	decimals	The number of decimal places to preserve.
 * @return 	{string}	A human-readable filesize.
 */
function human_filesize(bytes, decimals = 2) {
	let sz = ["b", "kib", "mib", "gib", "tib", "pib", "eib", "yib", "zib"];
	let factor = Math.floor((bytes.toString().length - 1) / 3);
	let result = Math.round(bytes / (1024 ** factor), decimals);
	return result + sz[factor];
}

export default human_filesize;
