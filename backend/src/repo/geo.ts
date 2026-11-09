import { sql, type RawBuilder } from 'kysely';

export interface LngLat {
  lng: number;
  lat: number;
}

/** Value for a geography(Point,4326) column. */
export function point({ lng, lat }: LngLat): RawBuilder<string> {
  return sql<string>`ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography`;
}

/** Longitude of a geography column reference such as `farmer_profiles.location`. */
export function lngOf(column: string): RawBuilder<number | null> {
  return sql<number | null>`ST_X(${sql.ref(column)}::geometry)`;
}

export function latOf(column: string): RawBuilder<number | null> {
  return sql<number | null>`ST_Y(${sql.ref(column)}::geometry)`;
}

/** Distance in metres between a geography column and a point. */
export function distanceMeters(column: string, from: LngLat): RawBuilder<number> {
  return sql<number>`ST_Distance(${sql.ref(column)}, ${point(from)})`;
}

/** True when the column is within radiusMeters of the point. Uses the GiST index. */
export function withinMeters(column: string, from: LngLat, radiusMeters: number): RawBuilder<boolean> {
  return sql<boolean>`ST_DWithin(${sql.ref(column)}, ${point(from)}, ${radiusMeters})`;
}
