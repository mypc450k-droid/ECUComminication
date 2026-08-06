import type { SimulationStep } from '@/types/simulation';
import type { SignalEvolutionStage } from '../types';

export function buildSignalEvolution(step: SimulationStep): SignalEvolutionStage[] {
  const stages: SignalEvolutionStage[] = [];

  if (step.type === 'input' || step.type === 'switch') {
    stages.push(
      { layer: 'GPIO', oldRepresentation: 'Mechanical contact', newRepresentation: '3.3V / 0V', format: 'physical' },
      { layer: 'ADC Sample', oldRepresentation: 'Analog voltage', newRepresentation: toBinary(3300), format: 'binary' },
      { layer: 'Digital Input', oldRepresentation: 'Raw ADC counts', newRepresentation: 'true', format: 'boolean' },
    );
  }

  if (step.type === 'swc' || step.type === 'ecu') {
    stages.push(
      { layer: 'Application SWC', oldRepresentation: 'Boolean input', newRepresentation: `${step.signalName || 'Request'}=true`, format: 'engineering' },
    );
  }

  if (step.type === 'com' || step.canId) {
    const payload = step.payload || '0x01';
    stages.push(
      { layer: 'COM Signal Pack', oldRepresentation: 'Engineering value', newRepresentation: payload, format: 'hex' },
      { layer: 'PDU Assembly', oldRepresentation: payload, newRepresentation: `PDU ${step.canId || '0x245'}`, format: 'engineering' },
    );
  }

  if (step.type === 'can' || step.type === 'bus' || step.type === 'canif' || step.type === 'candrv') {
    stages.push(
      { layer: 'CAN Frame', oldRepresentation: step.canId || '0x245', newRepresentation: formatCanFrame(step), format: 'can' },
      { layer: 'CAN Bus', oldRepresentation: 'Differential pair', newRepresentation: 'CAN_H/CAN_L animated frame', format: 'engineering' },
    );
  }

  if (step.type === 'mcal' || step.type === 'driver') {
    stages.push(
      { layer: 'PWM / Driver', oldRepresentation: 'Logic command', newRepresentation: '12V actuator drive', format: 'physical' },
    );
  }

  if (step.type === 'output' || step.type === 'hardware') {
    stages.push(
      { layer: 'Physical Output', oldRepresentation: 'Electrical drive', newRepresentation: step.title, format: 'physical' },
    );
  }

  if (stages.length === 0) {
    stages.push(
      { layer: step.title, oldRepresentation: 'Previous state', newRepresentation: step.engineeringExplanation.slice(0, 60), format: 'engineering' },
    );
  }

  return stages;
}

function toBinary(value: number): string {
  return value.toString(2).padStart(16, '0');
}

function formatCanFrame(step: SimulationStep): string {
  const id = step.canId || '0x245';
  const dlc = step.lengthBytes || 8;
  const data = step.payload || '01 00 00 00 00 00 00 00';
  return `ID:${id} DLC:${dlc} Data:${data}`;
}

export function packetFromMessage(msg: {
  id: string;
  canId: string;
  network: string;
  source: string;
  destination: string;
  signal: string;
  timestamp: string;
  status: string;
}) {
  const dlc = 8;
  const rawBytes = msg.canId.replace('0x', '').padStart(2, '0') + ' 50 01 01 00 00 00 00 00';
  return {
    id: msg.id,
    canId: msg.canId,
    extended: msg.canId.length > 6,
    dlc,
    rawBytes,
    decodedSignals: [msg.signal, `Status: ${msg.status}`],
    dbcName: msg.signal.replace(/\s+/g, '_'),
    cycleTimeMs: 100,
    sender: msg.source,
    receiver: msg.destination,
    aliveCounter: Math.floor(Math.random() * 15),
    checksum: '0xA3',
    busLoad: '34%',
    timestamp: msg.timestamp,
    priority: msg.canId.startsWith('0x0') ? 'High' : 'Normal',
    arbitration: 'Winner — lowest ID',
    errorState: msg.status === 'error' ? 'Error Passive' : 'Error Active',
    network: msg.network,
    signal: msg.signal,
  };
}
