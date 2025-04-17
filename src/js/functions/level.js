//*#########################################################
//* ANCHOR -draw Waypoints
//*#########################################################

export function drawWaypoints(ctx, waypoints) {
  ctx.strokeStyle = "rgba(241, 207, 113, 0.9)";
  ctx.lineWidth = 20;
  ctx.beginPath();
  waypoints.forEach((waypoint, index) => {
    const adjustedY = waypoint.y + 40; // Verschiebe die y-Koordinate um 50 Pixel nach unten
    if (index === 0) {
      ctx.moveTo(waypoint.x, adjustedY);
    } else {
      ctx.lineTo(waypoint.x, adjustedY);
    }
    ctx.arc(waypoint.x, adjustedY, 2, 0, Math.PI * 2);
  });
  ctx.stroke();
}


const levels = [
  {
    name: 'Grassland',
    background_img_path: 'src/assets/bg/bg2.webp',
    waypoints: [  
      { x: -50, y: 20 },
      { x: 50, y: 20 },
      { x: 340, y: 20 },
      { x: 340, y: 110 },
      { x: 30, y: 110 },
      { x: 30, y: 180 },
      { x: 350, y: 180 },
      { x: 350, y: 260 },
      { x: 30, y: 260 },
      { x: 30, y: 340 },
      { x: 450, y: 340 }
    ],
    tower_places: [
      {
        x: 70,
        y: 15,
        tower_is_build: false,
        tower_damage_lvl: 1,
        tower_type: "",
        tower_img: "",
        range: 80,
        cooldown: 0,
      },
      {
        x: 295,
        y: 15,
        tower_is_build: false,
        tower_damage_lvl: 1,
        tower_type: "",
        tower_img: "",
        range: 80,
        cooldown: 0,
      },
      {
        x: 150,
        y: 95,
        tower_is_build: false,
        tower_damage_lvl: 1,
        tower_type: "",
        tower_img: "",
        range: 80,
        cooldown: 0,
      },
      {
        x: 90,
        y: 165,
        tower_is_build: false,
        tower_damage_lvl: 1,
        tower_type: "",
        tower_img: "",
        range: 80,
        cooldown: 0,
      },
      {
        x: 250,
        y: 245,
        tower_is_build: false,
        tower_damage_lvl: 1,
        tower_type: "",
        tower_img: "",
        range: 80,
        cooldown: 0,
      },
      {
        x: 130,
        y: 330,
        tower_is_build: false,
        tower_damage_lvl: 1,
        tower_type: "",
        tower_img: "",
        range: 80,
        cooldown: 0,
      },
      {
        x: 350,
        y: 330,
        tower_is_build: false,
        tower_damage_lvl: 1,
        tower_type: "",
        tower_img: "",
        range: 80,
        cooldown: 0,
      },
      {
        x: 300,
        y: 330,
        tower_is_build: false,
        tower_damage_lvl: 1,
        tower_type: "",
        tower_img: "",
        range: 80,
        cooldown: 0,
      },
      {
        x: 180,
        y: 330,
        tower_is_build: false,
        tower_damage_lvl: 1,
        tower_type: "",
        tower_img: "",
        range: 80,
        cooldown: 0,
      },
      {
        x: 280,
        y: 165,
        tower_is_build: false,
        tower_damage_lvl: 1,
        tower_type: "",
        tower_img: "",
        range: 80,
        cooldown: 0,
      },
      {
        x: 90,
        y: 245,
        tower_is_build: false,
        tower_damage_lvl: 1,
        tower_type: "",
        tower_img: "",
        range: 80,
        cooldown: 0,
      },
      {
        x: 300,
        y: 245,
        tower_is_build: false,
        tower_damage_lvl: 1,
        tower_type: "",
        tower_img: "",
        range: 80,
        cooldown: 0,
      },
      {
        x: 195,
        y: 245,
        tower_is_build: false,
        tower_damage_lvl: 1,
        tower_type: "",
        tower_img: "",
        range: 80,
        cooldown: 0,
      },
      {
        x: 360,
        y: 60,
        tower_is_build: false,
        tower_damage_lvl: 1,
        tower_type: "",
        tower_img: "",
        range: 80,
        cooldown: 0,
      },
      {
        x: 210,
        y: 95,
        tower_is_build: false,
        tower_damage_lvl: 1,
        tower_type: "",
        tower_img: "",
        range: 80,
        cooldown: 0,
      }
    ]
  },
  {
    name: 'Desert',
    background_img_path: 'src/assets/bg/desert_bg.png',
    waypoints: [
      { x: -50, y: 80 },
      { x: 50, y: 80 },
      { x: 110, y: 80 },
      { x: 110, y: 0 },
      { x: 270, y: 0 },
      { x: 270, y: 110 },
      { x: 140, y: 110 },
      { x: 140, y: 190 },
      { x: 360, y: 190 },
      { x: 360, y: 250 },
      { x: 110, y: 250 },
      { x: 110, y: 330 },
      { x: 450, y: 330 }],
    tower_places: [
      {
        x: 60,
        y: 15,
        tower_is_build: false,
        tower_damage_lvl: 1,
        tower_type: "",
        tower_img: "",
        range: 80,
        cooldown: 0,
      },
      {
        x: 295,
        y: 15,
        tower_is_build: false,
        tower_damage_lvl: 1,
        tower_type: "",
        tower_img: "",
        range: 80,
        cooldown: 0,
      },
      {
        x: 150,
        y: 95,
        tower_is_build: false,
        tower_damage_lvl: 1,
        tower_type: "",
        tower_img: "",
        range: 80,
        cooldown: 0,
      },
      {
        x: 10,
        y: 185,
        tower_is_build: false,
        tower_damage_lvl: 1,
        tower_type: "",
        tower_img: "",
        range: 80,
        cooldown: 0,
      },
      {
        x: 50,
        y: 345,
        tower_is_build: false,
        tower_damage_lvl: 1,
        tower_type: "",
        tower_img: "",
        range: 80,
        cooldown: 0,
      },
      {
        x: 130,
        y: 320,
        tower_is_build: false,
        tower_damage_lvl: 1,
        tower_type: "",
        tower_img: "",
        range: 80,
        cooldown: 0,
      },
      {
        x: 350,
        y: 320,
        tower_is_build: false,
        tower_damage_lvl: 1,
        tower_type: "",
        tower_img: "",
        range: 80,
        cooldown: 0,
      },
      {
        x: 300,
        y: 320,
        tower_is_build: false,
        tower_damage_lvl: 1,
        tower_type: "",
        tower_img: "",
        range: 80,
        cooldown: 0,
      },
      {
        x: 180,
        y: 320,
        tower_is_build: false,
        tower_damage_lvl: 1,
        tower_type: "",
        tower_img: "",
        range: 80,
        cooldown: 0,
      },
      {
        x: 200,
        y: 175,
        tower_is_build: false,
        tower_damage_lvl: 1,
        tower_type: "",
        tower_img: "",
        range: 80,
        cooldown: 0,
      },
      {
        x: 82,
        y: 220,
        tower_is_build: false,
        tower_damage_lvl: 1,
        tower_type: "",
        tower_img: "",
        range: 80,
        cooldown: 0,
      },
      {
        x: 300,
        y: 245,
        tower_is_build: false,
        tower_damage_lvl: 1,
        tower_type: "",
        tower_img: "",
        range: 80,
        cooldown: 0,
      },
      {
        x: 165,
        y: 245,
        tower_is_build: false,
        tower_damage_lvl: 1,
        tower_type: "",
        tower_img: "",
        range: 80,
        cooldown: 0,
      },
      {
        x: 360,
        y: 60,
        tower_is_build: false,
        tower_damage_lvl: 1,
        tower_type: "",
        tower_img: "",
        range: 80,
        cooldown: 0,
      },
      {
        x: 210,
        y: 95,
        tower_is_build: false,
        tower_damage_lvl: 1,
        tower_type: "",
        tower_img: "",
        range: 80,
        cooldown: 0,
      }
    ]
  }
];

export function random_level() {
    const rnd_index = Math.floor(Math.random() * levels.length);
    return levels[rnd_index];
}
