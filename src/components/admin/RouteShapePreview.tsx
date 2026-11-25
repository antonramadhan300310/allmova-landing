"use client";

import { buildRoutePolyline, type RouteCoordinate } from "@/lib/curatedRoutes";

export function RouteShapePreview({
  coordinates,
  className = "h-28 w-full",
  showEndpoints = true,
}: {
  coordinates: RouteCoordinate[];
  className?: string;
  showEndpoints?: boolean;
}) {
  const polyline = buildRoutePolyline(coordinates);
  if (!polyline) return null;

  const vertices = polyline.split(" ");
  const start = vertices[0];
  const end = vertices[vertices.length - 1];

  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-label="Pratinjau bentuk jalur rute"
    >
      <polyline
        points={polyline}
        fill="none"
        stroke="#B9F51E"
        strokeOpacity={0.18}
        strokeWidth={6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline
        points={polyline}
        fill="none"
        stroke="#B9F51E"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {showEndpoints && (
        <>
          <circle cx={start.split(",")[0]} cy={start.split(",")[1]} r={2.6} fill="#D2FF66" />
          <circle cx={end.split(",")[0]} cy={end.split(",")[1]} r={2.6} fill="#0D1112" stroke="#B9F51E" strokeWidth={1.6} />
        </>
      )}
    </svg>
  );
}
