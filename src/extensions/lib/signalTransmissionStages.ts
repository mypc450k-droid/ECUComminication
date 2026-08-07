import type { SimulationFeature, SimulationStep } from '@/types/simulation';

export interface SignalTransmissionStage {
  id: string;
  label: string;
  representation: string;
  explanation: string;
  layer: string;
}

/** Canonical end-to-end signal path (sender → bus → receiver → actuator → feedback). */
export const CANONICAL_SIGNAL_STAGES: SignalTransmissionStage[] = [
  { id: 'driver', label: 'Driver', representation: '0V pressed (Active Low)', explanation: 'Mechanical switch contact closes, pulling input to ground.', layer: 'Physical' },
  { id: 'switch', label: 'Switch', representation: 'Electrical level LOW', explanation: 'Switch hardware presents a defined voltage level to the MCU pin.', layer: 'Physical' },
  { id: 'gpio', label: 'MCU GPIO', representation: 'STD_LOW / pin read', explanation: 'Microcontroller digital input samples the pin state.', layer: 'Hardware' },
  { id: 'dio', label: 'MCAL Dio', representation: 'Dio_ReadChannel() → LOW', explanation: 'MCAL abstracts the pin read for BSW layers.', layer: 'MCAL' },
  { id: 'iohwab', label: 'IoHwAb', representation: 'SwitchDown = TRUE', explanation: 'I/O abstraction converts raw pin to meaningful boolean signal.', layer: 'ECU Abstraction' },
  { id: 'swc-tx', label: 'Application SWC', representation: 'WindowCommand = DOWN', explanation: 'Feature logic interprets input and sets command intent.', layer: 'Application' },
  { id: 'rte-tx', label: 'RTE TX', representation: 'Rte_Write_Command(DOWN)', explanation: 'Runtime environment routes SWC output to COM or local port.', layer: 'RTE' },
  { id: 'com-tx', label: 'COM Pack', representation: '2-bit signal → bits in PDU', explanation: 'COM encodes engineering value per DBC/ARXML layout.', layer: 'COM' },
  { id: 'ipdu', label: 'I-PDU', representation: 'Payload byte buffer', explanation: 'Signals packed into contiguous PDU memory.', layer: 'COM' },
  { id: 'pdur-tx', label: 'PduR TX', representation: 'Route PDU → CanIf', explanation: 'PDU Router selects destination interface.', layer: 'PduR' },
  { id: 'canif-tx', label: 'CanIf TX', representation: 'HTH → CAN ID mapping', explanation: 'CAN Interface maps PDU to hardware transmit handle.', layer: 'CanIf' },
  { id: 'candrv-tx', label: 'CanDrv TX', representation: 'Write ID, DLC, DATA', explanation: 'Driver programs controller mailboxes / registers.', layer: 'CanDrv' },
  { id: 'can-frame', label: 'CAN Frame', representation: 'ID + DLC + payload bytes', explanation: 'Structured frame ready for bus arbitration.', layer: 'CAN' },
  { id: 'can-bus', label: 'CAN Bus', representation: 'CAN_H / CAN_L waveform', explanation: 'Differential electrical signal propagates on the network.', layer: 'Physical Bus' },
  { id: 'candrv-rx', label: 'CanDrv RX', representation: 'Frame received → raw bytes', explanation: 'Receiving controller captures bus frame.', layer: 'CanDrv' },
  { id: 'canif-rx', label: 'CanIf RX', representation: 'HRH match → PDU extract', explanation: 'Interface filters by ID and delivers PDU upward.', layer: 'CanIf' },
  { id: 'pdur-rx', label: 'PduR RX', representation: 'PDU → COM instance', explanation: 'Router delivers payload to correct COM module.', layer: 'PduR' },
  { id: 'com-rx', label: 'COM Unpack', representation: 'Bits → WindowCommand = DOWN', explanation: 'COM decodes PDU into application signals.', layer: 'COM' },
  { id: 'rte-rx', label: 'RTE RX', representation: 'Rte_Read_Command()', explanation: 'RTE delivers signal to receiver SWC port.', layer: 'RTE' },
  { id: 'swc-rx', label: 'Receiver SWC', representation: 'MotorDirection = DOWN', explanation: 'Application runs safety checks and actuator logic.', layer: 'Application' },
  { id: 'rte-pwm', label: 'RTE → PWM', representation: 'Duty request issued', explanation: 'RTE triggers PWM-related runnable or IoHwAb call.', layer: 'RTE' },
  { id: 'mcal-pwm', label: 'MCAL PWM', representation: '90% duty cycle waveform', explanation: 'Timer/PWM module generates switching pattern.', layer: 'MCAL' },
  { id: 'driver-ic', label: 'Driver IC', representation: '12V switched to motor', explanation: 'Gate driver / H-bridge amplifies logic to power stage.', layer: 'Hardware' },
  { id: 'mosfet', label: 'Power Stage', representation: 'High-current path ON', explanation: 'MOSFETs switch battery power to actuator.', layer: 'Hardware' },
  { id: 'motor', label: 'Motor / Actuator', representation: 'Mechanical motion', explanation: 'Electrical energy becomes physical movement.', layer: 'Physical' },
  { id: 'sensor', label: 'Position Sensor', representation: 'Hall pulse counts', explanation: 'Feedback sensor tracks position / speed.', layer: 'Hardware' },
  { id: 'feedback', label: 'Feedback Path', representation: 'Position % status', explanation: 'Reverse signal path reports state to cluster / sender.', layer: 'COM/RTE' },
  { id: 'cluster', label: 'Status Display', representation: 'Position shown to driver', explanation: 'HMI receives updated actuator status.', layer: 'Application' },
];

