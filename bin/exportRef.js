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
  arrDir.map(el => {
    const extName = path.extname(el)
    if (extName === '.psd') {
      arrPsd.push(el)
    }
  })
  if (arrPsd.length === 0) {
    console.warn("\x1b[41m", "I don't see psd!")
    console.log("\x1b[0m")
    process.exit(1)
  }
  return arrPsd
}

const chakeNameOfLay = (el, file) => {
  if (el.type === 'group') {
    el.children.map(child => {
      return chakeNameOfLay(child, file)
    })
  } else {
    if (el.name.toLowerCase() === 'ref') {
      haveAnyRef = true
      return writeRefToFile(el, file)
    }
  }
}


const writeRefToFile = (el, file) => {
  file = file.replace('.psd', '')
  const text = el.text.value
  const strRef = text.split(/[\r\u0003]/g)
  if (text.search(/[А-Яа-я]\d\./gi) !== -1 ||
    text.search(/[А-Яа-я]\d-\d/gi) !== -1 ||
    text.search(/[А-Яа-я]\d,\d/gi) !== -1 ||
    text.search(/[A-Za-z]\d[A-Za-z]/gi) !== -1) {
    console.warn("\x1b[35m", "Look in PSD maybe you find sup/sub-string in ref")
    console.log("\x1b[0m")
  }
  strRef.map((el, i) => {
    if (el == '' || el == ' ') {
      strRef.splice(i, 1)
    }
  })
  return arrRefs[file] = strRef
}


readDir()

arrPsd.map((file) => {
  const psd = PSD.fromFile(`${callDir}/${file}`)
  console.log(file)
  psd.parse()
  const child = psd.tree().export().children
  child.some(layers => {
    return chakeNameOfLay(layers, file)
  })
  if (!haveAnyRef) {
    console.warn("\x1b[0m", "I don't see REF layer!")
    console.log("")
  } else {
    haveAnyRef = false
  }
})
const json = JSON.stringify(arrRefs)

fs.writeFileSync(`${callDir}/refs.json`, json)
time = Date.now() / 1000 - time
console.log('Время выполнения = ', time.toFixed(2))