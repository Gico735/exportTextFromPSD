#!/usr/bin/env node
const main = require('./exportFromPSD/exportFromPSD')

const checkValidLayer = ({ type, name }) => type === 'group' && name.toLowerCase() === 'references'

const getRefToWrite = ({ children }) =>
  children
    .map(
      (child) =>
        child.text !== undefined &&
        child.text.value
          .trim()
          .replace(/\u0003/g, '</br>')
          .split(/\r/g),
    )
    .flat()
    .filter((el) => el)
    .map((str) => {
      if (str === 'Литература') return `<span class='title'>Литература</span>`
      if (str === 'Дизайн исследования') return `<span class='title'>Дизайн исследования</span>`
      if (str === 'Список сокращений') return `<span class='title'>Список сокращений</span>`
      if (str === 'Сокращения') return `<span class='title'>Сокращения</span>`
      if (str === 'Сноски') return `<span class='title'>Сноски</span>`
      return str
    })
    .join('<br/>')

main(checkValidLayer, getRefToWrite, 'ref')