const TYPE_TO_STAGE_IDS: Record<string, string[]> = {
  input: ['driver', 'switch'],
  switch: ['switch', 'gpio', 'dio'],
  lin: ['can-bus', 'can-frame'],
  ecu: ['swc-tx', 'swc-rx'],
  gateway: ['pdur-tx', 'can-bus'],
  can: ['can-frame', 'can-bus'],
  autosar: ['com-tx', 'pdur-tx', 'canif-tx'],
  mcal: ['dio', 'mcal-pwm'],
  driver: ['driver-ic', 'mosfet'],
  hardware: ['motor', 'sensor'],
  output: ['motor', 'cluster'],
  swc: ['swc-tx', 'swc-rx'],
  port: ['rte-tx', 'rte-rx'],
  rte: ['rte-tx', 'rte-rx'],
  com: ['com-tx', 'com-rx', 'ipdu'],
  pdur: ['pdur-tx', 'pdur-rx'],
  canif: ['canif-tx', 'canif-rx'],
  candrv: ['candrv-tx', 'candrv-rx'],
  controller: ['can-frame', 'candrv-tx'],
  bus: ['can-bus'],
};

function personalize(text: string, feature: SimulationFeature, step: SimulationStep): string {
  return text
    .replace(/Window/g, feature.name.split(' ')[0] || 'Feature')
    .replace(/window/g, feature.name.toLowerCase())
    .replace(/Motor/g, feature.physicalOutput.split(' ')[0] || 'Actuator')
    .replace(/DOWN/g, feature.driverInput.slice(0, 12));
}

export function getStagesForStep(step: SimulationStep, feature: SimulationFeature): SignalTransmissionStage[] {
  const ids = TYPE_TO_STAGE_IDS[step.type] || ['swc-tx'];
  const stages = CANONICAL_SIGNAL_STAGES.filter((s) => ids.includes(s.id));

  if (stages.length === 0) {
    return [{
      id: step.id,
      label: step.title,
      representation: step.engineeringExplanation.slice(0, 60),
      explanation: step.beginnerExplanation,
      layer: step.type,
    }];
  }

  return stages.map((s) => ({
    ...s,
    representation: personalize(
      step.signalName
        ? `${step.signalName}: ${s.representation}`
        : s.representation,
      feature,
      step
    ),
    explanation: step.engineeringExplanation || personalize(s.explanation, feature, step),
  }));
}

export function getActiveStageIndex(step: SimulationStep): number {
  const ids = TYPE_TO_STAGE_IDS[step.type] || [];
  if (ids.length === 0) return 0;
  const hash = step.stepNumber % ids.length;
  return hash;
}

export function layoutStepsForCanvas(steps: SimulationStep[]): SimulationStep[] {
  return steps.map((step, i) => ({
    ...step,
    canvasPosition: step.canvasPosition ?? {
      x: 60 + (i % 6) * 130,
      y: 40 + Math.floor(i / 6) * 95,
    },
  }));
}

export function layoutEcuPositions(
  ecuIds: string[],
  steps: SimulationStep[],
  stored: Record<string, { x: number; y: number }> | undefined
): Array<{ id: string; name: string; x: number; y: number }> {
  return ecuIds.map((id, i) => {
    const stepForEcu = steps.find((s) => s.ecuId === id);
    const storedPos = stored?.[id];
    return {
      id,
      name: id,
      x: storedPos?.x ?? stepForEcu?.canvasPosition?.x ?? 80 + (i % 3) * 220,
      y: storedPos?.y ?? stepForEcu?.canvasPosition?.y ?? 80 + Math.floor(i / 3) * 160,
    };
  });
}
