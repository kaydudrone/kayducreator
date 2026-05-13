import gpxParser from 'gpxparser';

/**
 * Extracts distance, elevation gain, and peak from a GPX file string.
 * @param {string} gpxString - The raw GPX XML string.
 * @returns {object} - { distance: string, elevGain: string, peak: string }
 */
export function extractGpxData(gpxString) {
  const gpx = new gpxParser();
  gpx.parse(gpxString);
  
  let distance = 0;
  let elevGain = 0;
  let peak = 0;

  if (gpx.tracks && gpx.tracks.length > 0) {
    distance = (gpx.tracks[0].distance.total / 1000).toFixed(2); // km
    elevGain = gpx.tracks[0].elevation.pos ? gpx.tracks[0].elevation.pos.toFixed(0) : 0; // m
    peak = gpx.tracks[0].elevation.max ? gpx.tracks[0].elevation.max.toFixed(0) : 0; // m
  } else if (gpx.routes && gpx.routes.length > 0) {
    distance = (gpx.routes[0].distance.total / 1000).toFixed(2); // km
    elevGain = gpx.routes[0].elevation.pos ? gpx.routes[0].elevation.pos.toFixed(0) : 0; // m
    peak = gpx.routes[0].elevation.max ? gpx.routes[0].elevation.max.toFixed(0) : 0; // m
  }

  return { distance, elevGain, peak };
}
