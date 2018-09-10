const PSD = require('psd')
const fs = require('fs')
const path = require('path')

const arrPsd = []
let time = Date.now() / 1000
let arrRefs = {}


const readDir = () => {
  // console.log(process.env.INIT_CWD, ' это короче место')
  console.log("Gotta Catch 'Em All")
  const arrDir = fs.readdirSync('./testPSD')
  arrDir.map(el => {
    const extName = path.extname(el)
    if (extName === '.psd') {
      arrPsd.push(el)
    }
  })
  if (arrPsd.length === 0) {
    console.warn("\x1b[41m", "I don't see psd!")
    console.log("")
    process.exit(1)
  }
  return arrPsd
}

const writeRefToFile = (el, file) => {
  file = file.toString().replace('.psd', '')
  const str = el.text.value.split(/\r/g)
  str.map((el, i) => {
    if (el === '') {
      str.splice(i, 1)
    }
  })
  arrRefs[file] = str
}


readDir()

arrPsd.map((file) => {
  const psd = PSD.fromFile(`./testPSD/${file}`)
  console.log(file)
  psd.parse()
  const child = psd.tree().export().children
  child.some(el => {
    if (el.type === 'group') {
      const arrChild = el.children
      arrChild.some(el => {
        if (el.name === 'ref') {
          writeRefToFile(el, file)
          return true
        }
      })
      return true
    } else {
      if (el.name === 'ref') {
        writeRefToFile(el, file)
        return true
      }
    }
  });
})
const json = JSON.stringify(arrRefs)

fs.writeFileSync('./refs.json', json)
time = Date.now() / 1000 - time;
console.log('Время выполнения = ', time.toFixed(2));