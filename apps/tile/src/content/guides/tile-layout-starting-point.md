---
title: Choose a tile layout starting point — corner or center
description: Compare the same room with corner and centered grids, see every edge width, and open both exact examples in the layout planner.
topic: Planning a layout
updatedDate: 2026-09-27
---

## What changes when you move the grid?

A full tile at one wall can leave a narrow cut at the opposite wall. Shifting the grid shares the available space between opposite edges, but it can also create more pieces that need cutting. The useful comparison is the actual edge dimensions and their position in your room, not a promise that one starting point is always best.

Here, the corner option leaves a **190 mm right edge**. The centered option gives **395 mm at both left and right edges**. Both use the same room, tiles and joints. The diagrams below use the layout planner's actual geometry and preserve the room's proportions.

“Starting point” describes the grid's position in this tool. It does not prescribe the order in which you spread adhesive or install tiles.

## Keep the inputs identical

This original example uses an imagined rectangular floor:

- Room width: **3200 mm**; room length: **4100 mm**.
- Tile material size: **600 × 600 mm**.
- Grout between pieces: **2 mm**; straight grid at **0°**.
- Purchase-only inputs: illustrative **10% allowance**, **4 tiles per box**, and no box price. These do not affect the geometry.

The 2 mm joint is a comparison input, not a recommendation for a particular product. No additional perimeter movement gap is included in these drawings. Resolve the actual joint and perimeter details with the product instructions and installer before using a plan for cutting.

Width runs left to right; length runs top to bottom. Gray pieces with solid outlines are full tiles. Teal pieces with dashed outlines need at least one cut. Thin outlines make the grid readable; the piece positions include the exact 2 mm joints, which are too small to inspect individually at this page scale.

## Option A: start with a full tile at the corner

<figure>
  <img src="/diagrams/starting-point/corner.svg" width="480" height="565" alt="Corner layout, six columns and seven rows. Left edge 600 mm, right 190 mm, top 600 mm, bottom 488 mm; 30 full tiles and 12 cut pieces." loading="lazy" />
  <figcaption>Same 3200 × 4100 mm floor: full tiles begin at the top-left corner, with cuts along the right and bottom walls.</figcaption>
</figure>

[Open the corner example in the layout planner](/layout/?roomWidth=3200&roomWidthUnit=mm&roomLength=4100&roomLengthUnit=mm&tileWidth=600&tileWidthUnit=mm&tileLength=600&tileLengthUnit=mm&grout=2&orientation=0&start=corner&waste=10&tilesPerBox=4).

Across the width, five full tiles and five joints leave **3200 − (5 × 600) − (5 × 2) = 190 mm** for the last piece. Along the length, six full tiles and six joints leave **4100 − (6 × 600) − (6 × 2) = 488 mm**.

The bottom-right piece measures **190 × 488 mm**. This is one piece cut in two directions, not two separate pieces. In this example the room ends at tile edges, so there is no trailing grout strip at either far wall. Other room sizes can end within a joint; the live tool reports that strip when it occurs.

A corner grid gives you a concrete option to review when a full tile at a particular boundary matters. Here the tradeoff is that the right edge is much narrower than the left. The tool cannot tell whether that boundary is visible, covered by cabinetry, or aligned with a doorway.

## Option B: center the grid with equal opposite edges

<figure>
  <img src="/diagrams/starting-point/center.svg" width="480" height="565" alt="Centered layout, six columns and seven rows. Left and right edges 395 mm; top and bottom edges 544 mm; 20 full tiles and 22 cut pieces." loading="lazy" />
  <figcaption>The grid shifts in both directions. Opposite edges match; all four corners are now cut pieces measuring 395 × 544 mm.</figcaption>
</figure>

[Open the centered example in the layout planner](/layout/?roomWidth=3200&roomWidthUnit=mm&roomLength=4100&roomLengthUnit=mm&tileWidth=600&tileWidthUnit=mm&tileLength=600&tileLengthUnit=mm&grout=2&orientation=0&start=center&waste=10&tilesPerBox=4).

