import type { SimulationFeature, SimulationStep } from '@/types/simulation';

export interface SignalTransmissionStage {
  id: string;
  label: string;
  representation: string;
  simpleExplanation: string;
  explanation: string;
  layer: string;
  apiCall?: string;
  dataFormat?: string;
}

/** Canonical end-to-end signal path aligned with automotive E/E reference table. */
export const CANONICAL_SIGNAL_STAGES: SignalTransmissionStage[] = [
  {
    id: 'driver',
    label: 'Driver',
    representation: '0V pressed (Active Low)',
    simpleExplanation: 'Driver presses the switch; contact pulls the input to ground.',
    explanation: 'Mechanical switch uses active-low wiring: released = high impedance / pull-up, pressed = 0V at ECU pin.',
    layer: 'Physical',
    dataFormat: '0V / 3.3V electrical level',
  },
  {
    id: 'switch',
    label: 'Switch',
    representation: 'Electrical level LOW',
    simpleExplanation: 'Switch hardware presents a defined LOW level to the MCU pin.',
    explanation: 'Hardwired switch circuit completes path to ground; debouncing may be mechanical or software.',
    layer: 'Physical',
    dataFormat: 'Digital voltage level',
  },
  {
    id: 'gpio',
    label: 'MCU GPIO',
    representation: 'STD_LOW / Dio level read',
    simpleExplanation: 'Microcontroller reads the digital pin state.',
    explanation: 'GPIO input register captures pin voltage after synchronizer; typically STD_LOW when pressed.',
    layer: 'Hardware',
    apiCall: 'GPIO_ReadPin() → STD_LOW',
    dataFormat: 'STD_LOW | STD_HIGH',
  },
  {
    id: 'dio',
    label: 'MCAL Dio',
    representation: 'Dio_ReadChannel() → LOW',
    simpleExplanation: 'MCAL reads the pin through standardized Dio API.',
    explanation: 'Microcontroller Abstraction Layer maps physical pin to Dio channel for BSW consumption.',
    layer: 'MCAL',
    apiCall: 'Dio_ReadChannel(DioConf_DioChannel_Switch)',
    dataFormat: 'Dio_LevelType',
  },
  {
    id: 'iohwab',
    label: 'IoHwAb',
    representation: 'SwitchDown = TRUE',
    simpleExplanation: 'I/O abstraction converts raw pin to meaningful boolean.',
    explanation: 'IoHwAb debounces and maps Dio level to application-meaningful signal WindowSwitchDown.',
    layer: 'ECU Abstraction',
    dataFormat: 'boolean engineering signal',
  },
  {
    id: 'swc-tx',
    label: 'Application SWC',
    representation: 'WindowCommand = DOWN',
    simpleExplanation: 'Feature logic interprets input and sets command intent.',
    explanation: 'Application Software Component runnable evaluates switch state and outputs commanded direction.',
    layer: 'Application',
    dataFormat: 'enum { UP, DOWN, IDLE }',
  },
  {
    id: 'rte-tx',
    label: 'RTE TX',
    representation: 'Rte_Write_WindowCommand(DOWN)',
    simpleExplanation: 'RTE routes SWC output to COM or local receiver port.',
    explanation: 'Runtime Environment writes sender port; triggers Tx notification or queued transmission.',
    layer: 'RTE',
    apiCall: 'Rte_Write_<Port>_<Signal>(value)',
    dataFormat: 'typed port data',
  },
  {
    id: 'com-tx',
    label: 'COM Pack',
    representation: '2-bit signal encoded in PDU bits',
    simpleExplanation: 'COM packs engineering value into PDU bit layout per ARXML.',
    explanation: 'AUTOSAR COM applies endianness, scaling, and update bits per ComSignal configuration.',
    layer: 'COM',
    apiCall: 'Com_SendSignal(SignalId, &data)',
    dataFormat: 'packed bits in I-PDU buffer',
  },
  {
    id: 'ipdu',
    label: 'I-PDU',
    representation: 'Payload byte array assembled',
    simpleExplanation: 'Signals combined into contiguous PDU memory.',
    explanation: 'I-PDU groups multiple signals; byte 0 may carry direction + position per DBC layout.',
    layer: 'COM',
    dataFormat: 'uint8[] PDU buffer',
  },
  {
    id: 'pdur-tx',
    label: 'PduR TX',
    representation: 'Route PDU → CanIf destination',
    simpleExplanation: 'PDU Router selects correct network interface.',
    explanation: 'PduR routing table maps source PDU ID to destination lower-layer module (CanIf/LinIf).',
    layer: 'PduR',
    apiCall: 'PduR_ComTransmit(PduId, PduInfoPtr)',
    dataFormat: 'PduInfoType { SduDataPtr, SduLength }',
  },
  {
    id: 'canif-tx',
    label: 'CanIf TX',
    representation: 'HTH maps PDU → CAN ID 0x245',
    simpleExplanation: 'CAN Interface assigns hardware transmit handle and priority.',
    explanation: 'CanIf maps PDU to Hardware Transmit Handle (HTH) and CAN ID from configuration.',
    layer: 'CanIf',
    apiCall: 'CanIf_Transmit(Hth, PduInfoPtr)',
    dataFormat: 'CAN ID + DLC + data bytes',
  },
  {
    id: 'candrv-tx',
    label: 'CanDrv TX',
    representation: 'Write ID, DLC, DATA to controller',
    simpleExplanation: 'CAN driver programs controller mailboxes.',
    explanation: 'CanDrv writes frame to TX mailbox / buffer; requests transmission on CAN controller.',
    layer: 'CanDrv',
    apiCall: 'Can_Write(Hth, PduInfo)',
    dataFormat: 'hardware mailbox structure',
  },
  {
    id: 'can-frame',
    label: 'CAN Frame',
    representation: 'ID=0x245 DATA=02 00 00 00...',
    simpleExplanation: 'Structured frame ready for bus arbitration.',
    explanation: 'CAN frame: SOF, ID, RTR, IDE, DLC, data field, CRC, ACK, EOF per ISO 11898.',
    layer: 'CAN Protocol',
    dataFormat: 'ID + DLC + 0-8 data bytes',
  },
  {
    id: 'can-bus',
    label: 'CAN Bus',
    representation: 'CAN_H / CAN_L differential waveform',
    simpleExplanation: 'Electrical signal propagates on twisted pair at 500 kbps.',
    explanation: 'Differential bus: dominant/recessive bits; propagation delay ~5 ns/m; arbitration by ID.',
    layer: 'Physical Bus',
    dataFormat: 'differential voltage waveform',
  },
  {
    id: 'eth-packet',
    label: 'Ethernet Frame',
    representation: 'SOME/IP or UDP payload',
    simpleExplanation: 'High-bandwidth sensor data encapsulated in Ethernet frames.',
    explanation: 'Automotive Ethernet 100BASE-T1; SOME/IP for radar object lists and camera data.',
    layer: 'Ethernet',
    apiCall: 'SoAd_IfTransmit(SoConId, PduInfo)',
    dataFormat: 'UDP/TCP payload',
  },
  {
    id: 'eth-bus',
    label: 'Ethernet PHY',
    representation: 'PAM3 / 100 Mbps link',
    simpleExplanation: 'Single-pair Ethernet physical layer carries AVB/SOME/IP traffic.',
    explanation: 'PHY establishes link; switch/gateway routes between ADAS and backbone domains.',
    layer: 'Physical Bus',
    dataFormat: 'Ethernet frame on T1 pair',
  },
  {
    id: 'candrv-rx',
    label: 'CanDrv RX',
    representation: 'Frame captured → raw byte array',
    simpleExplanation: 'Receiving controller stores incoming frame.',
    explanation: 'RX interrupt / polling reads mailbox; indicates frame to CanIf via callback.',
    layer: 'CanDrv',
    apiCall: 'Can_MainFunction_Read()',
    dataFormat: 'received PDU bytes',
  },
  {
    id: 'canif-rx',
    label: 'CanIf RX',
    representation: 'HRH match ID 0x245 → extract PDU',
    simpleExplanation: 'CAN Interface filters by ID and delivers PDU upward.',
    explanation: 'Hardware Receive Handle (HRH) matched; DLC validated; PDU passed to PduR.',
    layer: 'CanIf',
    apiCall: 'CanIf_RxIndication(Hrh, PduId, PduInfo)',
    dataFormat: 'filtered PDU payload',
  },
  {
    id: 'pdur-rx',
    label: 'PduR RX',
    representation: 'PDU delivered to COM RX instance',
    simpleExplanation: 'Router forwards payload to correct COM module.',
    explanation: 'PduR receive routing connects CanIf indication to COM receive PDU handler.',
    layer: 'PduR',
    apiCall: 'PduR_CanIfRxIndication(PduId, PduInfo)',
    dataFormat: 'PduInfoType',
  },
  {
    id: 'com-rx',
    label: 'COM Unpack',
    representation: 'Bits decoded → WindowCommand = DOWN',
    simpleExplanation: 'COM unpacks PDU bits into application signals.',
    explanation: 'COM applies inverse packing; update bits and timeout monitoring updated.',
    layer: 'COM',
    apiCall: 'Com_ReceiveSignal(SignalId, &data)',
    dataFormat: 'engineering signal value',
  },
  {
    id: 'rte-rx',
    label: 'RTE RX',
    representation: 'Rte_Read_WindowCommand()',
    simpleExplanation: 'RTE delivers signal to receiver SWC port.',
    explanation: 'Receiver port updated; runnable may be triggered on data reception.',
    layer: 'RTE',
    apiCall: 'Rte_Read_<Port>_<Signal>(&value)',
    dataFormat: 'typed port data',
  },
  {
    id: 'swc-rx',
    label: 'Receiver SWC',
    representation: 'MotorDirection = DOWN + safety checks',
    simpleExplanation: 'Application validates request and commands actuator.',
    explanation: 'Receiver SWC runs anti-pinch, voltage, and timing checks before actuation.',
    layer: 'Application',
    dataFormat: 'actuator command enum',
  },
  {
    id: 'rte-pwm',
    label: 'RTE → PWM path',
    representation: 'Duty cycle request issued',
    simpleExplanation: 'RTE triggers PWM / IoHwAb for motor drive.',
    explanation: 'RTE call chain to MCAL PWM or IoHwAb for H-bridge control.',
    layer: 'RTE',
    apiCall: 'Rte_Call_IoHwAb_SetDutyCycle()',
    dataFormat: 'duty % request',
  },
  {
    id: 'mcal-pwm',
    label: 'MCAL PWM',
    representation: '90% duty cycle on PWM channel',
    simpleExplanation: 'Timer generates switching waveform for motor driver.',
    explanation: 'PWM module configures frequency and duty on timer output compare channel.',
    layer: 'MCAL',
    apiCall: 'Pwm_SetDutyCycle(Channel, Duty)',
    dataFormat: 'duty 0-100% / ticks',
  },
  {
    id: 'driver-ic',
    label: 'Driver IC / H-bridge',
    representation: '12V switched to motor terminals',
    simpleExplanation: 'Gate driver amplifies logic to power stage.',
    explanation: 'H-bridge or gate driver IC enables high-current path with shoot-through protection.',
    layer: 'Hardware',
    dataFormat: '12V switched power',
  },
  {
    id: 'mosfet',
    label: 'Power MOSFETs',
    representation: 'High-current path ON',
    simpleExplanation: 'MOSFETs connect battery to motor winding.',
    explanation: 'Low-side / high-side FETs switch per PWM pattern for direction and speed.',
    layer: 'Hardware',
    dataFormat: 'switching power stage',
  },
  {
    id: 'motor',
    label: 'Motor / Actuator',
    representation: 'Mechanical rotation / linear motion',
    simpleExplanation: 'Electrical energy becomes physical movement.',
    explanation: 'DC motor / regulator moves glass; current profile monitored for stall detection.',
    layer: 'Physical',
    dataFormat: 'mechanical displacement',
  },
  {
    id: 'sensor',
    label: 'Position Sensor',
    representation: 'Hall pulses → position counts',
    simpleExplanation: 'Feedback sensor tracks actuator position.',
    explanation: 'Hall-effect sensor counts pulses; used for position feedback and anti-pinch.',
    layer: 'Hardware',
    dataFormat: 'pulse count / % position',
  },
  {
    id: 'feedback',
    label: 'Feedback TX path',
    representation: 'Position % status packed',
    simpleExplanation: 'Status travels reverse through COM/CAN to sender.',
    explanation: 'Symmetric AUTOSAR stack on sender/receiver: COM → PduR → CanIf → bus.',
    layer: 'COM/RTE',
    dataFormat: 'status PDU cyclic/event',
  },
  {
    id: 'cluster',
    label: 'HMI / Cluster',
    representation: 'Position % shown to driver',
    simpleExplanation: 'Instrument cluster or switch LED reflects status.',
    explanation: 'Body CAN status frame updates HMI icon or switch illumination feedback.',
    layer: 'Application',
    dataFormat: 'HMI display value',
  },
];

