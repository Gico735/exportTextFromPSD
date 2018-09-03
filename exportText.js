const PSD = require('psd');
const fs = require('fs')
let time = Date.now() / 1000;

const arrPsd = fs.readdirSync('./testPSD')
let arr = {}

arrPsd.map((file) => {
  
  const psd = PSD.fromFile(`./testPSD/${file}`)
  psd.parse()
  const child = psd.tree().export().children
  child.forEach(el => {
    if (el.name === 'SRC') {
      const arrChild = el.children
      arrChild.forEach(el => {
        // парсинг без разделения строк
        // if (el.name === 'ref') {
        //   file = file.toString().replace('.psd', '')
        //   const str = el.text.value.replace(/\r/g, ' ')
        //   arr[file] = str
        // }

        // парсинг переносом строки
        // TODO:
          // вырезать в конце теги BR
        // if (el.name === 'ref') {
        //   file = file.toString().replace('.psd', '')
        //   const str = el.text.value.replace(/\r/g, '<br>')
        //   arr[file] = str
        // }

        
        // парсинг c разделением на подобъекты
        if (el.name === 'ref') {
          file = file.toString().replace('.psd', '')
          const str = el.text.value.split(/\r/g)
          arr[file] = str
        }
      })
    }
  });
})

const json = JSON.stringify(arr)

fs.writeFileSync('./refs.json', json)
time = Date.now() / 1000 - time;
console.log('Время выполнения = ', time.toFixed(2));