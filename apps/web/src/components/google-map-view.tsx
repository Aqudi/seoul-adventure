"use client";

import React, { useEffect, useState } from 'react';
import {
  APIProvider,
  Map,
  Marker,
  useMap,
} from '@vis.gl/react-google-maps';

interface Spot {
  lat: number;
  lng: number;
  title: string;
}

interface Props {
  spots: Spot[];
  className?: string;
}

/**
 * Polyline 컴포넌트 (가상 경로 그리기)
 */
function MapPath({ spots }: { spots: Spot[] }) {
  const map = useMap();

  useEffect(() => {
    if (!map || spots.length < 2) return;

    const path = new google.maps.Polyline({
      path: spots.map(s => ({ lat: s.lat, lng: s.lng })),
      geodesic: true,
      strokeColor: '#C4634E', // 디자인의 seoul-accent 색상
      strokeOpacity: 0.8,
      strokeWeight: 4,
    });

    path.setMap(map);

    return () => {
      path.setMap(null);
    };
  }, [map, spots]);

  return null;
}

export default function GoogleMapView({ spots, className }: Props) {
  const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  // 기본 중심점 (첫 번째 스팟 혹은 서울 중심)
  const defaultCenter = spots.length > 0 
    ? { lat: spots[0].lat, lng: spots[0].lng } 
    : { lat: 37.5665, lng: 126.9780 };

  return (
    <div className={className}>
      <APIProvider apiKey={API_KEY}>
        <Map
          defaultCenter={defaultCenter}
          defaultZoom={15}
          gestureHandling={'greedy'}
          disableDefaultUI={true}
          className="w-full h-full"
        >
          {spots.map((spot, index) => (
            <Marker 
              key={index} 
              position={{ lat: spot.lat, lng: spot.lng }} 
              title={spot.title}
            />
          ))}
          <MapPath spots={spots} />
        </Map>
      </APIProvider>
    </div>
  );
}
