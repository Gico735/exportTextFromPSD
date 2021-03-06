const PSD = require("../../lib");
const fs = require('fs')
const path = require('path')

const toFlat = ([x, ...xs]) => (!!x ? (Array.isArray(x) ? [...toFlat(x), ...toFlat(xs)] : [x, ...toFlat(xs)]) : [])

const getAllPSDFromCallDir = (callDir) => {
  console.log("Gotta Catch 'Em All")
  const arrDir = fs.readdirSync(callDir)
  const psdDir = arrDir.map((slide) => path.extname(slide) === '.psd' && slide).filter((el) => el)
  if (psdDir.length === 0) {
    console.warn('\x1b[41m', "I don't see psd!")
    console.log('\x1b[0m')
    process.exit(1)
  }
  return psdDir
}
/**
 * @param {Object} layer Layer From PSD
 * @param {String} file Name of file
 * @param {Function} checkFunc function to check layer of valid, must return Boolean
 * @param {Function} saveFunc function to save res if layer Valid, must return Object with:{filename:res}
 */
function checkNameLayerAndSave(layer, file, checkFunc, saveFunc, whatNeed) {
  if (whatNeed === 'ref' && layer.name.toLowerCase() === 'noref') return false
  const isValidLayer = checkFunc(layer, file)
  if (isValidLayer) return saveFunc(layer, file)
  if (layer.type === 'group') {
    const arr = layer.children.map((child) => checkNameLayerAndSave(child, file, checkFunc, saveFunc))
    return toFlat(arr).filter((el) => el)
  }
  //if layer not valid and is not a group
  return []
}

const timer = {
  timeStart: null,
  start: () => (this.timeStart = Date.now() / 1000),
  end: () => (Date.now() / 1000 - this.timeStart).toFixed(2),
}
/**
 * @param {String} whatNeed info of what you need to find
 * @param {Function} checkFunc function to check layer of valid, must return Boolean
 * @param {Function} saveFunc function to save res if layer Valid, must return Object with:{filename:res}
 */
function main(checkFunc, saveFunc, whatNeed = 'ref') {
  timer.start()
  const callDir = process.cwd()
  const psdArr = getAllPSDFromCallDir(callDir)
  let refsObj = {}
  psdArr.forEach((file) => {
    const psd = PSD.fromFile(`${callDir}/${file}`)
    psd.parse()
    const children = psd.tree().export().children
    file = file.replace('.psd', '')
    for (const layer of children) {
      let ref = checkNameLayerAndSave(layer, file, checkFunc, saveFunc, whatNeed)
      // if some layer has name "noref",then go to next file
      if (typeof ref === 'boolean' && ref === false) return
      if (ref.length !== 0) {
        if (refsObj[file]) {
          console.warn('\x1b[41m', `dublicate ${whatNeed} in ${file}`)
          console.log('\x1b[0m')
          return false
        } else refsObj = { ...refsObj, [file]: ref }
      }
    }
    if (!Object.keys(refsObj).length) {
      console.warn('\x1b[35m', `I don't see ${whatNeed} layer! in ${file}\n`)
      console.log('\x1b[0m')
    }
  })
  fs.writeFileSync(`${callDir}/${whatNeed}.json`, JSON.stringify(refsObj))
  return console.log('Время выполнения = ', timer.end())
}

module.exports = main
