/*****************************************************************
 *
 * TextConvert.Export 1.1 - by Bramus! - https://www.bram.us/
 *
 * v 1.1 - 2016.02.17 - UTF-8 support
 *                      Update license to MIT License
 *
 * v 1.0 - 2008.10.30 - (based upon TextExport 1.3, without the "save dialog" option)
 *
 *****************************************************************
 *
 * Copyright (c) 2016 Bram(us) Van Damme - https://www.bram.us/
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is furnished
 * to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 *****************************************************************/

/**
 *  TextConvert.Export Init function
 * -------------------------------------------------------------
 */

if (!Array.prototype.indexOf) {
	Array.prototype.indexOf = function (searchElement, fromIndex) {
		var k;
		if (this == null) {
			throw new TypeError('"this" is null or not defined');
		}
		var O = Object(this);

		var len = O.length >>> 0;
		if (len === 0) {
			return -1;
		}
		var n = +fromIndex || 0;
		if (Math.abs(n) === Infinity) {
			n = 0;
		}
		if (n >= len) {
			return -1;
		}
		k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

		while (k < len) {
			if (k in O && O[k] === searchElement) {
				return k;
			}
			k++;
		}
		return -1;
	};
}


function initTextConvertExport() {


	// Linefeed shizzle
	if ($.os.search(/windows/i) != -1)
		fileLineFeed = "windows";
	else
		fileLineFeed = "macintosh";

	// Do we have a document open?
	if (app.documents.length === 0) {
		alert("Please open a file", "TextConvert.Export Error", true);
		return;
	}

	// Oh, we have more than one document open!
	if (app.documents.length > 1) {

		var runMultiple = confirm("TextConvert.Export has detected Multiple Files.\nDo you wish to run TextConvert.Export on all opened files?", true, "TextConvert.Export");

		if (runMultiple === true) {
			docs = app.documents;
		} else {
			docs = [app.activeDocument];
		}

		// Only one document open
	} else {

		runMultiple = false;
		docs = [app.activeDocument];

	}

	// Loop all documents
	for (var i = 0; i < docs.length; i++) {

		// Auto set filePath and fileName
		filePath = Folder.myDocuments + '/TextConvert-' + docs[i].name + '.txt';

		// create outfile
		var fileOut = new File(filePath);

		// set linefeed
		fileOut.linefeed = fileLineFeed;

		// Set encoding
		fileOut.encoding = "UTF8"

		// open for write
		fileOut.open("w", "TEXT", "????");

		// Set active document
		app.activeDocument = docs[i];

		// call to the core with the current document
		goTextExport2(app.activeDocument, fileOut, '/');

		// close the file
		fileOut.close();

	}

	// Post processing: give notice (multiple) or open file (single)
	if (runMultiple === true) {
		alert("Parsed " + documents.length + " files;\nFiles were saved in your documents folder", "TextExport");
	} else {
		fileOut.execute();
	}

}


/**
 * TextExport Core Function (V2)
 * -------------------------------------------------------------
*/

function goTextExport2(el, fileOut, path) {
	// el.layerComps.prototype.length = Array.prototype.length

	// var layerCompsArr = el.layerComps;
	// var i = 0;
	// try {
	// 	while (layerCompsArr[i]) {
	// 		i++;
	// 	}
	// } catch (error) {
	// 	alert(' asd')
	// }
	alert(el)
	// i--;
	// // Get the layers
	var layers = el.layers;

	// // for (var compsIndex = layerCompsArr.length; compsIndex > 0; compsIndex--) {
	// // alert(compsIndex)
	// // alert(layers.length)
	// alert(layerCompsArr);
	// var compRef = el.layerComps[i];
	// // if ( .selectionOnly && !compRef.selected) continue; // selected only
	// compRef.apply();



	var addToUnvisArr = function (layers, path) {
		var allVisLayersArr = [];
		var i = 0;
		for (i = 0; i < layers.length; i++) {

			if (layers[i].typename == "ArtLayer" && layers[i].visible == true) {
				if (allVisLayersArr.indexOf(layers[i].name) == -1) {
					allVisLayersArr.push(layers[i].name)
				}
			}
			if (layers[i].typename == "LayerSet") {
				addToUnvisArr(layers[i].layers, layers[i]);
			}
		}
		alert(allVisLayersArr)
	}
	// Loop 'm

	addToUnvisArr(layers)
	for (var layerIndex = layers.length; layerIndex > 0; layerIndex--) {

		// curentLayer ref
		var currentLayer = layers[layerIndex - 1];

		// currentLayer is a LayerSet
		if (currentLayer.typename == "LayerSet") {

			goTextExport2(currentLayer, fileOut, path + currentLayer.name + '/');

			// currentLayer is not a LayerSet
		} else {

			// Layer is visible and Text --> we can haz copy paste!
			if ((currentLayer.visible) && (currentLayer.kind == LayerKind.TEXT)) {
				fileOut.writeln('');
				fileOut.writeln('');
				fileOut.writeln('');
				fileOut.writeln('');
				fileOut.writeln('[BEGIN ' + path + currentLayer.name + ' ]');
				fileOut.writeln(currentLayer.textItem.contents);
				fileOut.writeln('[END ' + path + currentLayer.name + ' ]');
			}
		}


		// }

	}



}


/**
 *  TextConvert.Export Boot her up
 * -------------------------------------------------------------
 */

initTextConvertExport();