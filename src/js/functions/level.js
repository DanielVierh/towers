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