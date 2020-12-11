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
let body = document.body;

let fileInput = container.querySelector('input[name="file"]')
let jsonInput = container.querySelector('input[name="jsonFile"]')
let clearBtn = container.querySelector('button[name="clear"]')
let imageBtn = container.querySelector('button[name="image"]')
let importCodeBtn = container.querySelector('button[name="importCode"]')
let importJSONBtn = container.querySelector('button[name="importJson"]')
let copyBtn = container.querySelector('button[name="copy"]')
let modeBtn = container.querySelector('button[name="mode"]')

let blackBtn = container.querySelector('#blackBtn');
let emptyBtn = container.querySelector('#emptyBtn');
let disableBtn = container.querySelector('#disableBtn');

let inputCanvas = container.querySelector('#input-grid canvas')
let outputCanvas = container.querySelector('#output-grid canvas')

let inputCtx = inputCanvas.getContext('2d')
let outputCtx = outputCanvas.getContext('2d')

let admin = require("firebase-admin");
var firebaseConfig = {
  "type": "service_account",
  "project_id": "nonograms-db",
  "private_key_id": process.env.private_key_id.replace(/\\n/g, '\n'),
  "private_key": process.env.private_key.replace(/\\n/g, '\n'),
  "client_email": process.env.client_email.replace(/\\n/g, '\n'),
  "client_id": process.env.client_id.replace(/\\n/g, '\n'),
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-uo7jk%40nonograms-db.iam.gserviceaccount.com"
}
let db;

let touchable = 'ontouchstart' in window;
let isTouchUsed = false;
let selectedColor = blackBtn;
let winned = false;
let grid = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 1, 1, 0, 0, 0],
  [0, 0, 0, 0, 1, 1, 1, 1, 0, 0],
  [0, 0, 0, 1, 0, 1, 0, 1, 0, 0],
  [0, 0, 1, 1, 0, 1, 0, 1, 1, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [1, 1, 1, 0, 1, 1, 1, 0, 1, 1],
  [1, 1, 1, 1, 0, 0, 0, 1, 1, 1]
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
let prevGrids = [];


// *********************** Touch support ********************** //

container.addEventListener("touchstart", function (e) {
  if (e.target == outputCanvas) {
    e.preventDefault();
  }
}, false);
container.addEventListener("touchend", function (e) {
  if (e.target == outputCanvas) {
    e.preventDefault();
  }
}, false);
container.addEventListener("touchmove", function (e) {
  if (e.target == outputCanvas) {
    e.preventDefault();
  }
}, false);

outputCanvas.addEventListener("touchstart", function (e) {
  isTouchUsed = true;
  // mousePos = getTouchPos(canvas, e);
  var touch = e.touches[0];
  var rect = outputCanvas.getBoundingClientRect();
  var mouseEvent = new MouseEvent("mousedown", {
    clientX: (touch.clientX - rect.left),
    clientY: (touch.clientY - rect.top),
    buttons: 1
  });
  outputCanvas.dispatchEvent(mouseEvent);
});

outputCanvas.addEventListener("touchend", function (e) {
  var mouseEvent = new MouseEvent("mouseup", {});
  outputCanvas.dispatchEvent(mouseEvent);
}, false);

outputCanvas.addEventListener("touchmove", function (e) {
  var touch = e.touches[0];
  var rect = outputCanvas.getBoundingClientRect();
  var mouseEvent = new MouseEvent("mousemove", {
    clientX: (touch.clientX - rect.left),
    clientY: (touch.clientY - rect.top),
    buttons: 1
  });
  outputCanvas.dispatchEvent(mouseEvent);
}, false);

// *********************** Touch support ********************** //



outputCanvas.addEventListener('mousedown', function (e) {
  let btn = e.buttons;
  if (e.button == 1) {
    e.preventDefault();
  }
  if (!winned) {
    if (isTouchUsed && e.buttons != 0) {
      switch (selectedColor) {
        case blackBtn:
          btn = 1; break;
        case emptyBtn:
          btn = 2; break;
        case disableBtn:
          btn = 4; break;
      }
    }
    handleMouseEvent(e, ogrid, prevGrids, isTouchUsed, touchable, btn, outputCanvas.width, outputCanvas.height)
    let { horizontalClues, verticalClues } = generateClues(grid)
    drawOutputGrid(grid, ogrid, horizontalClues, verticalClues, outputCanvas, outputCtx)
  }
})

outputCanvas.addEventListener('mousemove', function (e) {
  let btn = e.buttons;
  if (!winned) {
    if (isTouchUsed && e.buttons != 0) {
      switch (selectedColor) {
        case blackBtn:
          btn = 1; break;
        case emptyBtn:
          btn = 2; break;
        case disableBtn:
          btn = 4; break;
      }
    }
    handleMouseEvent(e, ogrid, prevGrids, isTouchUsed, touchable, btn, outputCanvas.width, outputCanvas.height)
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
      Swal.fire({
        title: 'Congratulations !!11!11!',
        text: 'You win !',
        imageUrl: 'https://thumbs.gfycat.com/EachIndolentHoopoe-max-1mb.gif',
        imageWidth: 240,
        imageHeight: 180,
        width: 450,
        imageAlt: 'Avatar Cool',
      })
      winned = true;
    }
  }
})


