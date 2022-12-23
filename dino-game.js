const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const imageNames = ['bird', 'cactus', 'dino'];

// グローバルな game オブジェクト
const game = {
  counter: 0,
  backGrounds: [],
  gamingBgm: new Audio('bgm/fieldSong.mp3'),
  gamingBgmHard: new Audio('bgm/fieldSongHardMode.mp3'),
  jumpSound: new Audio('bgm/jump.mp3'),
  failedBgm: new Audio('bgm/failed.mp3'),
  clearBgm: new Audio('bgm/clear.mp3'),
  enemies: [],
  enemyCountdown: 0,
  image: {},
  score: 0,
  state: 'loading',
  timer: null,
  isPlayed: false,
  difficulty: null
};
game.gamingBgm.loop = true;
game.gamingBgmHard.loop = true;

// 複数画像読み込み
let imageLoadCounter = 0;
for (const imageName of imageNames) {
  const imagePath = `image/${imageName}.png`;
  game.image[imageName] = new Image();
  game.image[imageName].src = imagePath;
  game.image[imageName].onload = () => {
    imageLoadCounter += 1;
    if (imageLoadCounter === imageNames.length) {
      init();
    }
  }
}

function init() {
  game.counter = 0;
  game.enemies = [];
  game.enemyCountdown = 0;
  game.score = 0;
  game.state = 'init';
  // 画面クリア
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // 恐竜の表示
  createDino();
  drawDino();
  // 背景の描画
  createBackGround();
  drawBackGrounds();
  // 文章の表示
  ctx.fillStyle = 'black';
  ctx.font = 'bold 60px serif';
  ctx.fillText(`Press Space key`, 60, 150);
  ctx.fillText(`to start.`, 150, 230);
  if (game.isPlayed) drawHardModeText();
}

function quitAndInit() {
  game.gamingBgm.pause();
  game.gamingBgmHard.pause();
  clearInterval(game.timer);
  init();
}

function start() {
  game.state = 'gaming';
  game.gamingBgm.play();
  game.timer = setInterval(ticker, 16);
  game.difficulty = 90;
}

function startHardMode() {
  game.state = 'gaming';
  game.gamingBgmHard.play();
  game.timer = setInterval(tickerHardMode, 16);
  game.difficulty = 50;
}

function ticker() {
  // 画面クリア
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // 背景の作成
  if (game.counter % 10 === 0) {
    createBackGround();
  }

  // 敵キャラクタの生成
  createEnemies();

  // キャラクタの移動
  moveBackGrounds(); // 背景の移動
  moveDino(); // 恐竜の移動
  moveEnemies(); // 敵キャラクターの移動

  //描画
  drawBackGrounds(); // 背景の描画
  drawDino(); // 恐竜の描画
  drawEnemies(); // 敵キャラクターの移動
  drawScore(); // スコアの描画
  if (game.score <= 200) drawHowToQuit();// ゲーム中止方法の描画

  // あたり判定
  hitCheck();

  // カウンタの更新
  game.score += 0.5;
  game.counter = (game.counter + 1) % 1000000;
  game.enemyCountdown -= 0.5;

  // クリアしたかどうか
  if (game.score >= 1200) clear();
}

function tickerHardMode() {
  // 画面クリア
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // 背景の作成
  if (game.counter % 10 === 0) {
    createBackGround();
  }

  // 敵キャラクタの生成
  createEnemies();

  // キャラクタの移動
  moveBackGrounds(); // 背景の移動
  moveDino(); // 恐竜の移動
  moveEnemies(); // 敵キャラクターの移動

  //描画
  drawBackGrounds(); // 背景の描画
  drawDino(); // 恐竜の描画
  drawEnemies(); // 敵キャラクターの移動
  drawScore(); // スコアの描画
  if (game.score <= 500) drawHowToQuit();// ゲーム中止方法の描画

  // あたり判定
  hitCheck();

  // カウンタの更新
  game.score += (Math.floor(Math.random() * 5 + 1));
  game.counter = (game.counter + 1) % 1000000;
  game.enemyCountdown -= 1;

  // クリアしたかどうか
  if (game.score >= 1700) clear();
}

