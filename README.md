# freebird-base
Base classes used in freebird framework.  

[![NPM](https://nodei.co/npm/freebird-base.png?downloads=true)](https://nodei.co/npm/freebird-base/)  

[![Travis branch](https://img.shields.io/travis/freebirdjs/freebird-base/master.svg?maxAge=2592000)](https://travis-ci.org/freebirdjs/freebird-base)
[![npm](https://img.shields.io/npm/v/freebird-base.svg?maxAge=2592000)](https://www.npmjs.com/package/freebird-base)
[![npm](https://img.shields.io/npm/l/freebird-base.svg?maxAge=2592000)](https://www.npmjs.com/package/freebird-base)


<br />
  
## Documentation  

Please visit the [Wiki](https://github.com/freebirdjs/freebird-base/wiki).


<br />

## Overview

**freebird-base** provides three base classes used by [freebird](https://github.com/freebirdjs/freebird) IoT framework. These classes are abstractions of the network controller, network device, and real appliance, respectively.  
  
| Class                        | Description                                                                         | Example                                                                               |
|------------------------------|-------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------|
| [Netcore](https://github.com/freebirdjs/freebird-base/wiki/Netcore-Class) | A network controller responsible for message transportation and network management. | A zigbee coordinator or a BLE central controller.                                     |
| [Device](https://github.com/freebirdjs/freebird-base/wiki/Device-Class)   | A wired/wireless machine in the network.                                            | A zigbee end-device, a BLE peripheral, a MQTT client, or a CoAP server(LWM2M client). |
| [Gadget](https://github.com/freebirdjs/freebird-base/wiki/Gadget-Class)   | Something specific and functional in our life.                                      | A temperature sensor, a light switch, or a barometer.                                 |
  

  
* If you are a freebird user, you may only care about the APIs of [Device](https://github.com/freebirdjs/freebird-base/wiki/Device-Class) and [Gadget](https://github.com/freebirdjs/freebird-base/wiki/Gadget-Class) classes.  
* If you are a freebird netcore implementer who likes to create a netcore to manage your network with the freebird framework, then [Workflow of Designing Your Own Netcore](https://github.com/freebirdjs/freebird-base/wiki/Workflow) will be a good place for you to start.  


<br />

## Installation

> $ npm install freebird-base --save
  
<br />

  

## License

Licensed under [MIT](https://github.com/freebirdjs/freebird-base/blob/master/LICENSE).

  
<br />
  
<br />