import type { APIRoute } from 'astro';
import { startingPointSvg } from '../../../lib/starting-point-example';
import type { StartPoint } from '../../../lib/layout';

export function getStaticPaths() {
  return ['corner', 'center'].map(start => ({ params: { start } }));
}

export const GET: APIRoute = ({ params }) => new Response(startingPointSvg(params.start as StartPoint), {
  headers: { 'Content-Type': 'image/svg+xml' },
});
