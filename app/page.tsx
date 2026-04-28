import MapView from "@/components/MapView";
import { blooms } from "@/lib/blooms";

export default function HomePage() {
  return <MapView blooms={blooms} />;
}