const TYPE_TO_STAGE_IDS: Record<string, string[]> = {
  input: ['driver', 'switch', 'gpio'],
  switch: ['switch', 'gpio', 'dio', 'iohwab'],
  lin: ['can-frame', 'can-bus'],
  ethernet: ['eth-packet', 'eth-bus', 'com-tx', 'pdur-tx'],
  ecu: ['swc-tx', 'swc-rx', 'rte-tx'],
  gateway: ['pdur-tx', 'can-bus', 'pdur-rx'],
  can: ['can-frame', 'can-bus'],
  autosar: ['com-tx', 'pdur-tx', 'canif-tx', 'rte-tx'],
  mcal: ['dio', 'mcal-pwm', 'gpio'],
  driver: ['driver-ic', 'mosfet', 'mcal-pwm'],
  hardware: ['motor', 'sensor'],
  output: ['motor', 'cluster', 'feedback'],
  swc: ['swc-tx', 'swc-rx', 'rte-tx', 'rte-rx'],
  port: ['rte-tx', 'rte-rx'],
  rte: ['rte-tx', 'rte-rx'],
  com: ['com-tx', 'com-rx', 'ipdu'],
  pdur: ['pdur-tx', 'pdur-rx'],
  canif: ['canif-tx', 'canif-rx'],
  candrv: ['candrv-tx', 'candrv-rx'],
  controller: ['can-frame', 'candrv-tx'],
  bus: ['can-bus', 'can-frame'],
};

