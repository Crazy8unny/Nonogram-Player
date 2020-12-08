function handleMouseEvent(e, grid, width, height) {
  
  if (e.buttons !== 1 && e.buttons !== 2) return

  let dim = Math.floor( grid[0].length >= grid.length ? width  / grid[0].length : height / grid.length )

  for (let y in grid) {
    for (let x in grid[y]) {
      if (
        e.offsetX > x * dim && e.offsetX < x * dim + dim && 
        e.offsetY > y * dim && e.offsetY < y * dim + dim
      ) {
        grid[y][x] = e.buttons == 1 ? 1 : 0
      }
    }
  }

}

module.exports = handleMouseEvent