# HEXAPOD - USB-to-CAN V2

**Part:** CUPI - HEXAPOD - USB-to-CAN PCB  

**Rev:** V2

**Owner:** Mina Yeh 

**Status:** Completed

Takes USB-C input from the Jetson t5000 and converts to three FDCAN buses. 

## Requirements

- Input: USB-C data & 5V power from the Jetson Nano
- Output: 6 JST-PH 2.54mm plugs (CAN_H & CAN_L) (Three separate buses.)
- M2.5 Mounting Holes
- Dimensions: 40mm x 50mm

## Design

![image](/public/images/projects/CUPI/USB-to-CAN/v2-schematic.png)
![image](/public/images/projects/CUPI/USB-to-CAN/v2-layout.png)
![image](/public/images/projects/CUPI/USB-to-CAN/v2-3d.png)

## System Diagrams
### Functional Block Diagram

```mermaid
flowchart TD
    A[INPUT - USB-C] --data--> B{MCU STM32G4}
    A --power--> C{3V3 LDO}
    B --UART 1--> D[CAN Transceiver TCAN332G]
    B --UART 2--> E[CAN Transceiver TCAN332G]
    B --UART 3--> F[CAN Transceiver TCAN332G]
    D --CAN FD BUS 1--> G[OUTPUT - 2x JST-PH 2.54mm]
    E --CAN FD BUS 2--> H[OUTPUT - 2x JST-PH 2.54mm]
    F --CAN FD BUS 3--> I[OUTPUT - 2x JST-PH 2.54mm]
```
3V3 LDO supplies power to all components. 
### Structural Block Diagram

```mermaid
flowchart TD
    A[INPUT - USB-C] --D+ D- --> B{MCU STM32G4}
    A --5V--> C{3V3 LDO- 1A}
    B --UART 1--> D[CAN Transceiver TCAN332G]
    B --UART 2--> E[CAN Transceiver TCAN332G]
    B --UART 3--> F[CAN Transceiver TCAN332G]
    D --CAN FD BUS 1--> G[OUTPUT - 2x JST-PH 2.54mm]
    E --CAN FD BUS 2--> H[OUTPUT - 2x JST-PH 2.54mm]
    F --CAN FD BUS 3--> I[OUTPUT - 2x JST-PH 2.54mm]
```
3V3 LDO supplies 3V3 power to all relevant components (MCU, CAN Convertors). 
## Notes
![image](/public/images/projects/CUPI/USB-to-CAN/v1-impedance.png)

https://jlcpcb.com/pcb-impedance-calculator

