import { getEcuIdsForDomainFilter } from './homepageDomainFilters';
import { ecus } from '@/lib/data';

export interface GuidedTourStep {
  title: string;
  description: string;
  ecuIds: string[];
}

export const GUIDED_TOUR_STEPS: GuidedTourStep[] = [
  {
    title: 'ADAS & SENSORS',
    description: 'Camera, Radar, ADAS and USS ECUs form the perception and driver-assistance layer.',
    ecuIds: getEcuIdsForDomainFilter('ADAS', ecus),
  },
  {
    title: 'CENTRAL COMMUNICATION',
    description: 'Gateway and cockpit connectivity ECUs route cross-domain vehicle messages.',
    ecuIds: getEcuIdsForDomainFilter('COMMUNICATION', ecus),
  },
  {
    title: 'BODY & COMFORT',
    description: 'Body controllers, comfort modules and door ECUs manage cabin and access functions.',
    ecuIds: Array.from(
      new Set([
        ...getEcuIdsForDomainFilter('BODY', ecus),
        'door-fl',
        'door-fr',
        'door-rl',
        'door-rr',
        'pw-fl',
      ])
    ),
  },
  {
    title: 'POWERTRAIN',
    description: 'BMS, charging, engine, transmission, motor controller and inverter manage propulsion.',
    ecuIds: getEcuIdsForDomainFilter('POWERTRAIN', ecus),
  },
  {
    title: 'CHASSIS & SAFETY',
    description: 'ABS, ESP, steering, EPB and airbag ECUs provide chassis control and safety functions.',
    ecuIds: getEcuIdsForDomainFilter('CHASSIS', ecus),
  },
];