function createDino() {
  game.dino = {
    x: game.image.dino.width / 2,
    y: canvas.height - game.image.dino.height / 2,
    moveY: 0,
    width: game.image.dino.width,
    height: game.image.dino.height,
    image: game.image.dino
  }
}

function createBackGround() {
  game.backGrounds = [];
  for (let x = 0; x <= canvas.width; x += 200) {
    game.backGrounds.push({
      x: x,
      y: canvas.height,
      width: 200,
      height: 30,
      moveX: -20 - (game.score / 100),
    })
  }
}

function createCactus(createX) {
  game.enemies.push({
    x: createX,
    y: canvas.height - game.image.cactus.height / 2,
    width: game.image.cactus.width,
    height: game.image.cactus.height,
    moveX: -8 - (game.score / 100),
    image: game.image.cactus
  });
}

function createBird(createX) {
  const birdY = Math.random() * (300 - game.image.bird.height) + 150;
  game.enemies.push({
    x: createX,
    y: birdY,
    width: game.image.bird.width,
    height: game.image.bird.height,
    moveX: -10 - (game.score / 100),
    image: game.image.bird
  });
}

function createEnemies() {
  if (game.enemyCountdown === 0) {
    game.enemyCountdown = 60 - Math.floor(game.score / game.difficulty);
    if (game.enemyCountdown <= 30) game.enemyCountdown = 30;
    switch (Math.floor(Math.random() * 5)) {
      case 0:
        createCactus(canvas.width + game.image.cactus.width / 2);
        break;
      case 1:
        createCactus(canvas.width + game.image.cactus.width / 2);
        createCactus(canvas.width + game.image.cactus.width * 3 / 2);
        break;
      case 2:
        for (let i = 0; i <= Math.floor(Math.random() * 2 + 1); i++) {
          createBird((canvas.width + game.image.bird.width / 2) + (Math.floor(Math.random() * 100) -50));
        }
        break;
      case 3:
        createCactus(canvas.width + game.image.cactus.width / 2);
        createCactus(canvas.width + game.image.cactus.width * 3 / 2);
        createCactus(canvas.width + game.image.cactus.width * 2);
        break;
      case 4:
        for (let i = 2; i <= Math.floor(Math.random() * 3 + 3); i++) {
          setTimeout(() => {
            createBird((canvas.width + game.image.bird.width / 2) + (Math.floor(Math.random() * 100) - 50));
          }, (Math.floor(Math.random() * 50 + 5)));
          game.enemyCountdown += Math.floor(Math.random() * 20 + 10);
        }
    }
  }
}

function moveBackGrounds() {
  for (const backGround of game.backGrounds) {
    backGround.x += backGround.moveX;
  }
}


function moveDino() {
  game.dino.y += game.dino.moveY;
  if ((game.dino.y >= canvas.height - game.dino.height / 2)) {
    game.dino.y = canvas.height - game.dino.height / 2;
    game.dino.moveY = 0;
  } else {
    game.dino.moveY += 1.6;
  }
}

function moveEnemies() {
  for (const enemy of game.enemies) {
    enemy.x += enemy.moveX;
  }
  // 画面の外に出たキャラクタを配列から削除
  game.enemies = game.enemies.filter(enemy => enemy.x > -enemy.width);
}

function drawBackGrounds() {
  ctx.fillStyle = 'sienna';
  for (const backGround of game.backGrounds) {
    ctx.fillRect(backGround.x, backGround.y - 5, backGround.width, 5);
    ctx.fillRect(backGround.x + 20, backGround.y - 10, backGround.width - 40, 5);
    ctx.fillRect(backGround.x + 50, backGround.y - 15, backGround.width - 100, 5);
  }
}

function drawDino() {
  ctx.drawImage(game.image.dino, game.dino.x - game.dino.width / 2, game.dino.y - game.dino.height / 2);
}

function drawEnemies() {
  for (const enemy of game.enemies) {
    ctx.drawImage(enemy.image, enemy.x - enemy.width / 2, enemy.y - enemy.height / 2);
  }
}

