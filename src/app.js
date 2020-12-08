let drawInputGrid         = require('./draw-input-grid')
let drawOutputGrid        = require('./draw-output-grid')
let solver                = require('./solver')
let generateClues         = require('./generate-clues')
let handleMouseEvent      = require('./handle-mouse-event')
let resizeGrid            = require('./resize-grid')
let exportGrid            = require('./export-grid')
let generateGridFromImage = require('./generate-grid-from-image')
let generateGridFromImage = require('./generate-grid-from-image')


let container = document.getElementById('container')

let widthInput  = container.querySelector('input[name="width"]')
let heightInput = container.querySelector('input[name="height"]')
let fileInput   = container.querySelector('input[name="file"]')

let clearBtn      = container.querySelector('button[name="clear"]')
let invertBtn     = container.querySelector('button[name="invert"]')
let imageBtn      = container.querySelector('button[name="image"]')
let exportJSONBtn = container.querySelector('button[name="export-json"]')
let exportPNGBtn  = container.querySelector('button[name="export-png"]')
let importJSONBtn  = container.querySelector('button[name="import-json"]')

let inputCanvas  = container.querySelector('#input-grid canvas') 
let outputCanvas = container.querySelector('#output-grid canvas')

let inputCtx  = inputCanvas.getContext('2d')
let outputCtx = outputCanvas.getContext('2d')

let grid = [
  [0,0,0,1,1,1,1,0,0,0],
  [0,0,1,0,0,1,1,1,0,0],
  [1,1,1,1,1,1,1,1,1,1],
  [0,1,0,1,0,0,1,0,1,0],
  [1,0,0,0,1,1,0,0,0,1],
  [1,0,0,0,1,1,0,0,0,1],
  [0,1,0,1,0,0,1,0,1,0],
  [0,1,0,0,1,1,0,0,1,0],
  [0,0,1,0,0,0,0,1,0,0],
  [0,1,1,1,1,1,1,1,1,0],
]

inputCanvas.addEventListener('contextmenu', function(e) {
  e.preventDefault()
})

inputCanvas.addEventListener('mousedown', function(e) {
  handleMouseEvent(e, grid, inputCanvas.width, inputCanvas.height)
  drawInputGrid(grid, inputCanvas, inputCtx)
})

inputCanvas.addEventListener('mousemove', function (e) {
  handleMouseEvent(e, grid, inputCanvas.width, inputCanvas.height)
  drawInputGrid(grid, inputCanvas, inputCtx)
})

inputCanvas.addEventListener('mouseup', function(e) {
  if (!container.classList.contains('calculating')) {
    calculate() 
  }
})

widthInput.addEventListener( 'change', function(e) {
  resizeGrid(parseInt(e.target.value), grid.length, grid)
  drawInputGrid(grid, inputCanvas, inputCtx)
  calculate()
})

heightInput.addEventListener('change', function(e) { 
  resizeGrid(grid[0].length, parseInt(e.target.value), grid)
  drawInputGrid(grid, inputCanvas, inputCtx)
  calculate()
})

clearBtn.addEventListener( 'click', function(e) {
  grid = grid.map(row => row.map(() => 0))
  drawInputGrid(grid, inputCanvas, inputCtx)
  calculate()
})

invertBtn.addEventListener('click', function(e) {
  grid = grid.map(row => row.map(cell => cell == 1 ? 0 : 1))
  drawInputGrid(grid, inputCanvas, inputCtx)
  calculate()
})

importJSONBtn.addEventListener('click', function (e) {
  jsonInput.click()
})

jsonInput.addEventListener('change', function (e) {

  if (!e.target.files.length || !e.target.accept.includes(e.target.files[0].type)) return

  let fr = new FileReader()

  fr.addEventListener('load', async function () {
    grid = await generateGridFromJson(fr.result)
    drawInputGrid(grid, inputCanvas, inputCtx)
    calculate()
  })

  fr.readAsText(e.target.files[0])
  jsonInput.value = "";
})

imageBtn.addEventListener('click', function(e) {
  fileInput.click()
})

fileInput.addEventListener('change', function(e) {

  if (!e.target.files.length || !e.target.accept.includes(e.target.files[0].type)) return

  let fr = new FileReader()

  fr.addEventListener('load', async function() {
    grid = await generateGridFromImage(fr.result, widthInput.value, heightInput.value)
    drawInputGrid(grid, inputCanvas, inputCtx)
    calculate()
  })

  fr.readAsDataURL(e.target.files[0])
  fileInput.value = "";
})

exportPNGBtn.addEventListener('click', function(e) {
  exportGrid(grid, 'png')
})

exportJSONBtn.addEventListener('click', function(e) {
  exportGrid(grid, 'json')
})

function calculate() {
  container.classList.add('calculating')

  setTimeout(function() {
    let { horizontalClues, verticalClues } = generateClues(grid)

    solver(grid[0].length, grid.length, horizontalClues, verticalClues)
      .then(solvedGrid => {
        drawOutputGrid(solvedGrid, horizontalClues, verticalClues, outputCanvas, outputCtx)
        container.classList.remove('calculating')
      })
  }, 50)  
}

async function init() {
  let { horizontalClues, verticalClues } = generateClues(grid)
  let solvedGrid = await solver(grid[0].length, grid.length, horizontalClues, verticalClues)
  
  drawInputGrid(grid, inputCanvas, inputCtx)
  drawOutputGrid(solvedGrid, horizontalClues, verticalClues, outputCanvas, outputCtx)
}

init()