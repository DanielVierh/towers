import { Orc } from './classes/Orc.js';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 400;
canvas.height = 400;

const waypoints = [
    { x: 50, y: 20 },
    { x: 350, y: 20 },
    { x: 350, y: 100 },
    { x: 30, y: 100 },
    { x: 30, y: 180 },
    { x: 350, y: 180 },
    { x: 350, y: 260 },
    { x: 30, y: 260 },
    { x: 30, y: 340 },
    { x: 450, y: 340 },
];

const enemies = [];

function spawnEnemy() {
    const posX = -100;
    const posY = 20;
    const width = 60;
    const height = 80;
    const imgSrc = 'src/assets/orc.png';
    const scale = .6;
    enemies.push(new Orc(posX, posY, width, height, imgSrc, scale, waypoints));
    console.log(enemies);
}

function drawWaypoints() {
    ctx.strokeStyle = 'beige';
    ctx.lineWidth = 30;
    ctx.beginPath();
    waypoints.forEach((waypoint, index) => {
        const adjustedY = waypoint.y + 40; // Verschiebe die y-Koordinate um 50 Pixel nach unten
        if (index === 0) {
            ctx.moveTo(waypoint.x, adjustedY);
        } else {
            ctx.lineTo(waypoint.x, adjustedY);
        }
        ctx.arc(waypoint.x, adjustedY, 5, 0, Math.PI * 2);
    });
    ctx.stroke();
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Zuerst die Waypoints zeichnen
    drawWaypoints();

    // Dann die Orcs darüber zeichnen
    enemies.forEach((enemy, index) => {
        enemy.update();
        if (enemy.markedForDeletion) {
            enemies.splice(index, 1);
        } else {
            enemy.draw(ctx);
        }
    });

    setTimeout(() => {
        gameLoop()
    }, 20);
}

// Start the game loop
gameLoop();

// Spawn a new enemy every 2 seconds
setInterval(spawnEnemy, 2000);