The tool uses the smallest number of pieces **along each axis** that can span that axis with the specified joints. It then keeps the interior pieces full and makes the two edge pieces equal. This definition can put a grout joint or a tile on the room's centerline; it does not always put a full tile's center at the room's center.

For an axis longer than one tile, let **L** be the room dimension, **T** the tile dimension and **G** the joint, all in millimeters. The number of pieces is **N = round up [(L + G) ÷ (T + G)]**. Each edge then measures **E = [L − (N − 2)T − (N − 1)G] ÷ 2**.

- Width: N is **6**, leaving four full interior tiles. Each edge is **[3200 − (4 × 600) − (5 × 2)] ÷ 2 = 395 mm**.
- Length: N is **7**, leaving five full interior tiles. Each edge is **[4100 − (5 × 600) − (6 × 2)] ÷ 2 = 544 mm**.

An exact tile-and-joint fit remains uncut. If one tile covers an entire room axis, the tool uses one piece clipped to that dimension. “Fewest pieces” refers only to this straight row or column definition. It is not a search for the fewest cuts, source tiles or boxes.

## Compare the edges and piece counts

| Result | Corner | Centered |
| --- | --- | --- |
| Left edge | 600 mm | 395 mm |
| Right edge | 190 mm | 395 mm |
| Top edge | 600 mm | 544 mm |
| Bottom edge | 488 mm | 544 mm |
| Columns | 6 | 6 |
| Rows | 7 | 7 |
| Full tiles | 30 | 20 |
| Cut pieces | 12 | 22 |
| Total placed pieces | 42 | 42 |

These edge dimensions describe the piece's width at the left/right walls and its height at the top/bottom walls. They are not the amount removed from a source tile. Corner pieces have both an edge width and an edge height.

Centering makes the narrowest edge wider in this example, while increasing the number of cut pieces from 12 to 22. The totals still equal 42 because both grids have 6 columns and 7 rows. That does not establish which option uses less material: offcut reuse, cutting loss and breakage are not modeled. The area-based purchase estimate stays the same for both options; use the [waste allowance guide](/guides/tile-waste-allowance/) and [whole-box example](/guides/tile-box-purchase-example/) to understand that separate calculation.

## Make the installation decision on site

The model gives dimensions to compare. Your actual decision also needs the room's squareness, visible boundaries, thresholds, transitions, fixtures and the selected product's requirements. A rectangle cannot represent an out-of-square wall or a recess. Measure the room using the [measuring guide](/guides/how-to-measure-a-room-for-tile/) and review the real boundaries before treating any computed piece as a cut list.

As manufacturer context, [Marazzi USA's floor tile installation guidance](https://www.marazziusa.com/style-and-design/resources/how-to-install) calls for square center reference lines and a loose row of tiles in both directions with joint spacing. Its floor layout instructions describe adjusting the reference line when wall cuts are below half a tile. This supports checking a physical dry layout; it does not certify the tool's algorithm or these example inputs. Its floor instructions also include a perimeter gap, which this tool does not add.

For this example, half of 600 mm is 300 mm: the corner option's 190 mm right edge is below that value, while the centered option's 395 mm and 544 mm edges are above it. That comparison is useful context, not a universal pass/fail rule or approval for installation. Follow the requirements for your particular tile and assembly.

Open both examples, then replace the dimensions with your own measured values. Compare the four edges, identify the boundaries that matter in the actual room, and review a dry layout with the installer before deciding where the grid should sit. The preview supports a rectangular straight grid at 0° or 90°; it does not solve diagonal patterns, custom offsets or cutting optimization.

## Sources and verification

- [Tile Planner layout tool](/layout/): the source of both drawings, edge dimensions and placed-piece counts. Each diagram is generated from the same geometry calculation used by the live preview.
- [Marazzi USA — How to Install](https://www.marazziusa.com/style-and-design/resources/how-to-install), **Step-by-Step Floor Tile Installation**, layout and setting sections; checked September 27, 2026. The floor guidance is cited for context, not the separate wall installation section or a product-specific specification for this example.