function drawHardModeText() {
  ctx.fillStyle = 'black';
  ctx.font = 'bold 30px serif';
  ctx.fillText(`[ h ] - Play hard mode.`, 155, 340);
}

function drawHowToQuit() {
  ctx.fillStyle = 'black';
  ctx.font = 'bold 15px serif';
  ctx.fillText(`[ q ] - Stop playing the game.`, 500, 20);
}

function drawScore() {
  if (game.state === 'clear') return;
  ctx.fillStyle = 'black';
  ctx.font = '24px serif';
  ctx.fillText(`score: ${Math.floor(game.score)}`, 0, 30);
}

function drawEndText() {
  ctx.fillStyle = 'black';
  ctx.font = 'bold 30px serif';
  ctx.fillText(`[ Enter ] - Play again.`, 150, 340);
}

function hitCheck() {
  for (const enemy of game.enemies) {
    if (Math.abs(game.dino.x - enemy.x) < game.dino.width * 0.8 / 2 + enemy.width * 0.9 / 2 &&
      Math.abs(game.dino.y - enemy.y) < game.dino.height * 0.5 / 2 + enemy.height * 0.9 / 2
    ) {
      new Promise(resolve => {
        game.failedBgm.play();
        game.state = 'gameover';
        game.gamingBgm.pause();
        game.gamingBgmHard.pause();
        ctx.fillStyle = 'black';
        ctx.font = 'bold 100px serif';
        ctx.fillText(`Game Over!`, 150, 200);
        drawEndText();
        game.isPlayed = true;
        clearInterval(game.timer);
        resolve();
      })
      .then(() => {
        game.failedBgm.currentTime = 0;
      })
    }
  }
}

function clear() {
  new Promise(resolve => {
    game.clearBgm.play();
    game.state = 'clear'
    game.gamingBgm.pause();
    game.gamingBgmHard.pause();
    ctx.fillStyle = 'black';
    ctx.font = 'bold 100px serif';
    ctx.fillText(`Game Clear!`, 150, 200);
    drawEndText();
    game.isPlayed = true;
    clearInterval(game.timer);
    resolve();
  })
  .then(() => {
    game.clearBgm.currentTime = 0;
  })
}

// ゲーム進行に関わるキー押下の処理
addEventListener('keydown', (event) => {
  if (event.key === ' ' && game.state === 'init') start();
  if ((event.key === 'h' || event.key === 'H') && game.state === 'init') startHardMode();
  if (event.key === 'Enter' && game.state === 'gameover') init();
  if (event.key === 'Enter' && game.state === 'clear') init();
  if ((event.key === 'q' || event.key === 'Q') && game.state === 'gaming') quitAndInit();
});



// 恐竜の長押し時のジャンプ処理
addEventListener('keydown', (event) => {
  if (event.repeat && game.dino.moveY === 0
    && event.key === ' ' && game.state === 'gaming') {
    game.dino.moveY = -26;
    game.jumpSound.currentTime = 0;
    game.jumpSound.play();
  }
  addEventListener('keyup', (event) => {
    if(event.key === ' ') return;
  })
})


// 恐竜の通常・2連ジャンプ処理
let spaceCounter = 0;
addEventListener('keydown', (event) => {
  if (!(game.dino.moveY === 0) && spaceCounter === 0) return;

  if (event.key === ' ' && !event.repeat
    && game.dino.moveY === 0 && spaceCounter === 0
    && game.state === 'gaming') {
    spaceCounter += 1;
    game.dino.moveY = -27;
    game.jumpSound.currentTime = 0;
    game.jumpSound.play();
  } else if (event.key === ' ' && !event.repeat
    && !(game.dino.moveY === 0) && spaceCounter === 1
    && game.state === 'gaming') {
    spaceCounter += 1;
  }
  if (spaceCounter >= 2) {
    game.dino.moveY = -26;
    game.jumpSound.currentTime = 0;
    game.jumpSound.play();
    spaceCounter = 0;
  } else {
    setTimeout(() => { spaceCounter = 0; }, 600);
  }
});
