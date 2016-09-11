# freebird-base
Base classes used in freebird framework.  

## Table of Contents

1. [Overiew](#Overiew)
2. [Installation](#Installation)
3. [Abstractions](#Abstractions)
3. [Basic Usage](#Basic)
4. [Netcore Class](#Netcore)
5. [Device Class](#Device)
6. [Gadget Class](#Gadget)

<a name="Overiew"></a>
## 1. Overview

**freebird-base** includes base classes of Netcore, Device, and Gadget that are used in the [freebird](https://github.com/freebirdjs/freebird) IoT network and application framework. These classes are abstractions of the network controller, network device, and real appliance, respectively.  

* **Netcore** is a network controller responsible for message transportation and network management. For example, a zigbee coordinator.
* **Device** is a wired/wireless machine in the network. For example, a zigbee end-device, a BLE peripheral, a MQTT client, or a CoAP server(LWM2M client).
* **Gadget** represents something specific and functional in our life. For example, a temperature sensor, a light switch, or a barometer.

<a name="Installation"></a>
## 2. Installation

> $ npm install freebird-base --save
  
<a name="Abstractions"></a>
## 3. Abstractions

**freebird** framework.  [TODO]  

These classes are unified Device and Gadget class, and freebird doesn't know what your raw device and raw gadget data is.  

### 3.1 Netcore Class

Netcore is a network controller which equips with freebird-defined methods to accomplish operations of network transportation and management. In pratice, the netcore may be a zigbee coordinator (TI CC253X), a BLE central (TI CC254X).  

* Further information
    * [freebird-netcore-ble](#https://www.npmjs.com/package/freebird-netcore-ble)
      * Software: [ble-shepherd](https://www.npmjs.com/package/ble-shepherd)  
      * Hardware: TI CC254X SoC/USB Dongle, CSR8510 USB Dongle  
    * [freebird-netcore-zigbee](#https://www.npmjs.com/package/freebird-netcore-zigbee)
      * Software: [zigbee-shepherd](https://www.npmjs.com/package/zigbee-shepherd)  
      * Hardware: TI CC253X SoC/USB Dongle  
    * [freebird-netcore-mqtt](#https://www.npmjs.com/package/freebird-netcore-mqtt)
      * Software: [mqtt-shepherd](https://www.npmjs.com/package/mqtt-shepherd)  
      * Hardware: Any platform equipped with node.js, like x86 PC, RaspberryPi, Beaglebone Black, Linkit Smart 7688, Edison  
    * [freebird-netcore-coap](#https://www.npmjs.com/package/freebird-netcore-coap)
      * Software: [coap-shepherd](https://www.npmjs.com/package/coap-shepherd)  
      * Hardware: Any platform equipped with node.js, like x86 PC, RaspberryPi, Beaglebone Black, Linkit Smart 7688, Edison  

### 3.2 Device Class
Device is a wired/wireless machine in the network. For example, a zigbee end-device, a BLE peripheral, a MQTT client, or a CoAP server(LWM2M client).  

* Further information
    * BLE machine nodes  
      * Firmware: [ble-xxxx](https://www.npmjs.com/package/ble-shepherd)  
      * Hardware: TI CC254X SoC/USB Dongle, CSR8510 USB Dongle  
    * ZigBee machine nodes  
      * Software: [zigbee-xxxx](https://www.npmjs.com/package/zigbee-shepherd)  
      * Hardware: TI CC253X SoC/USB Dongle  
    * MQTT machine nodes
      * Software: [mqtt-node](https://www.npmjs.com/package/mqtt-node)  
      * Hardware: Any platform equipped with node.js, like x86 PC, RaspberryPi, Beaglebone Black, Linkit Smart 7688, Edison  
    * CoAP machine nodes
      * Software: [coap-node](https://www.npmjs.com/package/coap-node)  
      * Hardware: Any platform equipped with node.js, like x86 PC, RaspberryPi, Beaglebone Black, Linkit Smart 7688, Edison  

### 3.3 Gadget Class
**Gadget** represents something specific and functional in our life. For example, a temperature sensor, a light switch, or a barometer.  


<a name="Basic"></a>
## 3. Basic Usage

* If you are a netcore user, please see [How to use a netcore]().  
* If you are trying to create your own netcore, please see [How to build your netcore]().  

<a name="Netcore"></a>
## 4. Netcore Class

The documentation of [Netcore Class]().

<a name="Device"></a>
## 5. Device Class

The documentation of [Device Class]().

<a name="Gadget"></a>
## 6. Gadget Class

The documentation of [Gadget Class]().




If you are willing to create your own netcore with freebird, just simply install this module and use `createNetcore()` method to get a netcore instance. After you got the instance, you should follow some rules to accomplish your own implementations on it, such as network drivers, to meet the minimum requirements for your netcore to operate well with freebird framework.  