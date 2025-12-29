// Simple grid-based A* pathfinding
export const cellSize = 20;

export function createGrid(width, height, cell = cellSize) {
  const cols = Math.ceil(width / cell);
  const rows = Math.ceil(height / cell);
  const grid = new Array(rows);
  for (let r = 0; r < rows; r++) {
    grid[r] = new Array(cols).fill(0); // 0 = walkable, 1 = blocked
  }
  return { grid, cols, rows, cell };
}

export function buildObstaclesFromTowers(
  tower_places,
  gridObj,
  padPixels = 0,
  leftReduceCells = 0
) {
  const { grid, cols, rows, cell } = gridObj;
  // reset
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) grid[r][c] = 0;

  const leftReducePixels = Math.max(0, leftReduceCells * cell);

  tower_places.forEach((tower) => {
    if (!tower.tower_is_build) return;

    // If tower type requires specific block size (in cells), use that
    const typeBlocks = {
      destroyer: { w: 2, h: 2 },
      anti_air: { w: 2, h: 2 },
      slower: { w: 2, h: 2 },
      toxic: { w: 2, h: 2 },
      energy: { w: 2, h: 2 },
      mine: { w: 1, h: 1 },
      air_mine: { w: 1, h: 1 },
    };

    const blocks = typeBlocks[tower.tower_type];
    let startX, startY, endX, endY;

    if (blocks) {
      // compute using integer grid cells to avoid floating-point shifts
      const towerW = tower.width || 30;
      const towerH = tower.height || 30;
      const centerC = Math.round((tower.x + towerW / 2) / cell);
      const centerR = Math.round((tower.y + towerH / 2) / cell);
      const startC =
        centerC - Math.floor(blocks.w / 2) + leftReducePixels / cell;
      const startR = centerR - Math.floor(blocks.h / 2);
      const endC = startC + blocks.w - 1;
      const endR = startR + blocks.h - 1;
      // convert back to pixel extents (center-based not needed below)
      startX = startC * cell;
      startY = startR * cell;
      endX = (endC + 1) * cell - 1;
      endY = (endR + 1) * cell - 1;
    } else {
      // fallback: use padded rectangle around tower (default behavior)
      let padForTower = padPixels;
      // small special-case: slightly reduce padding for destroyer if not covered above
      if (tower.tower_type === "destroyer") {
        padForTower = Math.max(0, padPixels - cell);
      }
      startX = tower.x - padForTower + leftReducePixels;
      startY = tower.y - padForTower;
      endX = tower.x + 30 + padForTower;
      endY = tower.y + 30 + padForTower;
    }

    const x1 = Math.floor(startX / cell);
    const y1 = Math.floor(startY / cell);
    const x2 = Math.floor(endX / cell);
    const y2 = Math.floor(endY / cell);

    for (let r = y1; r <= y2; r++) {
      for (let c = x1; c <= x2; c++) {
        if (r >= 0 && r < rows && c >= 0 && c < cols) grid[r][c] = 1;
      }
    }
  });
}

function heuristic(a, b) {
  // Manhattan
  return Math.abs(a.r - b.r) + Math.abs(a.c - b.c);
}

export function findPath(startPx, endPx, gridObj) {
  const { grid, cols, rows, cell } = gridObj;
  const start = {
    c: Math.floor(startPx.x / cell),
    r: Math.floor(startPx.y / cell),
  };
  const end = { c: Math.floor(endPx.x / cell), r: Math.floor(endPx.y / cell) };

  // clamp
  start.c = Math.max(0, Math.min(cols - 1, start.c));
  start.r = Math.max(0, Math.min(rows - 1, start.r));
  end.c = Math.max(0, Math.min(cols - 1, end.c));
  end.r = Math.max(0, Math.min(rows - 1, end.r));

  const openSet = [];
  const cameFrom = new Array(rows)
    .fill(null)
    .map(() => new Array(cols).fill(null));
  const gScore = new Array(rows)
    .fill(null)
    .map(() => new Array(cols).fill(Infinity));
  const fScore = new Array(rows)
    .fill(null)
    .map(() => new Array(cols).fill(Infinity));

  gScore[start.r][start.c] = 0;
  fScore[start.r][start.c] = heuristic(start, end);
  openSet.push({ r: start.r, c: start.c, f: fScore[start.r][start.c] });

  const neighbors = [
    [0, 1],
    [1, 0],
    [0, -1],
    [-1, 0],
  ]; // 4-dir

  while (openSet.length > 0) {
    // get lowest f
    openSet.sort((a, b) => a.f - b.f);
    const current = openSet.shift();
    if (current.r === end.r && current.c === end.c) {
      // reconstruct path
      const path = [];
      let cur = current;
      while (cur) {
        path.push({
          x: cur.c * cell + Math.floor(cell / 2),
          y: cur.r * cell + Math.floor(cell / 2),
        });
        cur = cameFrom[cur.r][cur.c];
      }
      path.reverse();
      return path;
    }

    for (const nb of neighbors) {
      const nr = current.r + nb[1];
      const nc = current.c + nb[0];
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      if (grid[nr][nc] === 1) continue; // blocked
      const tentative_g = gScore[current.r][current.c] + 1;
      if (tentative_g < gScore[nr][nc]) {
        cameFrom[nr][nc] = current;
        gScore[nr][nc] = tentative_g;
        fScore[nr][nc] = tentative_g + heuristic({ r: nr, c: nc }, end);
        if (!openSet.some((n) => n.r === nr && n.c === nc)) {
          openSet.push({ r: nr, c: nc, f: fScore[nr][nc] });
        }
      }
    }
  }

  // no path
  return null;
}
