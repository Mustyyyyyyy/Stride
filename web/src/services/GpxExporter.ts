import { WorkoutActivity, GpsPoint } from '../types';

export class GpxExporter {
  /**
   * Convert a WorkoutActivity with GPS points/polyline into a standard GPX XML format
   */
  static generateGpxXml(workout: WorkoutActivity): string {
    const creator = 'Stride Fitness Tracker';
    const time = workout.startTime || new Date().toISOString();
    const title = this.escapeXml(workout.title || 'Workout Track');

    let trkptsXml = '';

    if (workout.gpsPoints && workout.gpsPoints.length > 0) {
      trkptsXml = workout.gpsPoints
        .map((pt) => {
          const ele = pt.altitude || 0;
          return `      <trkpt lat="${pt.latitude}" lon="${pt.longitude}">
        <ele>${ele}</ele>
        <time>${pt.timestamp}</time>
      </trkpt>`;
        })
        .join('\n');
    } else if (workout.polyline) {
      try {
        const coords: Array<[number, number]> = JSON.parse(workout.polyline);
        trkptsXml = coords
          .map(([lat, lon], idx) => {
            const ptTime = new Date(new Date(time).getTime() + idx * 5000).toISOString();
            return `      <trkpt lat="${lat}" lon="${lon}">
        <ele>15.0</ele>
        <time>${ptTime}</time>
      </trkpt>`;
          })
          .join('\n');
      } catch (e) {}
    }

    return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="${creator}" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${title}</name>
    <time>${time}</time>
  </metadata>
  <trk>
    <name>${title}</name>
    <type>${workout.type}</type>
    <trkseg>
${trkptsXml}
    </trkseg>
  </trk>
</gpx>`;
  }

  /**
   * Trigger browser file download of .gpx file
   */
  static downloadGpxFile(workout: WorkoutActivity): void {
    const xml = this.generateGpxXml(workout);
    const blob = new Blob([xml], { type: 'application/gpx+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const safeTitle = workout.title.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const filename = `stride_${safeTitle}_${workout.id}.gpx`;

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  private static escapeXml(unsafe: string): string {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}
