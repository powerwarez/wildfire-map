export interface WildfireData {
    id: string;
    latitude: number;
    longitude: number;
    name?: string;
    intensity?: number;
    dateReported?: string;
    acresBurned?: number;
    containment?: number;
  }