importCodeBtn.addEventListener('click', function (e) {
  Swal.fire({
    title: 'Enter nonogram code:',
    input: 'text',
    showCancelButton: true,
    confirmButtonText: 'Start',
    showLoaderOnConfirm: true,
    preConfirm: (login) => {
      const server = db.doc(login);
      server.get().then(nonogram => {
        if (!nonogram.exists) {
          throw new Error("Nonogram not exist !");
        }
        else {
          return (nonogram.data());
        }
      })
        .catch(error => {
          Swal.showValidationMessage(
            `Error: That nonogram not exist !!!`
          )
        })
    },
    allowOutsideClick: () => !Swal.isLoading()
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire({
        title: `${result.value.Time} Good Job !`,
      })
    }
  })
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
    drawOutputGrid(grid, ogrid, horizontalClues, verticalClues, outputCanvas, outputCtx)
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
    drawOutputGrid(grid, ogrid, horizontalClues, verticalClues, outputCanvas, outputCtx)
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
  outputCanvas.toBlob(blob => navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]));
})

modeBtn.addEventListener('click', function (e) {
  if (!isTouchUsed) {
    body.classList.add("touch-mode-bck");
    selectedColor = blackBtn;
    blackBtn.classList.add("touch-mode-selected-color");
    isTouchUsed = true;
  }
  else {
    body.classList.remove("touch-mode-bck");
    selectedColor.classList.remove("touch-mode-selected-color");
    isTouchUsed = false;
  }

})

blackBtn.addEventListener('click', function (e) {
  if (isTouchUsed) {
    selectedColor.classList.remove("touch-mode-selected-color");
    selectedColor = blackBtn;
    selectedColor.classList.add("touch-mode-selected-color");
  }
})

emptyBtn.addEventListener('click', function (e) {
  if (isTouchUsed) {
    selectedColor.classList.remove("touch-mode-selected-color");
    selectedColor = emptyBtn;
    selectedColor.classList.add("touch-mode-selected-color");
  }
})

disableBtn.addEventListener('click', function (e) {
  if (isTouchUsed) {
    selectedColor.classList.remove("touch-mode-selected-color");
    selectedColor = disableBtn;
    selectedColor.classList.add("touch-mode-selected-color");
  }
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
  admin.initializeApp({
    credential: admin.credential.cert(firebaseConfig),
    databaseURL: "https://nonograms-db.firebaseio.com"
  });
  db = admin.firestore().collection("Nonograms");

  winned = false;
  if (touchable) {
    modeBtn.click();
  }
  let { horizontalClues, verticalClues } = generateClues(grid)
  let solvedGrid = await solver(grid[0].length, grid.length, horizontalClues, verticalClues)
  grid = solvedGrid;
  drawOutputGrid(solvedGrid, ogrid, horizontalClues, verticalClues, outputCanvas, outputCtx)
}

init()