#!/usr/bin/env node
const PSD = require('psd')
const fs = require('fs')
const path = require('path')

const arrPsd = []
const callDir = process.env.PWD
let time = Date.now() / 1000
let arrRefs = {}



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
    console.log("")
    process.exit(1)
  }
  return arrPsd
}

const chakeNameOfLay = (el, file) => {
  if (el.type === 'group') {
    const arrChild = el.children
    arrChild.some(el => {
      if (el.name === 'REF') {
        writeRefToFile(el, file)
        return flag = 1
      }
    })
  } else {
    if (el.name === 'REF') {
      writeRefToFile(el, file)
      return flag = 1
    }
  }
}

const writeRefToFile = (el, file) => {
  file = file.replace('.psd', '')
  const strRef = el.text.value.split(/\r/g)
  strRef.map((el, i) => {
    if (el === '' || el === ' ') {
      strRef.splice(i, 1)
    }
  })
  arrRefs[file] = strRef
  return true;
}


readDir()

arrPsd.map((file) => {
  const psd = PSD.fromFile(`${callDir}/${file}`)
  console.log(file)
  psd.parse()
  const child = psd.tree().export().children
  let flag = child.some(el => {
    if (el.type === 'group') {
      const arrChild = el.children
      return arrChild.some(el => {
        if (el.name === 'REF') {
          return writeRefToFile(el, file)

        }
      })

    } else {
      if (el.name === 'REF') {
        return writeRefToFile(el, file)
      }
    }
  })
  if (!flag) {
    console.warn("\x1b[0m", "I don't see REF layer!")
    console.log("")
  }
})
const json = JSON.stringify(arrRefs)

fs.writeFileSync(`${callDir}/refs.json`, json)
time = Date.now() / 1000 - time
console.log('Время выполнения = ', time.toFixed(2))