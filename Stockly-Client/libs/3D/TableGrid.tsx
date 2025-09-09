import { groupedStocks } from "@/models/Localizacoes";
import React, { JSX, useRef } from "react";
import { Vector3 } from "three";

type Props = {
  product?: groupedStocks | null;
  scale: number[]
};

type Cell = {
  placements: { id: string }[]; // small-box placements (we only need count + unique id)
  remainingArea: number;
  occupiedByBig?: boolean; // true if a big box covers the whole cell (or is spanning it)
};

export const TableGrid: React.FC<Props> = ({ product, scale }) => {

  /*return <>
    <Box pos={[1,0.4,0.5]} size={[40,30,60]} scale={scale} />
    <Box pos={[1,0.4,-0.5]} size={[40,30,60]} scale={scale} />
    
    <Box pos={[0,0.4,0.5]} size={[40,30,60]} scale={scale} />
    <Box pos={[0,0.4,-0.5]} size={[40,30,60]} scale={scale} />

    <Box pos={[-1,0.4,0.5]} size={[40,30,60]} scale={scale} />
    <Box pos={[-1,0.4,-0.5]} size={[40,30,60]} scale={scale} />

    <Box pos={[1,0.4,0.5]} size={[40,30,60]} scale={scale} />
    <Box pos={[1,0.4,-0.5]} size={[40,30,60]} scale={scale} />
    </>;*/
  if (!product) return null;

  // === Tunables / constants ===
  const GRID_SIZE = 40; // depth of one grid cell (units)
  const COLS = 2; // columns per shelf (left↔right)
  const ROWS = 3; // rows per shelf (front↔back)
  const SHELF_COUNT = 1; // number of shelves (matches original)

  // center of rack in X/Z (tweak these to match your scene)
  const RACK_CENTER_X = 0;   // previous code used roughly 25 for X-anchor
  const RACK_CENTER_Z = 0;  // choose a reasonable center for Z; tweak to match real layout

   const ANCHOR_X = 1;
  const ANCHOR_Z = 0.5;

  const cellArea = GRID_SIZE * GRID_SIZE;

  // Internal representation of shelves and grid cell occupancy.
  // Each cell tracks how many units from its start have been used (used) and remaining capacity.
  const shelves: Cell[][][] = Array.from({ length: SHELF_COUNT }, () =>
    Array.from({ length: COLS }, () =>
      Array.from({ length: ROWS }, () => ({ placements: [], remainingArea: cellArea, occupiedByBig: false }))
    )
  );

  const boxes: JSX.Element[] = [];

  // helpers to compute cell center coordinates
  const cellCenterX = (row: number) => ANCHOR_X - row;
  const cellCenterZ = (col: number) => ANCHOR_Z - col/1.2;

  // Try to place product.quantity identical boxes
  for (let itemIndex = 0; itemIndex < product.quantity; itemIndex++) {
    const boxW = product.productX; // X-dimension (width)
    const boxH = product.productY; // Y-dimension (height)
    const boxD = product.productZ; // Z-dimension (depth)

    // how many grid cells this box spans in each axis
    const spanCols = Math.ceil(boxW / GRID_SIZE) > 1 ? 2 : 1; // horizontal cells required
    const spanRows = 1; // depth cells required

    let placed = false;

    // If box spans more than the available columns/rows, it can't fit on a single shelf
    if (spanCols > COLS || spanRows > ROWS) {
      console.warn(
        `Box #${itemIndex + 1} (W=${boxW}, D=${boxD}) cannot fit on a shelf (needs ${spanCols}×${spanRows} cells)`
      );
      continue;
    }

    // CASE A: Box spans multiple cells (or >1 in any dimension) -> requires contiguous free cells
    if (spanCols == 2) {
      console.log('in 1st')
      outerBig: for (let s = 0; s < SHELF_COUNT && !placed; s++) {
        for (let rowStart = 0; rowStart <= ROWS - spanRows && !placed; rowStart++) {
          for (let colStart = 0; colStart <= COLS - spanCols && !placed; colStart++) {
            // Check all cells in the block are fully free (no small placements and not occupiedByBig)
            let canUse = true;
            for (let r = rowStart; r < rowStart + spanRows && canUse; r++) {
              for (let c = colStart; c < colStart + spanCols && canUse; c++) {
                const cell = shelves[s][c][r];
                // require cell to be entirely free
                if (cell.occupiedByBig || cell.placements.length > 0 || cell.remainingArea < cellArea) {
                  canUse = false;
                }
              }
            }

            if (!canUse) continue;

            // allocate: mark all cells as occupied by this big box
            for (let r = rowStart; r < rowStart + spanRows; r++) {
              for (let c = colStart; c < colStart + spanCols; c++) {
                const cell = shelves[s][c][r];
                cell.occupiedByBig = true;
                cell.remainingArea = 0;
                cell.placements = []; // clear (should already be empty)
              }
            }

            // offsets from the cell center
            const offsetX = -GRID_SIZE / 2 + (colStart + 0.5);
            const offsetZ = -GRID_SIZE / 2 + (20.5);

            // compute block center (world coords)
            const blockCenterX = cellCenterX(rowStart);
            const blockCenterZ = cellCenterZ(colStart);
            
            const posX = blockCenterX ;
            const posZ = blockCenterZ - offsetZ;
            const posY = 0.4; // sit on shelf

            boxes.push(
              <Box
                key={`box-${itemIndex}-big-s${s}-r${rowStart}-c${colStart}`}
                size={[boxW, boxH, boxD]}
                pos={[posX, posY, posZ]}
                scale={scale}
                dep={product.departamento}
              />
            );

            placed = true;
            break outerBig;
          }
        }
      }
    } else {
      // CASE B: Box fits in a single cell -> try to pack into a cell (allow multiple per cell)
      // Determine how many internal slots we can subdivide the cell into (based on integer fit)
      // (integer fit prevents overlap and arranges multiple same-size boxes in a simple grid inside the cell)
      const internalCols = Math.max(1, Math.floor(GRID_SIZE / boxW)); // how many boxes side-by-side fit in a cell
      const internalRows = Math.max(1, Math.floor(GRID_SIZE / boxD)); // how many boxes front-back fit in a cell
      const capacityPerCell = Math.max(1, internalCols * internalRows);

      outerSmall: for (let s = 0; s < SHELF_COUNT && !placed; s++) {
        for (let c = 0; c < COLS && !placed; c++) {
            for (let r = 0; r < ROWS && !placed; r++) {
                const cell = shelves[s][c][r];

                // if a big box occupies this cell, skip
                if (cell.occupiedByBig) continue;

                // If there's still capacity (using integer-fit subdivision), place it
                if (cell.placements.length < capacityPerCell) {
                const indexInCell = cell.placements.length;

                // compute internal subcell coords
                const localCol = indexInCell % internalCols;
                const localRow = Math.floor(indexInCell / internalCols) % internalRows;

                const subW = GRID_SIZE / internalCols;
                const subD = GRID_SIZE / internalRows;

                // offsets from the cell center
                const offsetX = -GRID_SIZE / 2 + (localCol + 0.5) * subW;
                const offsetZ = -GRID_SIZE / 2 + (localCol + 0.5) * subW;

                const centerX = cellCenterX(r);
                const centerZ = cellCenterZ(c);

                const posX = (centerX) 
                const posZ = (centerZ + offsetZ/60)
                const posY = 0.4;

                // book-keeping: add placement
                cell.placements.push({ id: `box-${itemIndex}-s${s}-r${r}-c${c}-i${indexInCell}` });
                cell.remainingArea = Math.max(0, cell.remainingArea - boxW * boxD);

                boxes.push(
                    <Box
                    key={`box-${itemIndex}-s${s}-r${r}-c${c}-i${indexInCell}`}
                    size={[boxW-5, boxH, boxD]}
                    pos={[posX, posY, posZ]}
                    scale={scale}
                    dep={product.departamento}
                    />
                );

                placed = true;
                break outerSmall;
                } // else try next cell
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
    pos: [number,number,number],
    scale: number[],
    dep: number
}
const Box = ({size,pos,scale,dep}:boxProps) => {
  const meshRef = useRef(null)
  return (
    <mesh 
    scale={new Vector3(scale[0], scale[1], scale[2])}
    position={pos}
    rotation={[0,Math.PI/2,0]}
      ref={meshRef}>
      <boxGeometry args={[size[0]/2,size[1]/2,size[2]/3]} />
      <meshStandardMaterial color={dep == 1 ? '#ffffff' : dep == 2 ? 'hotpink' : dep == 3 ? 'green' : 'blue'} />
    </mesh>
  )
}