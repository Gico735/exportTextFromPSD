#!/usr/bin/env node
const main = require('./exportFromPSD/exportFromPSD')

const checkSubStr = (text, file) => {
  if (
    text.search(/[А-Яа-я]\d\./gi) !== -1 ||
    text.search(/[А-Яа-я]\d-\d/gi) !== -1 ||
    text.search(/[А-Яа-я]\d,\d/gi) !== -1 ||
    text.search(/[A-Za-z]\d[A-Za-z]/gi) !== -1
  ) {
    console.warn('\x1b[35m', `Look in ${file}.psd maybe you find sup/sub-string in ref`)
    console.log('\x1b[0m')
  }
}

const checkValidLayer = (layer, file) => {
  if (layer.name.toLowerCase().trim() === 'ref') {
    if (layer.text === undefined) {
      console.warn('\x1b[41m', `ref - это не текстовый слой, а не текст в ${file}.psd`)
      console.log('\x1b[0m')
      return false
    }
    return true
  }
}

const getRefToWrite = (layer, file) => {
  const text = layer.text.value
  checkSubStr(text, file)
  let strRef = text.replace(/\u0003/g, '</br>')
  strRef = strRef.split(/\r/g)
  strRef = strRef.filter((el) => !!el.trim())
  return strRef
}

main(checkValidLayer, getRefToWrite, 'ref')