function personalize(text: string, feature: SimulationFeature, step: SimulationStep): string {
  const featureWord = feature.name.split(' ')[0] || 'Feature';
  const actuator = feature.physicalOutput.split(' ').slice(0, 2).join(' ') || 'Actuator';
  const input = feature.driverInput.slice(0, 40);
  return text
    .replace(/Window/g, featureWord)
    .replace(/window/g, feature.name.toLowerCase())
    .replace(/Motor/g, actuator)
    .replace(/WindowCommand/g, `${featureWord}Command`)
    .replace(/WindowSwitchDown/g, `${featureWord}Input`)
    .replace(/DOWN/g, input.slice(0, 12))
    .replace(/0x245/g, step.canId || '0x245');
}

export function getStagesForStep(step: SimulationStep, feature: SimulationFeature): SignalTransmissionStage[] {
  const ids = TYPE_TO_STAGE_IDS[step.type] || ['swc-tx', 'rte-tx', 'com-tx'];
  const stages = CANONICAL_SIGNAL_STAGES.filter((s) => ids.includes(s.id));

  if (stages.length === 0) {
    return [{
      id: step.id,
      label: step.title,
      representation: step.engineeringExplanation.slice(0, 80),
      simpleExplanation: step.beginnerExplanation,
      explanation: step.engineeringExplanation,
      layer: step.type,
      dataFormat: step.network || 'engineering',
    }];
  }

  return stages.map((s) => ({
    ...s,
    representation: personalize(
      step.signalName ? `${step.signalName}: ${s.representation}` : s.representation,
      feature,
      step
    ),
    simpleExplanation: personalize(s.simpleExplanation, feature, step),
    explanation: step.engineeringExplanation
      ? `${step.engineeringExplanation} — ${personalize(s.explanation, feature, step)}`
      : personalize(s.explanation, feature, step),
    apiCall: s.apiCall ? personalize(s.apiCall, feature, step) : undefined,
  }));
}

export function getActiveStageIndex(step: SimulationStep): number {
  const ids = TYPE_TO_STAGE_IDS[step.type] || [];
  if (ids.length === 0) return 0;
  return step.stepNumber % ids.length;
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
