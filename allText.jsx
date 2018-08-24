/*
 *
 * Export All Text Layers
 * 1.1.4
 * Pavel Ivanov
 * https://github.com/pivanov/photoshop-scripts
 *
 */

// enable double-clicking from Mac Finder or Windows Explorer
#target photoshop

// bring application forward for double-click events
app.bringToFront();

var doc = app.activeDocument;
var fileLineFeed = ($.os.search(/windows/i) != -1 ? "windows" : "macintosh");
var openFile = true; // Open file when done (true/false)

var separator = "====================================================================================================";
var semiColon = ';';

var progressWindow = createProgressWindow("Please wait...");
var progressStep = Math.round(100 / doc.layers.length);

var data = [];
var count;

function init() {

  // do we have open document?
  if (app.documents.length === 0) {
    alert("Please open a file", "TextExport Error", true);
    return;
  }

  // open the progress
  progressWindow.show();

  ExportText(doc);

  // close the progress
  progressWindow.close();

  saveResults();
}


function ExportText(el) {

  alert(el.name)

  if (el.name == 'SRC') {
    alert('alyo Yuba')
  }
  // Get the layers
  var layers = el.layers;

  // get layer lenght
  var count = layers.length;


  for (var i = 0; i < count; i++) {

    // curentLayer
    var currentLayer = layers[i];

    if (currentLayer.typename == "LayerSet" && currentLayer.name == "SRC") {
      ExportText(currentLayer);
    } else {
      // alert(currentLayer.name)
      if (currentLayer.name == "ref") {

        // is Text layer visible
        if (currentLayer.kind == LayerKind.TEXT && currentLayer.textItem.contents) {

          doc.activeLayer = currentLayer;

          // font-size
          try {
            var fontSize = parseInt(currentLayer.textItem.size);
          } catch (e) {
            ;
          }


          // color
          try {
            var color = currentLayer.textItem.color.rgb.hexValue;
          } catch (e) {
            var color = '000000';
          }

          // font-family
          try {
            var fontFamily = currentLayer.textItem.font;
          } catch (e) {
            ;
          }

          // font-style
          try {
            var fontStyle = currentLayer.textItem.fauxItalic;
          } catch (e) {
            var fontStyle = false;
          }

          // font-weight
          try {
            var fontWeight = currentLayer.textItem.fauxBold;
          } catch (e) {
            var fontWeight = false;
          }

          // check for fontFamily.style
          try {
            var fontFamilyStyle = app.fonts.getByName(fontFamily).style;
          } catch (e) {
            ;
          }

          // text-transform
          try {
            var textTransform = currentLayer.textItem.capitalization;
            if (textTransform && textTransform != 'TextCase.NORMAL') {
              var textTransform = true;
            }
          } catch (e) {
            var textTransform = false;
          }

          // letter-spacing
          try {
            var letterSpacing = currentLayer.textItem.tracking;
          } catch (e) {
            var letterSpacing = 0;
          }

          if (letterSpacing != 0) {
            var letterSpacing = ((letterSpacing * fontSize) / 1000);
          }

          // line-height
          try {
            var lineHeight = parseInt(currentLayer.textItem.leading);
          }
          catch (e) {
            var lineHeight = 0;
          };

          // check for fontExist
          try {
            var fontExist = app.fonts.getByName(fontFamily).name;
          } catch (e) {
            var fontExist = false;
          }

          if (fontExist) {
            var fontFamily = fontExist;
          }

          var opacity = currentLayer.opacity;
          var fillOpacity = currentLayer.fillOpacity;
          var effects = activeLayerHasEffects();


          var obj = {
            content: currentLayer.textItem.contents,
            fontSize: fontSize / 10, // from px/pt to rem,
            color: '#' + color.toLowerCase(),
            fontFamily: fontFamily,
            fontExist: fontExist,
            fontStyle: fontStyle,
            fontWeight: fontWeight,
            fontFamilyStyle: fontFamilyStyle,
            textTransform: textTransform,
            letterSpacing: letterSpacing / 10, // calculate to rem
            lineHeight: lineHeight / 10, // from px/pt to rem
            opacity: opacity,
            fillOpacity: fillOpacity,
            effects: effects
          };

          data.push(obj);
        }
      }
    }

    // Update progress bar value
    progressWindow.bar.value = (100 / (progressStep / i));

  }
}

