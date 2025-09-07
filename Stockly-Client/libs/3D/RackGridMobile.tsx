import { groupedStocks } from "@/models/Localizacoes";
import React, { JSX, useRef } from "react";

type Props = {
  product?: groupedStocks | null;
};

type Cell = {
  placements: { id: string }[]; // small-box placements (we only need count + unique id)
  remainingArea: number;
  occupiedByBig?: boolean; // true if a big box covers the whole cell (or is spanning it)
};

export const RackGridMobile: React.FC<Props> = ({ product }) => {
  if (!product) return null;


  // === Tunables / constants ===
  const GRID_SIZE = 10; // depth of one grid cell (units)
  const CELL_SIZE = 40 / 10; 
  const COLS = 4; // columns per shelf (left↔right)
  const ROWS = 2; // rows per shelf (front↔back)
  const SHELF_COUNT = 5; // number of shelves (matches original)
  const baseZStart = -110; // z coordinate of the *start edge* of cell 0
  const shelfYBase = 110; // top shelf Y
  const shelfYStep = -53;  // spacing between shelves (approx from original)

 const ANCHOR_X = 2;
  const ANCHOR_Z = -10;

  // center of rack in X/Z (tweak these to match your scene)
  const RACK_CENTER_X = 40;   // previous code used roughly 25 for X-anchor
  const RACK_CENTER_Z = -80;  // choose a reasonable center for Z; tweak to match real layout

  const cellArea = GRID_SIZE * CELL_SIZE;

  // Precompute shelf Y coordinates (center of shelf base; we'll add product height/2 later)
  const SHELF_Y = [24.5, 19.2, 14, 8.5, 3];

  // Internal representation of shelves and grid cell occupancy.
  // Each cell tracks how many units from its start have been used (used) and remaining capacity.
  const shelves: Cell[][][] = Array.from({ length: SHELF_COUNT }, () =>
    Array.from({ length: ROWS }, () =>
      Array.from({ length: COLS }, () => ({ placements: [], remainingArea: cellArea, occupiedByBig: false }))
    )
  );

  const boxes: JSX.Element[] = [];

    const cellOriginX = (row: number) => ANCHOR_X + row * CELL_SIZE;
  const cellOriginZ = (col: number) => ANCHOR_Z + col * CELL_SIZE;

  // helpers to compute cell center coordinates
  // helper: compute center of block spanning spanRows × spanCols starting at (rowStart, colStart)
  const blockCenter = (rowStart: number, colStart: number, spanRows: number, spanCols: number) => {
    // centerX = anchorX + (rowStart + (spanRows-1)/2) * CELL_SIZE
    const centerX = ANCHOR_X + (rowStart + (spanRows - 1) / 2) * CELL_SIZE;
    const centerZ = ANCHOR_Z + (colStart + (spanCols - 1) / 2) * CELL_SIZE;
    return { centerX, centerZ };
  };

  // place each product instance
  for (let itemIndex = 0; itemIndex < product.quantity; itemIndex++) {
    // scaled sizes (do NOT change sizes beyond this scaling)
    const boxW = product.productX / 10; // X (width) on mobile
    const boxH = product.productY / 10;
    const boxD = product.productZ / 10; // Z (depth) on mobile

    // how many cells the box requires (ceiling)
    const spanCols = 1 // along Z (cols)
    const spanRows = Math.ceil(boxW / CELL_SIZE) > 1 ? 1 : 2; // along X (rows)

    // reject impossible sizes (can't fit on a shelf)
    if (spanRows > ROWS || spanCols > COLS) {
      console.warn(
        `RackGridMobile: box #${itemIndex + 1} (W=${boxW},D=${boxD}) needs ${spanRows}×${spanCols} cells — won't fit on shelf`
      );
      continue;
    }

    let placed = false;

    // --- Case: box spans multiple cells (big box) OR spans >1 in either axis
    if (spanRows == 1) {
      outerBig: for (let s = 0; s < SHELF_COUNT && !placed; s++) {
        for (let rowStart = 0; rowStart < ROWS - spanRows && !placed; rowStart++) {
          for (let colStart = 0; colStart <= COLS - spanCols && !placed; colStart++) {
            // check all cells in block are free
            let canUse = true;
            for (let r = rowStart; r < rowStart + spanRows && canUse; r++) {
              for (let c = colStart; c < colStart + spanCols && canUse; c++) {
                const cell = shelves[s][r][c];
                if (cell.occupiedByBig || cell.placements.length > 0 || cell.remainingArea < cellArea){
                 canUse = false;
                }  
              }
            }
            if (!canUse) continue;

            // allocate: mark cells occupiedByBig
            for (let r = rowStart; r < rowStart + spanRows; r++) {
              for (let c = colStart; c < colStart + spanCols; c++) {
                shelves[s][r][c].occupiedByBig = true;
                shelves[s][r][c].placements = [];
                shelves[s][r][c].remainingArea = 0;
              }
            }

            // compute world center for the spanned block
            const { centerX, centerZ } = blockCenter(rowStart, colStart, spanRows, spanCols);
            
            const offsetX = -CELL_SIZE / 1.5 + (0.5);

            const posX = centerX + offsetX; // anchored grid coordinates already match desired mobile layout
            const posZ = centerZ + (boxD/2*colStart);
            const posY = SHELF_Y[s] - boxH/12;

            boxes.push(
              <Box
                key={`box-${itemIndex}-big-s${s}-r${rowStart}-c${colStart}`}
                size={[boxW, boxH, boxD]}
                pos={[posX, posY, posZ]}
              />
            );

            placed = true;
            break outerBig;
          }
        }
      }
    } else {
      const internalCols = Math.max(1, Math.floor(CELL_SIZE / boxW)); // how many boxes side-by-side fit in a cell
      const internalRows = Math.max(1, Math.floor(CELL_SIZE / boxD)); // how many boxes front-back fit in a cell
      const capacityPerCell = Math.max(1, internalCols * internalRows);
      // --- Case: small box fits in a single cell -> allow multiple per cell via integer grid packing
      outerSmall: for (let s = 0; s < SHELF_COUNT && !placed; s++) {
        // column-first packing (fills columns then rows) could be swapped if desired.
        for (let col = 0; col < COLS && !placed; col++) {
          for (let row = 0; row < ROWS && !placed; row++) {
            const cell = shelves[s][row][col];

            if (cell.occupiedByBig) continue; // can't place in a cell taken by a big box

            // check area available
            if (cell.remainingArea < boxW * boxD) continue; // not enough free area in this cell

            // determine how many boxes of this size fit in the cell along each axis (integer fit)
            const fitInRow = Math.max(1, Math.floor(CELL_SIZE / boxW)); // along X inside cell
            const fitInCol = Math.max(1, Math.floor(CELL_SIZE / boxD)); // along Z inside cell
            const capacity = fitInRow * fitInCol;

            // also verify capacity isn't exceeded
            if (cell.placements.length >= capacity) continue;

            const indexInCell = cell.placements.length;
            const localCol = indexInCell % fitInRow; // position along X inside cell
            const localRow = Math.floor(indexInCell / fitInRow) % fitInCol; // position along Z inside cell

            // compute intra-cell offsets so boxes do not overlap, WITHOUT changing box sizes
            // Put the group of boxes centered inside the cell:
            const groupWidth = fitInRow * boxW;
            const groupDepth = fitInCol * boxD;

            // left/top of cell origin
            const cellX0 = cellOriginX(row);
            const cellZ0 = cellOriginZ(col);

            const subW = CELL_SIZE / internalCols;
            const subD = CELL_SIZE / internalRows;

            // offset to start of group so the group of boxes is centered inside the cell
            const offsetX = -GRID_SIZE / 2 + (localCol + 0.5) * subW;
            const offsetZ = -GRID_SIZE / 2 + (localRow + 0.5) * subD;

            // compute position of this sub-slot (center of box)
            const posX = cellX0 + offsetX;
            const posZ = cellZ0 + (boxD/1.8*col);
            const posY = SHELF_Y[s];

            // book-keeping: record placement and subtract occupied area
            cell.placements.push({ id: `box-${itemIndex}-s${s}-r${row}-c${col}-i${indexInCell}` });
            cell.remainingArea = Math.max(0, cell.remainingArea - boxW * boxD);

            boxes.push(
              <Box
                key={`box-${itemIndex}-s${s}-r${row}-c${col}-i${indexInCell}`}
                size={[boxW, boxH, boxD]}
                pos={[posX, posY, posZ]}
              />
            );

            placed = true;
            break outerSmall;
          }
        }
      }
    }

    if (!placed) {
      console.warn(`RackGrid2D: could not place box #${itemIndex + 1} (W=${boxW}, D=${boxD}) — rack full`);
    }
  }
  return <>{boxes}</>;
};

interface boxProps{
    size: [number,number,number],
    pos: [number,number,number]
}
const Box = ({size,pos}:boxProps) => {
  const meshRef = useRef(null)
  return (
    <mesh 
    position={pos}
      ref={meshRef}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={'hotpink'} />
    </mesh>
  )
}