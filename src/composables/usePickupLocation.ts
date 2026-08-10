import { ref } from 'vue';

export interface PickupLocation {
  id: string;
  name: string;
  building: string;
  walkTime: string;
  hours: string;
}

export const pickupLocations: PickupLocation[] = [
  {
    id: 'mensa-c2',
    name: 'Mensa Ground Floor, Counter 2',
    building: 'Main Mensa',
    walkTime: '2 min',
    hours: '11:00 – 20:00',
  },
  {
    id: 'mensa-c1',
    name: 'Mensa Ground Floor, Counter 1',
    building: 'Main Mensa',
    walkTime: '2 min',
    hours: '11:00 – 20:00',
  },
  {
    id: 'library-cafe',
    name: 'Library Café',
    building: 'Central Library',
    walkTime: '6 min',
    hours: '08:00 – 18:00',
  },
  {
    id: 'engineering-kiosk',
    name: 'Engineering Building Kiosk',
    building: 'Building C',
    walkTime: '9 min',
    hours: '09:00 – 16:00',
  },
];

const selectedLocationId = ref('mensa-c2');

function setPickupLocation(id: string) {
  selectedLocationId.value = id;
}

export function usePickupLocation() {
  return { pickupLocations, selectedLocationId, setPickupLocation };
}
