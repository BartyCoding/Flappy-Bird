const controllerSelect = document.getElementById("control-selector");
const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

const gameUpdateRate = 1;

const canvasWidth = 600;
const canvasHeight = 600;

let gameLoop = null;
let gameOn = false;

const gravity = 0.025;
const jumpVel = 2;

const bird = { x: 100, y: 300, radius: 12.5, velX: 0, velY: 0 };

let objects = [];
const objectTemplate = { x: 700, y: 0, width: 50, height: 50 };

const objectMoveSpeed = 0.75;
const objectGap = 100;

let spawnerInterval = null;
let pointInterval = null;
const maxHeightMultiple = 2 / 3;
const minHeight = 10;
const spawnerSpeed = 2000;

let currentPlayerScore = 0
let highScore = localStorage.getItem("highScore") || 0

const roundedRect = (ctx, x, y, width, height, radius) => {
    ctx.beginPath();
    ctx.moveTo(x, y + radius);
    ctx.arcTo(x, y + height, x + radius, y + height, radius);
    ctx.arcTo(x + width, y + height, x + width, y + height - radius, radius);
    ctx.arcTo(x + width, y, x + width - radius, y, radius);
    ctx.arcTo(x, y, x, y + radius, radius);
    ctx.stroke();
}

const getRandomNum = (min, max) => {
    return Math.random() * (max - min) + min;
}

const clearCanvas = () => ctx.clearRect(0, 0, canvasWidth, canvasHeight)

const clamp = (min, max, val) => {
    if (val < min) return min;
    else if (val > max) return max;
    return val;
}

document.addEventListener("keydown", (key) => {
    const keyPressed = key.code;
    if (keyPressed === "Space") {
        key.preventDefault();
        bird.velY -= jumpVel;
    }

})

const drawText = (text, x, y, fontSize) => {
    ctx.font = `${fontSize}px Montserrat`;
    ctx.textAlign = "center";
    ctx.fillText(text, x, y);
}

const rectIntersect = (x1, y1, w1, h1, x2, y2, w2, h2) => {
    if (x2 > w1 + x1 || x1 > w2 + x2 || y2 > h1 + y1 || y1 > h2 + y2) {
        return false;
    }
    return true;
}

const physics = () => {

    for (let i = 0; i < objects.length; i++) {
        const currentObj = objects[i];
        currentObj.x -= objectMoveSpeed;
        if (currentObj.x < 0 - currentObj.width) objects.splice(i, 1)
        else if (currentObj.x < 150) {

            if (rectIntersect(bird.x, bird.y, bird.radius, bird.radius, currentObj.x, currentObj.y, currentObj.width, currentObj.height) ||
                rectIntersect(bird.x, bird.y, bird.radius, bird.radius, currentObj.x, currentObj.y + currentObj.height + objectGap, currentObj.width, canvasHeight - currentObj.height - objectGap)) {
                clearInterval(spawnerInterval);
                clearInterval(pointInterval)
                clearInterval(gameLoop);
                drawText("Game Over", canvasWidth / 2, canvasHeight / 2, 48);
                drawText("Click to play again", canvasWidth / 2, canvasWidth / 2 + 25, 15);
                gameOn = false;
            }
        }
    }

    if (bird.y < canvasHeight - bird.radius) bird.velY += gravity;
    else bird.velY === 0;

    bird.y = clamp(0, canvasHeight - bird.radius, bird.y + bird.velY);
}


const draw = () => {
    ctx.strokeStyle = "#000000";
    for (let obj of objects) {
        ctx.beginPath()
        ctx.rect(obj.x, obj.y, obj.width, obj.height);
        ctx.rect(obj.x, obj.y + obj.height + objectGap, obj.width, canvasHeight - obj.height - objectGap);
        ctx.stroke();
    }
    ctx.beginPath();
    ctx.ellipse(bird.x, bird.y, bird.radius, bird.radius, Math.PI / 4, 0, 2 * Math.PI);
    ctx.stroke();

    drawText(`Score: ${currentPlayerScore}     High-Score: ${highScore}`, 150, 40, 15)
}

const spawnObstacles = () => {
    spawnerInterval = setInterval(() => {
        const newObj = { ...objectTemplate };
        newObj.height = getRandomNum(minHeight, canvasHeight * maxHeightMultiple);
        objects.push(newObj);
    }, spawnerSpeed)
}

const addPoints = () => {
    pointInterval = setInterval(() => {
        currentPlayerScore += 1
        if (currentPlayerScore > highScore) {
            highScore = currentPlayerScore
            localStorage.setItem("highScore", highScore)
        }
    }, spawnerSpeed)
}

canvas.onclick = () => {
    objects = [];
    bird.y = 300;
    bird.velY = 0;

    currentPlayerScore = 0;

    if (!gameOn) {
        gameOn = true;
        spawnObstacles();

        setTimeout(addPoints, 3600)

        gameLoop = setInterval(() => {
            clearCanvas();

            physics();
            draw();
        }, gameUpdateRate)
    }

}

drawText("Click to start playing!", canvasWidth / 2, canvasHeight / 2, 48);
