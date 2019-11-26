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
  arrDir.map(slide => path.extname(slide) === '.psd' && arrPsd.push(slide))
  if (arrPsd.length === 0) {
    console.warn('\x1b[41m', "I don't see psd!")
    console.log('\x1b[0m')
    process.exit(1)
  }
  return arrPsd
}

const checkNameOfLay = (layer, file) => {
  if (layer.type === 'group') return layer.children.forEach(child => checkNameOfLay(child, file))
  else {
    //if have layer name="noref", it's mean noref in PSD
    if (layer.name.toLowerCase() === 'noref') return false
    if (layer.name.toLowerCase() === 'ref') {
      if (layer.text === undefined) throw `ref - is a graphic layer in ${file}.psd`
      haveAnyRef = true
      return writeRefToFile(layer, file)
    }
  }
}

const writeRefToFile = (layer, file) => {
  file = file.replace('.psd', '')
  const text = layer.text.value
  let strRef = text.replace(/\u0003/g, '</br>')
  strRef = strRef.split(/\r/g)
  if (
    text.search(/[А-Яа-я]\d\./gi) !== -1 ||
    text.search(/[А-Яа-я]\d-\d/gi) !== -1 ||
    text.search(/[А-Яа-я]\d,\d/gi) !== -1 ||
    text.search(/[A-Za-z]\d[A-Za-z]/gi) !== -1
  ) {
    console.warn('\x1b[35m', `Look in ${file}.psd maybe you find sup/sub-string in ref`)
    console.log('\x1b[0m')
  }
  strRef = strRef.filter(el => !!el.trim())
  if (arrRefs[file] === undefined) return (arrRefs[file] = strRef)
  else throw `dublicate reference ${file}.psd`
}

readDir()

arrPsd.map(file => {
  const psd = PSD.fromFile(`${callDir}/${file}`)
  psd.parse()
  const child = psd.tree().export().children
  child.some(layers => checkNameOfLay(layers, file))
  if (!haveAnyRef) console.warn('\x1b[35m', `I don't see REF layer! in ${file} \n`)
  else haveAnyRef = false
})

fs.writeFileSync(`${callDir}/refs.json`, JSON.stringify(arrRefs))
time = Date.now() / 1000 - time
console.log('Время выполнения = ', time.toFixed(2))
