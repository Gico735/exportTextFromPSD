const PSD = require('psd');
const fs = require('fs')
let time = Date.now() / 1000;

console.log("Gotta Catch 'Em All")
const arrPsd = fs.readdirSync('./testPSD')
let arr = {}

arrPsd.map((file) => {
  const psd = PSD.fromFile(`./testPSD/${file}`)
  console.log(file)
  psd.parse()
  const child = psd.tree().export().children
  child.some(el => {
    if (el.name === 'SRC') {
      const arrChild = el.children
      arrChild.some(el => {
        if (el.name === 'ref') {
          file = file.toString().replace('.psd', '')
          const str = el.text.value.replace(/\r/g, ' ')
          arr[file] = str
          return true
        }
      })
    }
  });
})
const json = JSON.stringify(arr)

fs.writeFileSync('./refs.json', json)
time = Date.now() / 1000 - time;
console.log('Время выполнения = ', time.toFixed(2));