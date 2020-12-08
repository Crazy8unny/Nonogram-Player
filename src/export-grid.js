let drawOutputGrid = require('./draw-output-grid')
let generateClues  = require('./generate-clues')

function exportGrid(grid, type) {

  let a = document.createElement('a')

  if (type == 'png') {
    let canvas = document.createElement('canvas')
    let ctx = canvas.getContext('2d')
    let { horizontalClues, verticalClues } = generateClues(grid)
    let blankGrid = grid.map(row => row.map(() => 3))

    canvas.width  = blankGrid[0].length * 100
    canvas.height = blankGrid.length * 100

    drawOutputGrid(blankGrid, horizontalClues, verticalClues, canvas, ctx)
    
    let img = canvas.toDataURL("image/png")

    a.setAttribute('href', 'data:image/png' + img)
    a.setAttribute('download', 'nonogram.png')

  } else if (type == 'json') {
    let gridString = '[\n   ' + grid.map(row => JSON.stringify(row)).join(',\n   ') + '\n]'

    a.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(gridString))
    a.setAttribute('download', 'nonogram.json')
  }

  a.style.display = 'none'
  document.body.appendChild(a)

  a.click()

  document.body.removeChild(a)


}

module.exports = exportGrid