#!/usr/bin/env node
const main = require('./exportFronPSD/exportFronPSD')

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
  if (layer.name.toLowerCase() === 'study') {
    if (layer.text === undefined) throw `study - is a graphic layer in ${file}.psd`
    return true
  }
}

const getRefToWrite = (layer, file) => {
  const text = layer.text.value
  checkSubStr(text, file)
  let strStudy = text
    .replace(/\u0003/g, '</br>')
    .split(/\r/g)
    .filter(el => !!el.trim())
  return ''.concat('<p>', strStudy.join('<br><br>'), '</p>')
}

main(checkValidLayer, getRefToWrite, 'study')
