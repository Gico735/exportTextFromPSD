const PSD = require('psd');
const fs = require('fs')
const path = require('path')
let time = Date.now() / 1000;


const writeRefToFile = (el, file) => {
  file = file.toString().replace('.psd', '')
  const str = el.text.value.split(/\r/g)
  str.map((el, i) => {
    if (el === '') {
      str.splice(i, 1)
    }
  })
  arr[file] = str
}

const checkThisOut = () => {
  // console.log(process.env.INIT_CWD, ' это короче место')
  arrPsd.some(file => {
    const extName = path.extname(file)
    if (extName !== '.psd') {
      console.warn("\x1b[41m", "I don't see psd!")
      process.exit(1)
    }
  })
}

console.log("Gotta Catch 'Em All")
const arrPsd = fs.readdirSync('./testPSD')
// checkThisOut()
let arr = {}

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
console.log(arr)
const json = JSON.stringify(arr)

fs.writeFileSync('./refs.json', json)
time = Date.now() / 1000 - time;
console.log('Время выполнения = ', time.toFixed(2));