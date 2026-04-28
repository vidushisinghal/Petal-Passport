import raw from "@/petal_passport_blooms.json";

export interface Bloom {
  id: string;
  flower: string;
  location: string;
  country: string;
  continent: string;
  lat: number;
  lng: number;
  seasonStart: string;
  seasonEnd: string;
  peakStart: string;
  peakEnd: string;
  variety: string;
  tip: string;
  isPersonal: boolean;
  personalNote?: string;
  accentColor: string;
  story: string;
}

export const blooms: Bloom[] = raw as Bloom[];

export function getBloom(id: string): Bloom | undefined {
  return blooms.find((b) => b.id === id);
}
