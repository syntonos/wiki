# Exoskeleton CAN Board
## V1
I actually worked on a very similar CAN driver board for a club (Cornell University Physical Intelligence), so this was just adapted from it. The club board has slightly different specs (3 FDCAN buses for 18 motors, USB-C input, Robstride 05 Motors), but the actuator manufacturer is the same, so the general structure is very similar.

### Specs
This is meant to convert main board commands to FDCAN signals, which the actuators actually operate off of. 