// get Descriptor
function getDescriptor(psClass, psKey) { // integer:Class, integer:key
  var ref = new ActionReference();
  if (psKey != undefined) ref.putProperty(charIDToTypeID("Prpr"), psKey);
  ref.putEnumerated(psClass, charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
  return executeActionGet(ref);
};

// check layer for effects
function activeLayerHasEffects() {
  var hasEffect = getDescriptor(charIDToTypeID('Lyr ')).hasKey(stringIDToTypeID('layerEffects'));
  return hasEffect;
};

// progress bar
function createProgressWindow(title, message, min, max) {
  var win;
  win = new Window('palette', title);
  win.bar = win.add('progressbar', undefined, min, max);
  win.bar.preferredSize = [180, 18];
  return win;
};

// Save the Results
function saveResults() {
  // save dialog
  var file = File.saveDialog("Please select a file to save the results");

  // if file is not selected
  if (file == null) {
    return;
  }

  // set filePath
  var filePath = file.path + "/" + file.name;

  // create outputFile
  var outputFile = new File(filePath);

  // set linefeed
  outputFile.linefeed = fileLineFeed;

  // open for write
  outputFile.open("w", "TEXT", "????");

  // Append title of document to file
  outputFile.writeln(separator);
  outputFile.writeln('All visible Text Layers from "' + doc.name + '"');
  outputFile.writeln(separator);

  // put data to file
  for (var i = 0; i < data.length; i++) {
    var object = data[i];

    outputFile.writeln('content' + ': ' + object.content + '\n');

    outputFile.writeln('font-size' + ': ' + object.fontSize + 'rem' + semiColon);
    outputFile.writeln('color' + ': ' + object.color + semiColon);
    outputFile.writeln('font-family' + ': ' + object.fontFamily + semiColon);

    if (object.fontStyle) {
      outputFile.writeln('font-style: italic' + semiColon + ' /* fauxItalic */');
    }

    if (object.fontWeight) {
      outputFile.writeln('font-weight: 700' + semiColon + ' /* fauxBold */');
    }

    if (object.textTransform) {
      outputFile.writeln('text-transform: uppercase' + semiColon);
    }

    if (object.letterSpacing != 0) {
      outputFile.writeln('letter-spacing' + ': ' + object.letterSpacing + 'rem' + semiColon);
    }

    if (object.lineHeight != 0) {
      outputFile.writeln('line-height' + ': ' + object.lineHeight + 'rem' + semiColon);
    }

    outputFile.writeln('');

    if (object.fontExist) {
      outputFile.writeln('* Important' + ': ' + 'Font Family Style is "' + object.fontFamilyStyle + '"');
    } else {
      outputFile.writeln('* Important' + ': ' + 'The following font is missing: ' + object.fontFamily);
    }

    if (object.effects) {
      outputFile.writeln('* Important: This layer have some Blending Options');
    }

    if (object.opacity != '100' || object.fillOpacity != '100') {
      outputFile.writeln('* Important: This layer have ' + '"Opacity: ' + Math.round(object.opacity) + '%" and "' + 'Fill: ' + object.fillOpacity + '%"');
    }

    outputFile.writeln('');
    outputFile.writeln(separator);
  }

  // close the file
  outputFile.close();

  // Give notice that we're done or open the file
  if (openFile === true) {
    outputFile.execute();
  } else {
    alert("File was saved to:\n" + Folder.decode(filePath), "TextExport");
  }

}

init();