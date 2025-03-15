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

const tower_places = [
    { x: 70, y: 10, is_tower: false },
    { x: 260, y: 10, is_tower: false },
    { x: 90, y: 165, is_tower: false  },
    { x: 250, y: 245, is_tower: false  },
    { x: 130, y: 330, is_tower: false  },
    // { x: 350, y: 260, is_tower: false  },
    // { x: 30, y: 260, is_tower: false  },
    // { x: 30, y: 340, is_tower: false  },
    // { x: 450, y: 340, is_tower: false  },
];

const enemies = [];
const towerImage = new Image();
towerImage.src = 'src/assets/tower2.png';

function spawnEnemy() {
    const posX = -100;
    const posY = 20;
    const width = 60;
    const height = 80;
    const imgSrc = 'src/assets/orc.png';
    const scale = .6;
    const health = Math.floor(Math.random() * (250 - 90 + 1)) + 90;
    enemies.push(new Orc(posX, posY, width, height, imgSrc, scale, waypoints, health));
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

function drawTowerPlaces() {
    ctx.fillStyle = 'black';
    tower_places.forEach(place => {
        if (place.is_tower) {
            ctx.drawImage(towerImage, place.x, place.y, 30, 30);
        } else {
            ctx.fillRect(place.x, place.y, 30, 30);
        }
    });
}

function calculateDistance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Zuerst die Waypoints zeichnen
    drawWaypoints();

    // Tower Places zeichnen
    drawTowerPlaces();

    // Dann die Orcs darüber zeichnen
    enemies.forEach((enemy, index) => {
        enemy.update();

        // Überprüfen, ob der Orc in der Nähe eines Turms ist
        tower_places.forEach(place => {
            if (place.is_tower) {
                const distance = calculateDistance(enemy.pos_x, enemy.pos_y, place.x, place.y);
                
                // Zeichne den Radius um den Turm
                ctx.beginPath();
                ctx.arc(place.x + 15, place.y + 15, 80, 0, Math.PI * 2);
                ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
                ctx.lineWidth = 1;
                ctx.stroke();
                
                if (distance < 80) { // Radius von 80 Pixeln
                    enemy.health -= 1; // Schaden anwenden
                    console.log(`Orc health: ${enemy.health}`);
                    
                    if (enemy.health <= 0) {
                        enemy.markedForDeletion = true;
                    }
                }
            }
        });

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


// Event-Listener for click on Tower Place
canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    tower_places.forEach(place => {
        if (x >= place.x && x <= place.x + 30 && y >= place.y && y <= place.y + 30) {
            console.log('Tower place clicked:', place);
            if (!place.is_tower) {
                place.is_tower = true;
            }
        }
    });
});

// Start the game loop
gameLoop();

// Spawn a new enemy every 2 seconds
setInterval(spawnEnemy, 2000);