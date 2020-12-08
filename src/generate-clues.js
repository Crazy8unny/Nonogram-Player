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
    verticalClues:   cols.map(col => col.join('').match(/1+/g) || []).map(col => col.map(line => line.length))
  }
  
}

module.exports = generateClues