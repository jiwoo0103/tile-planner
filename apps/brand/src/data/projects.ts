import { publicOrigin } from '../../../../scripts/site-config.mjs';

export interface Project {
  id: string;
  name: string;
  category: string;
  summary: string;
  detailPath: string;
  siteKey?: 'tile';
  // Other finished projects can supply their approved public origin in this file.
  siteUrl?: string;
  image: string;
  imageAlt: string;
  tools: { name: string; path: string; description: string }[];
}

// Only implemented projects belong here. Tile Planner's origin comes from build configuration.
export const projects: Project[] = [{
  id: 'tile-planner',
  name: 'Tile Planner',
  category: 'Home improvement · Planning tools',
  summary: 'Turn room measurements into a tile purchase estimate, then inspect the edges of a straight tile layout.',
  detailPath: '/projects/tile-planner/',
  siteKey: 'tile',
  image: '/images/tile-planner/calculator-desktop.png',
  imageAlt: 'Actual Tile Planner calculator showing a 120 square foot room, 132 required tiles and 14 boxes.',
  tools: [
    { name: 'Tile calculator', path: '/calculator/', description: 'Estimate tiles, full boxes and optional tile cost.' },
    { name: '2D layout planner', path: '/layout/', description: 'Compare corner and centered starts, full tiles and edge cuts.' },
    { name: 'Planning guides', path: '/guides/', description: 'Four worked guides on measuring, allowance, whole boxes and starting points.' },
  ],
}];

export function projectUrl(project: Project, origins: Partial<Record<NonNullable<Project['siteKey']>, string>>, path = '/') {
  const origin = project.siteKey ? origins[project.siteKey] : publicOrigin(project.siteUrl, `${project.id} siteUrl`);
  return origin ? new URL(path, origin).href : undefined;
}

// A project-specific walkthrough, separate from the tile site's article examples.
export const tileWalkthrough = {
  inputs: {
    roomWidth: '9', roomWidthUnit: 'ft', roomLength: '11', roomLengthUnit: 'ft',
    tileWidth: '12', tileWidthUnit: 'in', tileLength: '24', tileLengthUnit: 'in',
    waste: '10', tilesPerBox: '8', pricePerBox: '48', grout: '2', orientation: '0', start: 'corner',
  },
  results: [
    { label: 'Room area', value: '99 sq ft' },
    { label: 'Tiles with allowance', value: '55 tiles' },
    { label: 'Whole boxes', value: '7 boxes' },
    { label: 'Purchased quantity', value: '56 tiles' },
    { label: 'Tile-only budget', value: '$336.00 USD' },
  ],
  calculatorPath: '',
  layoutPath: '',
};
const query = new URLSearchParams(tileWalkthrough.inputs).toString();
tileWalkthrough.calculatorPath = `/calculator/?${query}`;
tileWalkthrough.layoutPath = `/layout/?${query}`;
