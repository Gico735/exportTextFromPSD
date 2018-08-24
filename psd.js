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


var allVisLayersArr = []

var addToUnvisArr = function (layers, path) {
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
}

var compsRunner = function (layers, path) {
  var comps = app.activeDocument.layerComps
  for (i = 0; i < comps.length; i++) {
    comps[i].apply()
    addToUnvisArr(layers, path)
  }
}

var layersDeleter = function (layers, path) {
  var i = 0;
  for (i = 0; i < layers.length ; i++) {
    if (layers[i].typename == "ArtLayer" && (allVisLayersArr.indexOf(layers[i].name)) == -1) {
      layers[i].remove();
      layersDeleter(app.activeDocument.layers, app.activeDocument);
      break;
    }
    if (layers[i].typename == "LayerSet" && layers[i].layers.length != 0) {
      layersDeleter(layers[i].layers, layers[i])
    }
    if (layers[i].typename == "LayerSet" && layers[i].layers.length == 0) {
      alert('nullll!')
    }
  }
}

var fullArrPusher = function (layers, path) {
  var i = 0;
  for (i = 0; i < layers.length; i++) {
    if (layers[i].allLocked == true) {
      layers[i].allLocked = false;
    }

    if (layers[i].typename == "ArtLayer") {
      allLayersArr.push(layers[i].name)
    }
    if (layers[i].typename == "LayerSet") {
      fullArrPusher(layers[i].layers, layers[i])
    }
  }
}

var renamer = function (layers, path) {
  var i = 0;
  for (i = 0; i < layers.length; i++) {
    if (layers[i].typename == "ArtLayer") {
      if (layers[i].name !== renamedArr[counter]) {
        layers[i].name = renamedArr[counter]
      }
      counter = ++counter
    }
    if (layers[i].typename == "LayerSet") {
      renamer(layers[i].layers, layers[i])
    }
  }
}

renamedArrGenerator = function (fullArr) {
  newFullArr = fullArr
  var i = 0;
  for (i = 0; i < fullArr.length; i++) {
    var item = fullArr[i];
    var index = i;
    var memArrIndex = []
    var j
    for (j = 0; j < fullArr.length; j++) {
      if (fullArr[j] == item && j != index) {
        memArrIndex.push(j)
      }
    }
    if (memArrIndex.length != 0) {
      var k = 0;
      for (k = 0; k < memArrIndex.length; k++) {
        var suffix = k + 1
        var renamedIndex = memArrIndex[k]
        newFullArr[renamedIndex] = item + "__dub__" + suffix
      }
    }
  }
  return newFullArr
}

var allLayersArr = []
fullArrPusher(app.activeDocument.layers, app.activeDocument)
var renamedArr = renamedArrGenerator(allLayersArr)
var counter = 0;
renamer(app.activeDocument.layers, app.activeDocument)
compsRunner(app.activeDocument.layers, app.activeDocument)
layersDeleter(app.activeDocument.layers, app.activeDocument)
alert('ok')