"use strict";

import chroma from 'chroma-js';
import encode from 'image-encode';

import l from '../../Helpers/Log.mjs';

class Terrain50Renderer {
	constructor(in_scale_factor, in_domain = "auto") {
		this.colour_domain = in_domain;
		this.scale_factor = in_scale_factor;
		this.colour_scale = chroma.scale([
			"#333333",
			// chroma("white").alpha(0),
			// "green"
			"#efefef",
		]).mode('lrgb');
		this.colour_nodata = chroma("#f97153").rgba();
		
		thiis.colour_scale_classes = chroma.scale([
			"#00ff00",
			"#ff0000"
		]);
	}

	/**
	 * Actually does the rendering, returning a canvas with the image rendered 
	 * onto it.
	 * You probably want the .render() method, which returns a buffer 
	 * containing a png-encoded image.
	 * @param	{Terrain50}	terrain	The Terrain50 object instance to render.
	 * @param	{{min:number,max:number}[]}	classes	The classes to bin the values into. If not specified, values are not binned into classes. Warning: Values *must* fit into a bin. It is recommended to use -Infinity and Infinity in the first and last bins.
	 * @return	{ArrayBuffer}	A canvas with the image rendered on it.
	 */
	async do_render(terrain, classes = null) {
		let colour_domain = null;
		if(this.colour_domain === "auto") {
			let min = terrain.min_value, max = terrain.max_value;
			colour_domain = this.colour_scale.domain([
				min, max
			]);
			l.log(`[Terrain50Renderer] Automatic colour domain: ${min} - ${max}`);
		}
		else {
			colour_domain = this.colour_scale.domain(this.colour_domain);
			l.log(`[Terrain50Renderer] Static colour domain: ${this.colour_domain[0]} - ${this.colour_domain[1]}`);
		}
		
		if(classes != null)
			colour_domain = this.colour_scale_classes.domain([
				0, classes.length
			]);
	
		let width = Math.floor(terrain.meta.ncols / this.scale_factor),
			height = Math.floor(terrain.meta.nrows / this.scale_factor);
	
		l.log(`[Terrain50Renderer] Dimensions: ${width}x${height}`);
	
		// Create the image
		let pixels = new ArrayBuffer(width * height * 4);
		let view8 = new Uint8ClampedArray(pixels),
			view32 = new Uint32Array(pixels); // For image generation by us
		// let view32 = new Uint32Array(img.bitmap.data);
	
		let count = 0;
		for(let y = 0; y < height*this.scale_factor; y += this.scale_factor) {
			for(let x = 0; x < width*this.scale_factor; x += this.scale_factor) {
				// l.debug(`Processing (${x}, ${y})`)
				
				let a_y = Math.floor(y / this.scale_factor),
					a_x = Math.floor(x / this.scale_factor);
				
				// chroma.js clamps automagically :D
				let colour = this.colour_nodata;
				if(typeof terrain.data[a_y] !== "undefined" &&
					terrain.data[a_y][a_x] !== terrain.meta.NODATA_value) {
					
					if(classes == null) {
						colour = colour_domain(
							terrain.data[a_y][a_x]
						).rgba(); // 0: r, 1: g, 2: b, a: 3
					}
					else {
						for(let i in classes) {
							if(terrain.data[a_y][a_x] >= classes[i].min && terrain.data[a_y][a_x] < classes[i].max) {
								colour = colour_domain(i).rgba(); // 0: r, 1: g, 2: b, a: 3
							}
						}
					}
				}
				
				// colour = chroma("red").rgba();
				colour[3] = Math.floor(colour[3] * 255); // Scale the alpha value from 0-1 to 0-255
				
				if(colour[3] < 1) console.log(`(${x}, ${y})`, colour);
				
				// img.bitmap.data[a_y*width + a_x + 0] = colour[0];
				// img.bitmap.data[a_y*width + a_x + 1] = colour[1];
				// img.bitmap.data[a_y*width + a_x + 2] = colour[2];
				// img.bitmap.data[a_y*width + a_x + 3] = colour[3];
				view32[count] = 
					(colour[3] << 24) |	// a
					(colour[2] << 16) |	// b
					(colour[1] << 8) |	// g
					colour[0];			// r
				// img.bitmap.data[a_y*width + a_x] = 
				// 	(colour[0] << 24) |	// r
				// 	(colour[1] << 16) |	// g
				// 	(colour[2] << 8) |	// b
				// 	colour[3];			// a
	
				// console.log(`(${x}, ${y}) -> (${a_x}, ${a_y}) @  SF ${this.scale_factor}`, terrain.data[y][x], colour);
				count++;
			}
		}
		
		l.log(`Written to ${count} pixels (${view32.length} present, ${((count/(width*height))*100).toFixed(2)}%)`);
		console.log(view8);
		return view8;
	}

	/**
	 * Renders the given Terrain50 object to an image.
	 * Returns a buffer containing a PNG-encoded image, which is ready to be
	 * written to disk for example.
	 * @param	{Terrain50}		terrain	The terrain object to render.
	 * @param	{{min:number,max:number}[]}	classes	The classes to bin the values into. If not specified, values are not binned into classes. Warning: Values *must* fit into a bin. It is recommended to use -Infinity and Infinity in the first and last bins.
	 * @return	{Buffer}	The terrain object as a png, represented as a buffer.
	 */
	async render(terrain, classes = null) {
		let width = Math.floor(terrain.meta.ncols / this.scale_factor),
			height = Math.floor(terrain.meta.nrows / this.scale_factor);
		
		let result = await this.do_render(terrain, classes);
		return Buffer.from(encode(result, [ width, height ], "png"));
	}
}

export default Terrain50Renderer;
