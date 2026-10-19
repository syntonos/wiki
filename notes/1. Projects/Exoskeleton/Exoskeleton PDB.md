# Exoskeleton PDB
## V1
### Specs
This has to power a few parts, each with different current draw and different voltages. 
- Main/Sensors/Logic
    - Likely all 3V3 or selectable for 3V3.
    - Estimated Peak Current: 1A
- Motors
    - Robstride 01. 36V nominal voltage, 24V - 48V range.
    - No Load Current: 0.5 Arms
    - Rated Load Phase Current: 7 Apk
    - Peak Phase Current: 23 Apk
![Robstride 01 Specs](/images/projects/Exoskeleton/robstride01.png)

### Battery
We will be using a battery pack of 21700 cells, with integrated BMS and USB-C PD charging. Outputs use XT30 to the PDB.

The [EVE 50PL 21700 5000mAh 50A Tabless Battery](https://imrbatteries.com/products/eve-50pl-21700-5000-mah-125a-battery?_pos=2&_sid=788b713ca&_ss=r) suits our purpose perfectly, with a 5000mAh capacity and tabless technology giving discharge rates of 50A, enough for if both motors spike to absolute peak current (50A > 23A + 23A). 

### PDB
Inputs: 
- XT30 from the Battery Pack

Outputs: 
- 2x XT30 for the motors (left and right)
- 2x JST-PH 2.54mm for Main PCB & CAN Driver Board



