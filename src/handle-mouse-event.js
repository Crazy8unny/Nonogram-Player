function handleMouseEvent(e, grid, prevGrids, isTouchUsed, touchable, btn, width, height) {
  let mouseX = e.offsetX;
  let mouseY = e.offsetY;
  if (isTouchUsed && touchable) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }

  if (btn !== 1 && btn !== 2 && btn !== 4) return

  // let dim = Math.floor(grid[0].length >= grid.length ? width / grid[0].length : height / grid.length)
  let dim = Math.floor(
    grid[0].length >= grid.length
      ? width / (grid[0].length * 1.5)
      : height / (grid.length * 1.5)
  )
  let dist = Math.floor(width >= height ? width / 3 : height / 3);
  let changed = false;
  prevGrids.push(grid);
  for (let y in grid) {
    for (let x in grid[y]) {
      if (
        (mouseX - dist) > x * dim && (mouseX - dist) < x * dim + dim &&
        (mouseY - dist) > y * dim && (mouseY - dist) < y * dim + dim
      ) {
        switch (btn) {
          case 1:
            grid[y][x] = 1; changed = true; break;
          case 2:
            grid[y][x] = 0; changed = true; break;
          case 4:
            grid[y][x] = 2; changed = true; break;
        }
      }
    }
  }
  if (!changed) {
    prevGrids.pop();
  }

}

// module.exports = handleMouseEvent