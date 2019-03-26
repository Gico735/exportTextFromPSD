#!/usr/bin/env node
const PSD = require('psd')
const fs = require('fs')
const path = require('path')

const arrPsd = []
const callDir = process.env.PWD
let time = Date.now() / 1000
let arrStudys = {}
let haveAnyStudy = false

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
    console.warn('\x1b[41m', "I don't see psd!")
    console.log('\x1b[0m')
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
    if (el.name.toLowerCase() === 'study') {
      haveAnyStudy = true
      return writeStudyToFile(el, file)
    }
  }
}

const writeStudyToFile = (el, file) => {
  file = file.replace('.psd', '')
  let text
  try {
    text = el.text.value
  } catch (error) {
    console.log(file, "hello it's not a STUDY alllo!", error)
  }
  let strStudy = text.split(/[\r\u0003]/g)
  if (
    text.search(/[А-Яа-я]\d\./gi) !== -1 ||
    text.search(/[А-Яа-я]\d-\d/gi) !== -1 ||
    text.search(/[А-Яа-я]\d,\d/gi) !== -1 ||
    text.search(/[A-Za-z]\d[A-Za-z]/gi) !== -1
  ) {
    console.warn(
      '\x1b[35m',
      `Look in ${file}.PSD maybe you find sup/sub-string in Study`
    )
    console.log('\x1b[0m')
  }
  strStudy = strStudy.filter((el, i) => {
    return !!el.trim()
  })
  let study = ''
  study = study.concat('<p>', strStudy.join('<br><br>'), '</p>')
  return (arrStudys[file] = study)
}

readDir()

arrPsd.map(file => {
  const psd = PSD.fromFile(`${callDir}/${file}`)
  psd.parse()
  const child = psd.tree().export().children
  child.some(layers => {
    return chakeNameOfLay(layers, file)
  })
  if (!haveAnyStudy) {
    console.warn('\x1b[35m', `I don't see Study layer! in ${file}`)
    console.log('')
  } else {
    haveAnyStudy = false
  }
})
const json = JSON.stringify(arrStudys)

fs.writeFileSync(`${callDir}/study.json`, json)
time = Date.now() / 1000 - time
console.log('Время выполнения = ', time.toFixed(2))
