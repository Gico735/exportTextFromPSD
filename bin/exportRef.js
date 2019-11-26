#!/usr/bin/env node
const main = require('./utils/utils')

const checkValidLayer = (layer, file) => {
  //if have layer name="noref", it's mean noref in PSD
  if (layer.name.toLowerCase() === 'noref') return false
  if (layer.name.toLowerCase() === 'ref') {
    if (layer.text === undefined) throw `ref - is a graphic layer in ${file}.psd`
    return true
  }
}

const writeRefToFile = (layer, file) => {
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
  return strRef
}

main('ref', checkValidLayer, writeRefToFile)
