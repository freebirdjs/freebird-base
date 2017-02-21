# freebird-base
Base classes used in freebird framework.  

[![NPM](https://nodei.co/npm/freebird-base.png?downloads=true)](https://nodei.co/npm/freebird-base/)  

[![Travis branch](https://img.shields.io/travis/freebirdjs/freebird-base/master.svg?maxAge=2592000)](https://travis-ci.org/freebirdjs/freebird-base)
[![npm](https://img.shields.io/npm/v/freebird-base.svg?maxAge=2592000)](https://www.npmjs.com/package/freebird-base)
[![npm](https://img.shields.io/npm/l/freebird-base.svg?maxAge=2592000)](https://www.npmjs.com/package/freebird-base)

## Table of Contents

1. [Overiew](#Overiew)
2. [Installation](#Installation)
3. [Abstractions](#Abstractions)
3. [Basic Usage](#Basic)
4. [Netcore Class](#Netcore)
5. [Device Class](#Device)
6. [Gadget Class](#Gadget)
7. [License](#License)

<a name="Overiew"></a>
## 1. Overview

**freebird-base** provides the base classes including Netcore, Device, and Gadget used by [freebird](https://github.com/freebirdjs/freebird) IoT network and application framework. These classes are abstractions of the network controller, network device, and real appliance, respectively.  

* **Netcore** is a network controller responsible for message transportation and network management. For example, a zigbee coordinator.
* **Device** is a wired/wireless machine in the network. For example, a zigbee end-device, a BLE peripheral, a MQTT client, or a CoAP server(LWM2M client).
* **Gadget** represents something specific and functional in our life. For example, a temperature sensor, a light switch, or a barometer.

<a name="Installation"></a>
## 2. Installation

> $ npm install freebird-base --save
  
<a name="Abstractions"></a>
## 3. Abstractions

The **freebird** framework has **net**, **dev**, and **gad** subsystems responsible for network, device, and gadget management, respectively. In brief, a network is formed with many devices, and each device may have some gadgets on it. A gadget is the real application in a manchine network.

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

* If you are a netcore user, please see [How to use a netcore](https://github.com/freebirdjs/freebird#Basic).  
* If you are trying to create your own netcore, please see [How to build your netcore](https://github.com/freebirdjs/freebird-base/blob/master/docs/NetcoreBuild.md).  

<a name="Netcore"></a>
## 4. Netcore Class

The documentation of [Netcore Class](https://github.com/freebirdjs/freebird-base/blob/master/docs/NetcoreClass.md).

<a name="Device"></a>
## 5. Device Class

The documentation of [Device Class](https://github.com/freebirdjs/freebird-base/blob/master/docs/DeviceClass.md).

<a name="Gadget"></a>
## 6. Gadget Class

The documentation of [Gadget Class](https://github.com/freebirdjs/freebird-base/blob/master/docs/GadgetClass.md).

<a name="License"></a>
## 7. License 

Licensed under [MIT](https://github.com/freebirdjs/freebird-base/blob/master/LICENSE).

