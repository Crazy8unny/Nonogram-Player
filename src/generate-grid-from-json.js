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