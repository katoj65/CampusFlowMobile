// Pickup locations — still a hardcoded list mirroring the pickup_locations
// table's seed rows rather than a live fetch (unlike useMenu's categories).
import { ref } from 'vue';

export interface PickupLocation {
  id: number;
  name: string;
  building: string;
  walkTime: string;
  hours: string;
}

/** Mirrors supabase/migrations/0019_pickup_locations_numeric_id.sql — ids
 * are system-generated identity values, in the same order as that seed. */
export const pickupLocations: PickupLocation[] = [
  {
    id: 1,
    name: 'Mensa Ground Floor, Counter 2',
    building: 'Main Mensa',
    walkTime: '2 min',
    hours: '11:00 – 20:00',
  },
  {
    id: 2,
    name: 'Mensa Ground Floor, Counter 1',
    building: 'Main Mensa',
    walkTime: '2 min',
    hours: '11:00 – 20:00',
  },
  {
    id: 3,
    name: 'Library Café',
    building: 'Central Library',
    walkTime: '6 min',
    hours: '08:00 – 18:00',
  },
  {
    id: 4,
    name: 'Engineering Building Kiosk',
    building: 'Building C',
    walkTime: '9 min',
    hours: '09:00 – 16:00',
  },
];

const selectedLocationId = ref(1);

function setPickupLocation(id: number) {
  selectedLocationId.value = id;
}

export function usePickupLocation() {
  return { pickupLocations, selectedLocationId, setPickupLocation };
}
