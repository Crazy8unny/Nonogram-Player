(function () { function r(e, n, t) { function o(i, f) { if (!n[i]) { if (!e[i]) { var c = "function" == typeof require && require; if (!f && c) return c(i, !0); if (u) return u(i, !0); var a = new Error("Cannot find module '" + i + "'"); throw a.code = "MODULE_NOT_FOUND", a } var p = n[i] = { exports: {} }; e[i][0].call(p.exports, function (r) { var n = e[i][1][r]; return o(n || r) }, p, p.exports, r, e, n, t) } return n[i].exports } for (var u = "function" == typeof require && require, i = 0; i < t.length; i++)o(t[i]); return o } return r })()({
  1: [function (require, module, exports) {
    let drawInputGrid = require('./draw-input-grid')
    let drawOutputGrid = require('./draw-output-grid')
    let solver = require('./solver')
    let generateClues = require('./generate-clues')
    let handleMouseEvent = require('./handle-mouse-event')
    let resizeGrid = require('./resize-grid')
    let exportGrid = require('./export-grid')
    let generateGridFromImage = require('./generate-grid-from-image')
    let generateGridFromJson = require('./generate-grid-from-json')


    let container = document.getElementById('container')

    let fileInput = container.querySelector('input[name="file"]')
    let jsonInput = container.querySelector('input[name="jsonFile"]')
    let clearBtn = container.querySelector('button[name="clear"]')
    let imageBtn = container.querySelector('button[name="image"]')
    let importJSONBtn = container.querySelector('button[name="import-json"]')
    let copyBtn = container.querySelector('button[name="copy"]')

    let inputCanvas = container.querySelector('#input-grid canvas')
    let outputCanvas = container.querySelector('#output-grid canvas')

    let inputCtx = inputCanvas.getContext('2d')
    let outputCtx = outputCanvas.getContext('2d')

    let winned = false;

    let grid = [
      [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
      [0, 0, 1, 0, 0, 1, 1, 1, 0, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [0, 1, 0, 1, 0, 0, 1, 0, 1, 0],
      [1, 0, 0, 0, 1, 1, 0, 0, 0, 1],
      [1, 0, 0, 0, 1, 1, 0, 0, 0, 1],
      [0, 1, 0, 1, 0, 0, 1, 0, 1, 0],
      [0, 1, 0, 0, 1, 1, 0, 0, 1, 0],
      [0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    ]

    let ogrid = [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ]

    let hClues, vClues;

    outputCanvas.addEventListener('mousedown', function (e) {
      if (e.button == 1) {
        e.preventDefault();
      }
      if (!winned) {
        handleMouseEvent(e, ogrid, outputCanvas.width, outputCanvas.height)
        let { horizontalClues, verticalClues } = generateClues(grid)
        drawOutputGrid(grid, ogrid, horizontalClues, verticalClues, outputCanvas, outputCtx)
      }
    })

    outputCanvas.addEventListener('mousemove', function (e) {
      if (!winned) {
        handleMouseEvent(e, ogrid, outputCanvas.width, outputCanvas.height)
        let { horizontalClues, verticalClues } = generateClues(grid)
        drawOutputGrid(grid, ogrid, horizontalClues, verticalClues, outputCanvas, outputCtx)
      }
    })

    outputCanvas.addEventListener('contextmenu', function (e) {
      e.preventDefault()
    })

    outputCanvas.addEventListener('mouseup', function (e) {
      // Check winning
      if (!winned) {
        let wrong = false;
        for (let row in grid) {
          for (let col in grid[row]) {
            if (grid[row][col] == 1 && ogrid[row][col] != 1 ||
              grid[row][col] == 2 && ogrid[row][col] == 1) {
              wrong = true;
            }
          }
        }
        if (!wrong) {
          alert("Congratulationssssssssss !!!111!111!1111")
          winned = true;
        }
      }
    })

    importJSONBtn.addEventListener('click', function (e) {
      jsonInput.click()
    })

    jsonInput.addEventListener('change', function (e) {

      if (!e.target.files.length || !e.target.accept.includes(e.target.files[0].type)) return

      let fr = new FileReader()

      fr.addEventListener('load', async function () {
        grid = await generateGridFromJson(fr.result)
        let ogrid2 = [];
        for (let row in grid) {
          ogrid2[row] = [];
          for (let col in grid[row]) {
            ogrid2[row][col] = 0;
          }
        }
        ogrid = ogrid2;
        // grid.forEach(function(row, i) { for (let index in row) {ogrid[row[index]] = 0} });
        // drawInputGrid(grid, inputCanvas, inputCtx)
        // calculate()
        let { horizontalClues, verticalClues } = generateClues(grid)
        let solvedGrid = await solver(grid[0].length, grid.length, horizontalClues, verticalClues)
        grid = solvedGrid;
        winned = false;
      })

      fr.readAsText(e.target.files[0])
      jsonInput.value = "";
    })

    imageBtn.addEventListener('click', function (e) {
      fileInput.click()
    })

    fileInput.addEventListener('change', function (e) {

      if (!e.target.files.length || !e.target.accept.includes(e.target.files[0].type)) return

      let fr = new FileReader()

      fr.addEventListener('load', async function () {
        grid = await generateGridFromImage(fr.result, 20, 20)
        let ogrid2 = [];
        for (let row in grid) {
          ogrid2[row] = [];
          for (let col in grid[row]) {
            ogrid2[row][col] = 0;
          }
        }
        ogrid = ogrid2;
        let { horizontalClues, verticalClues } = generateClues(grid)
        let solvedGrid = await solver(grid[0].length, grid.length, horizontalClues, verticalClues)
        grid = solvedGrid;
        winned = false;
      })

      fr.readAsDataURL(e.target.files[0])
      fileInput.value = "";
    })

    clearBtn.addEventListener('click', function (e) {
      winned = false;
      ogrid = ogrid.map(row => row.map(() => 0))
      let { horizontalClues, verticalClues } = generateClues(grid)
      drawOutputGrid(grid, ogrid, horizontalClues, verticalClues, outputCanvas, outputCtx)
    })

    copyBtn.addEventListener('click', function (e) {
      outputCanvas.toBlob(blob => navigator.clipboard.write([new ClipboardItem({'image/png': blob})]));
    })

    function calculate() {

      setTimeout(function () {
        let { horizontalClues, verticalClues } = generateClues(grid)
        solver(grid[0].length, grid.length, horizontalClues, verticalClues)
          .then(solvedGrid => {
            drawOutputGrid(solvedGrid, ogrid, horizontalClues, verticalClues, outputCanvas, outputCtx)
          })
      }, 50)
    }

    async function init() {
      winned = false;
      let { horizontalClues, verticalClues } = generateClues(grid)
      let solvedGrid = await solver(grid[0].length, grid.length, horizontalClues, verticalClues)
      grid = solvedGrid;
      drawOutputGrid(solvedGrid, ogrid, horizontalClues, verticalClues, outputCanvas, outputCtx)
    }

    init()






















  }, { "./draw-input-grid": 2, "./draw-output-grid": 3, "./export-grid": 4, "./generate-clues": 5, "./generate-grid-from-image": 6, "./handle-mouse-event": 7, "./resize-grid": 8, "./solver": 9, "./generate-grid-from-json": 10 }], 2: [function (require, module, exports) {
    function drawInputGrid(grid, canvas, ctx) {

      canvas.width = canvas.width

      let dim = Math.floor(
        grid[0].length >= grid.length
          ? canvas.width / grid[0].length
          : canvas.height / grid.length
      )

      // Cells
      for (let y in grid) {
        for (let x in grid[y]) {

          ctx.strokeStyle = '#686868'
          ctx.lineWidth = 1.5
          ctx.strokeRect(x * dim, y * dim, dim, dim)

          if (grid[y][x] == 1) {
            ctx.fillStyle = '#000000'
            ctx.fillRect(x * dim, y * dim, dim, dim)
          }

        }
      }

      // Border
      ctx.strokeStyle = '#000000'
      ctx.strokeRect(0, 0, dim * grid[0].length, dim * grid.length)

    }

    module.exports = drawInputGrid
  }, {}], 3: [function (require, module, exports) {
    function drawOutputGrid(grid, ogrid, horizontalClues, verticalClues, canvas, ctx) {

      canvas.width = canvas.width

      let dim = Math.floor(
        grid[0].length >= grid.length
          ? canvas.width / (grid[0].length * 1.5)
          : canvas.height / (grid.length * 1.5)
      )

      // Background
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Cells
      for (let y in ogrid) {
        for (let x in ogrid[y]) {

          ctx.strokeStyle = '#686868'
          ctx.strokeRect(canvas.width / 3 + x * dim, canvas.height / 3 + y * dim, dim, dim)

          switch (ogrid[y][x]) {
            case 0:
              ctx.fillStyle = '#FFFFFF'
              break

            case 1:
              ctx.fillStyle = '#000000'
              break

            default:
              ctx.fillStyle = '#FFFFFF'
              break
          }

          ctx.fillRect(canvas.width / 3 + x * dim, canvas.height / 3 + y * dim, dim, dim)

          if (ogrid[y][x] == 2) {
            ctx.beginPath()
            ctx.strokeStyle = '#FF0000'
            ctx.moveTo(
              canvas.width / 3 + x * dim + dim * 0.2,
              canvas.height / 3 + y * dim + dim * 0.2
            )
            ctx.lineTo(
              canvas.width / 3 + x * dim + dim - dim * 0.2,
              canvas.height / 3 + y * dim + dim - dim * 0.2
            )
            ctx.stroke()
            ctx.beginPath()
            ctx.strokeStyle = '#FF0000'
            ctx.moveTo(
              canvas.width / 3 + x * dim + dim - dim * 0.2,
              canvas.height / 3 + y * dim + dim * 0.2
            )
            ctx.lineTo(
              canvas.width / 3 + x * dim + dim * 0.2,
              canvas.height / 3 + y * dim + dim - dim * 0.2
            )
            ctx.stroke()
          }

        }
      }

      // Horizontal clues
      for (let y in grid) {
        horizontalClues[y].reverse()
        for (let x = 0; x < grid[y].length / 2; x++) {

          ctx.fillStyle = y % 2 == 0 ? '#DDDDDD' : '#EAEAEA'
          ctx.fillRect(
            canvas.width / 3 - x * dim - dim,
            canvas.height / 3 + y * dim,
            dim,
            dim
          )

          if (horizontalClues[y][x]) {
            ctx.font = dim * 0.4 + 'px Arial'
            ctx.fillStyle = '#000000'
            ctx.fillText(
              horizontalClues[y][x],
              canvas.width / 3 - x * dim - dim / 1.5,
              canvas.height / 3 + y * dim + dim / 1.5
            )
          }

        }

        if (!horizontalClues[y].length) {
          ctx.font = dim * 0.4 + 'px Arial'
          ctx.fillStyle = '#000000'
          ctx.fillText(
            0,
            canvas.width / 3 - dim / 1.5,
            canvas.height / 3 + y * dim + dim / 1.5
          )
        }
      }

      // Vertical clues
      for (let x in grid[0]) {
        verticalClues[x].reverse()
        for (let y = 0; y < grid.length / 2; y++) {

          ctx.fillStyle = x % 2 == 0 ? '#DDDDDD' : '#EAEAEA'
          ctx.fillRect(
            canvas.width / 3 + x * dim,
            canvas.height / 3 - y * dim - dim,
            dim,
            dim
          )

          if (verticalClues[x][y]) {
            ctx.font = dim * 0.4 + 'px Arial'
            ctx.fillStyle = '#000000'
            ctx.fillText(
              verticalClues[x][y],
              canvas.width / 3 + x * dim + dim / 3,
              canvas.height / 3 - y * dim - dim / 3
            )
          }
        }

        if (!verticalClues[x].length) {
          ctx.font = dim * 0.4 + 'px Arial'
          ctx.fillStyle = '#000000'
          ctx.fillText(
            0,
            canvas.width / 3 + x * dim + dim / 3,
            canvas.height / 3 - dim / 3
          )
        }
      }

      // Deviders
      for (let x = 0; x <= grid[0].length; x++) {
        if (x % 5 == 0) {
          ctx.beginPath()
          ctx.strokeStyle = '#000000'
          ctx.lineWidth = 1.5
          ctx.moveTo(canvas.width / 3 + x * dim, 0)
          ctx.lineTo(canvas.width / 3 + x * dim, canvas.height / 3 + dim * grid.length)
          ctx.stroke()
        }
      }

      for (let y = 0; y <= grid.length; y++) {
        if (y % 5 == 0) {
          ctx.beginPath()
          ctx.strokeStyle = '#000000'
          ctx.lineWidth = 1.5
          ctx.moveTo(0, canvas.height / 3 + y * dim)
          ctx.lineTo(canvas.width / 3 + dim * grid[0].length, canvas.height / 3 + y * dim)
          ctx.stroke()
        }
      }

    }

    module.exports = drawOutputGrid
  }, {}], 4: [function (require, module, exports) {
    let drawOutputGrid = require('./draw-output-grid')
    let generateClues = require('./generate-clues')

    function exportGrid(grid, type) {

      let a = document.createElement('a')

      if (type == 'png') {
        let canvas = document.createElement('canvas')
        let ctx = canvas.getContext('2d')
        let { horizontalClues, verticalClues } = generateClues(grid)
        let blankGrid = grid.map(row => row.map(() => 3))

        canvas.width = blankGrid[0].length * 100
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
  }, { "./draw-output-grid": 3, "./generate-clues": 5 }], 5: [function (require, module, exports) {
    function generateClues(rows) {

      let cols = []
      for (let y in rows) {
        for (let x in rows[y]) {
          if (!cols[x]) cols[x] = []
          cols[x][y] = rows[y][x]
        }
      }

      return {
        horizontalClues: rows.map(row => row.join('').match(/1+/g) || []).map(row => row.map(line => line.length)),
        verticalClues: cols.map(col => col.join('').match(/1+/g) || []).map(col => col.map(line => line.length))
      }

    }

    module.exports = generateClues
  }, {}], 6: [function (require, module, exports) {
    function generateGridFromImage(src, width, height) {

      return new Promise((resolve) => {
        let canvas = document.createElement('canvas')
        let img = document.createElement('img')

        img.src = src

        img.onload = function () {

          canvas.width = width
          canvas.height = height
          canvas.getContext('2d').drawImage(img, 0, 0, width, height)

          let grid = []
          for (let y = 0; y < height; y++) {
            if (!grid[y]) grid[y] = []
            for (let x = 0; x < width; x++) {
              let data = canvas.getContext('2d').getImageData(x, y, 1, 1).data

              if (data[0] < 128 && data[1] < 128 && data[2] < 128) {
                grid[y][x] = 1
              } else {
                grid[y][x] = 0
              }

            }
          }

          resolve(grid)

        }
      })

    }

    module.exports = generateGridFromImage
  }, {}], 7: [function (require, module, exports) {
    function handleMouseEvent(e, grid, width, height) {

      if (e.buttons !== 1 && e.buttons !== 2 && e.buttons !== 4) return

      // let dim = Math.floor(grid[0].length >= grid.length ? width / grid[0].length : height / grid.length)
      let dim = Math.floor(
        grid[0].length >= grid.length
          ? width / (grid[0].length * 1.5)
          : height / (grid.length * 1.5)
      )
      let dist = Math.floor(width >= height ? width / 3 : height / 3);

      for (let y in grid) {
        for (let x in grid[y]) {
          if (
            (e.offsetX - dist) > x * dim && (e.offsetX - dist) < x * dim + dim &&
            (e.offsetY - dist) > y * dim && (e.offsetY - dist) < y * dim + dim
          ) {
            switch (e.buttons) {
              case 1:
                grid[y][x] = 1; break;
              case 2:
                grid[y][x] = 0; break;
              case 4:
                grid[y][x] = 2; break;
            }
          }
        }
      }

    }

    module.exports = handleMouseEvent
  }, {}], 8: [function (require, module, exports) {
    function resizeGrid(cols, rows, grid) {

      if (grid[0].length < cols) {
        for (let y in grid) {
          for (let x = 0; x < cols; x++) {
            if (grid[y][x] == undefined) grid[y][x] = 0
          }
        }
      } else if (grid[0].length > cols) {
        for (let y in grid) {
          grid[y] = grid[y].slice(0, cols)
        }
      }

      if (grid.length < rows) {
        for (let y = grid.length; y < rows; y++) {
          grid[y] = grid[0].map(() => 0)
        }

      } else if (grid.length > rows) {
        while (grid.length > rows) {
          grid.pop()
        }
      }

    }

    module.exports = resizeGrid
  }, {}], 9: [function (require, module, exports) {
    async function solver(cols, rows, horizontalClues, verticalClues) {

      let grid = []

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          if (!grid[y]) grid[y] = []
          grid[y][x] = 0
        }
      }

      let changed = true
      while (changed) {
        changed = false

        for (let x in grid[0]) {
          let col = []

          for (let y in grid) col.push(grid[y][x])

          col = solveRow(verticalClues[x], col)

          for (let y in grid) {
            if (col[y] != 0 && col[y] != grid[y][x]) changed = true
            grid[y][x] = col[y]
          }
        }

        for (let y in grid) {
          let row = grid[y].slice()
          row = solveRow(horizontalClues[y], row)

          for (let x in grid[0]) {
            if (row[x] != 0 && row[x] != grid[y][x]) changed = true
            grid[y] = row
          }
        }
      }

      return grid

    }

    function solveRow(clues, row) {

      let permutations = getPermutations(clues, row.length)
      let validPermutations = []

      permutations.forEach(permutation => {
        let valid = true

        for (let x = 0; x < row.length; x++) {
          if (row[x] != 0 && row[x] != permutation[x]) valid = false
        }

        if (valid) validPermutations.push(permutation)
      })

      let newRow = validPermutations[0].slice()
      validPermutations.forEach(permutation => {
        for (let x = 0; x < row.length; x++) {
          if (newRow[x] != permutation[x]) newRow[x] = 0
        }
      })

      return newRow

    }

    function getPermutations(clues, length) {

      if (!clues.length) {
        let row = []

        for (let x = 0; x < length; x++) row.push(2)

        return [row]
      }

      let permutations = []

      for (let i = 0; i < length - clues[0] + 1; i++) {
        let permutation = []

        for (let x = 0; x < i; x++) permutation.push(2)

        for (let x = i; x < i + clues[0]; x++) permutation.push(1)

        let x = i + clues[0]

        if (x < length) {
          permutation.push(2)
          x += 1
        }

        if (x == length && !clues.length) {
          permutations.push(permutation)
          break
        }

        let subRows = getPermutations(clues.slice(1, clues.length), length - x)

        for (let j in subRows) {
          subPermutation = permutation.slice()

          for (let k = x; k < length; k++) {
            subPermutation.push(subRows[j][k - x])
          }

          permutations.push(subPermutation)
        }

      }

      return permutations

    }

    module.exports = solver
  }, {}], 10: [function (require, module, exports) {
    function generateGridFromJson(src) {
      return new Promise((resolve) => {
        let clean = src.replace(/[ ,\[,\n]/g, "")
        clean = clean.slice(0, clean.length - 2)
        var grid = [];
        let counter = 0;
        grid[counter] = []
        for (let letter in clean) {
          if (clean[letter] == ']') {
            counter++;
            grid[counter] = []
          }
          else {
            grid[counter].push(clean[letter])
          }
        }
        resolve(grid)
      })
    }

    module.exports = generateGridFromJson
  }, {}]
}, {}, [1]);
