const SCREEN_WIDTH = 60;
const SCREEN_HEIGHT = 60;
const SCREEN_BACKGROUND = "#f1f1f1";
const SNAKE_COLOR = "#000000";
const SNAKE_SQUARE_SIZE = 10;
const GAME_FPS = 100;
const DIRECTION_MAP = {
  0: [1, 0],
  1: [0, -1],
  2: [-1, 0],
  3: [0, 1]
}
const INIT_SNAKE_LENGTH = 2;
const APPLE_COLOR = "#FF0000";

class Square {
  constructor(ctx, x, y, size, color) {
    this.size = size;
    this.x = x;
    this.y = y;
    this.ctx = ctx;
    this.color = color;
  }

  draw(thickness) {
    this.ctx.fillStyle = SCREEN_BACKGROUND;
    this.ctx.fillRect(this.x - thickness, this.y - thickness, this.size + (thickness * 2), this.size + (thickness * 2));

    this.ctx.fillStyle = this.color;
    this.ctx.fillRect(this.x, this.y, this.size, this.size);
  }

  remove() {
    this.ctx.fillStyle = SCREEN_BACKGROUND;
    this.ctx.fillRect(this.x, this.y, this.size, this.size);
  }
}

class Apple {
  constructor(ctx, x, y) {
    this.x = x;
    this.y = y;
    this.ctx = ctx;
    this.apple = new Square(ctx, x, y, SNAKE_SQUARE_SIZE, APPLE_COLOR);
  }

  draw() {
    this.apple.draw(0);
  }

  remove() {
    this.apple.remove();
  }
}

class Snake {
  constructor(game) {
    this.ctx = game.ctx;
    this.game = game;
    this.color = SNAKE_COLOR;
    this.headX = (INIT_SNAKE_LENGTH - 1) * SNAKE_SQUARE_SIZE;
    this.headY = 0;
    this.body = [...Array(INIT_SNAKE_LENGTH).keys()].map(key => new Square(
      this.ctx,
      (INIT_SNAKE_LENGTH - 1 - key) * SNAKE_SQUARE_SIZE,
      0,
      SNAKE_SQUARE_SIZE,
      SNAKE_COLOR
    ))
    this.currDirection = 0;
  }

  changeDirection(direction) {
    if ((direction - this.currDirection) % 2) {
      this.headX += DIRECTION_MAP[direction][0] * SNAKE_SQUARE_SIZE;
      this.headY += DIRECTION_MAP[direction][1] * SNAKE_SQUARE_SIZE;
      if (this.headX === this.game.apple.x && this.headY === this.game.apple.y) {
        this.game.score++;
        this.game.scoreDiv.innerHTML = this.game.score;
        this.game.createApple();
      } else {
        this.body.pop();
      }
      this.body = [
        new Square(this.ctx, this.headX, this.headY, SNAKE_SQUARE_SIZE, SNAKE_COLOR),
        ...this.body
      ]
      this.currDirection = direction;
    }
  }

  update() {
    this.headX += DIRECTION_MAP[this.currDirection][0] * SNAKE_SQUARE_SIZE;
    this.headY += DIRECTION_MAP[this.currDirection][1] * SNAKE_SQUARE_SIZE;
    if (this.headX === this.game.apple.x && this.headY === this.game.apple.y) {
      this.game.score++;
      this.game.scoreDiv.innerHTML = this.game.score;
      this.game.createApple();
    } else {
      this.body.pop();
    }
    this.body = [
      new Square(this.ctx, this.headX, this.headY, SNAKE_SQUARE_SIZE, SNAKE_COLOR),
      ...this.body
    ]
  }

  remove() {
    this.body.forEach(square => square.remove());
  }

  draw() {
    this.body.forEach(square => square.draw(1));
  }
}

class Game {
  constructor() {
    this.canvas = document.createElement("canvas");
    document.body.appendChild(this.canvas);
    this.ctx = this.canvas.getContext("2d");
    this.width = SCREEN_WIDTH * SNAKE_SQUARE_SIZE;
    this.height = SCREEN_HEIGHT * SNAKE_SQUARE_SIZE;
    this.canvas.width = SCREEN_WIDTH * SNAKE_SQUARE_SIZE;
    this.canvas.height = SCREEN_HEIGHT * SNAKE_SQUARE_SIZE;

    this.score = 0;
    this.scoreDiv = document.getElementById("score");
    this.scoreDiv.innerHTML = this.score;

    this.ctx.fillStyle = SCREEN_BACKGROUND;
    this.ctx.fillRect(0, 0, this.width, this.height);

    window.addEventListener('keydown', (e) => {
      this.key = e.key;
    })
  }

  start() {
    this.snake = new Snake(this);
    this.createApple();
    this.snake.draw();
    this.interval = setInterval(() => {
      this.update();
    }, 10000 / GAME_FPS);
  }

  createApple() {
    let x = Math.floor(Math.random() * SCREEN_WIDTH) * SNAKE_SQUARE_SIZE;
    let y = Math.floor(Math.random() * SCREEN_HEIGHT) * SNAKE_SQUARE_SIZE;
    const sameSnakeApple = this.snake.body.filter(square => x === square.x && y == square.y)[0];
    if (sameSnakeApple) this.createApple();
    this.apple = new Apple(this.ctx, x, y);
    this.apple.draw();
  }

  update() {
    this.snake.remove();
    if (this.key && this.key == "ArrowLeft") { this.snake.changeDirection(2); }
    if (this.key && this.key == "ArrowRight") { this.snake.changeDirection(0); }
    if (this.key && this.key == "ArrowUp") { this.snake.changeDirection(1); }
    if (this.key && this.key == "ArrowDown") { this.snake.changeDirection(3); }
    this.snake.update();
    this.checkCollision();
    this.snake.draw();
  }

  checkCollision() {
    const collisionHead = this.snake.body.filter((square, idx) => idx && square.x === this.snake.headX && square.y === this.snake.headY)[0];
    if (
      this.snake.headX > this.width - SNAKE_SQUARE_SIZE || this.snake.headX < 0
      || this.snake.headY > this.height - SNAKE_SQUARE_SIZE || this.snake.headY < 0
      || collisionHead
    ) {
      clearInterval(this.interval);
    }
  }
}

let game = new Game();
game.start();