#!/usr/bin/env node
const PSD = require('psd')
const fs = require('fs')
const path = require('path')

const arrPsd = []
const callDir = process.env.PWD
let time = Date.now() / 1000
let arrRefs = {}
let haveAnyRef = false

const readDir = () => {
  console.log("Gotta Catch 'Em All")
  const arrDir = fs.readdirSync(callDir)
  arrDir.map(slide => {
    const extName = path.extname(slide)
    if (extName === '.psd') {
      arrPsd.push(slide)
    }
  })
  if (arrPsd.length === 0) {
    console.warn('\x1b[41m', "I don't see psd!")
    console.log('\x1b[0m')
    process.exit(1)
  }
  return arrPsd
}

const checkNameOfLay = (layer, file) => {
  if (layer.type === 'group') {
    if (layer.name.toLowerCase() === 'references') {
      haveAnyRef = true
      const refs = layer.children
        .map(
          child =>
            child.text !== undefined &&
            child.text.value.trim().split(/[\r\u0003]/g)
        )
        .flat()
        .filter(el => el)
        .map(str => {
          if (str === 'Литература')
            return `<span class='title'>Литература</span>`
          if (str === 'Дизайн исследования')
            return `<span class='title'>Дизайн исследования</span>`
          if (str === 'Список сокращений')
            return `<span class='title'>Список сокращений</span>`
          if (str === 'Сокращения')
            return `<span class='title'>Сокращения</span>`
          if (str === 'Сноски') return `<span class='title'>Сноски</span>`
          return str
        })
        .join('<br/>')
      const fileName = file.replace('.psd', '')
      if (arrRefs[fileName] === undefined) return (arrRefs[fileName] = refs)
      else throw `dublicate reference ${fileName}.psd`
    } else return layer.children.forEach(child => checkNameOfLay(child, file))
  }
}

readDir()

arrPsd.map(file => {
  const psd = PSD.fromFile(`${callDir}/${file}`)
  psd.parse()
  const child = psd.tree().export().children
  child.some(layers => {
    return checkNameOfLay(layers, file)
  })
  if (!haveAnyRef) {
    console.warn('\x1b[35m', `I don't see REF layer! in ${file}`)
    console.log('')
  } else haveAnyRef = false
})
const json = JSON.stringify(arrRefs)

fs.writeFileSync(`${callDir}/refs.json`, json)
time = Date.now() / 1000 - time
console.log('Время выполнения = ', time.toFixed(2))
