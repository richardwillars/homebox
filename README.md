# Homebox
Homebox makes home automation simple and flexible. It provides a uniform interface for interacting with IOT and home automation devices. Most home automation devices have their own communication protocols and standards, which make it a nightmare to integrate into home automation hubs (you have to build, maintain and support each and every device individually). Homebox acts as a translator and **provides a consistent and standard way for accessing home automation devices**.

The result is that home automation hubs no longer have to have knowledge of how to work with each device - they just need to know how to communicate with types of devices (speakers, lights, switches etc) on Homebox and they'll have support for potentially unlimited devices!

The really cool thing is that the Homebox ecosystem is entirely open source and based around npm. Developers, manufacturers (or anyone with knowledge of JavaScript) can add support for a particular device by creating a driver (this is an npm package that tells Homebox how to communicate with the device in question). Homebox will then expose the device using REST APIs and websockets.

So for example, to make a LIFX lightbulb turn on over 2 seconds and go blue..

    POST http://localhost:3000/devices/:deviceId/setState
    {
      "colour": {
        "hue": 230,
        "saturation": 1,
        "brightness": 0.5
      },
      "duration": 2,
      "on": true
    }
    
.. and to make a Philips Hue lightbulb turn on over 2 seconds and go blue..

    POST http://localhost:3000/devices/:deviceId/setState
    {
      "colour": {
        "hue": 230,
        "saturation": 1,
        "brightness": 0.5
      },
      "duration": 2,
      "on": true
    }
    
    
(no it's not a mistake - both requests are identical (apart from the device ID)!)
Homebox takes away knowledge of different types of devices and how their different APIs and networking technologies. Instead they're exposed using a uniform REST API.


## Requirements
- mongodb
- node.js

## Installation
> npm install homebox

## Run
> node app.js

This should launch a REST API server on localhost:3000

##Getting started
Out of the box Homebox has no knowledge of any devices on your network or how to talk to them. The first thing you need to do is to get some drivers - these allow Homebox to search and communicate with specific devices on your network. Check out https://github.com/richardwillars/homebox/wiki/Drivers to learn how to search for and add drivers.

Once you have some drivers installed you can make calls to the APIs documented at https://github.com/richardwillars/homebox/wiki/devices. These APIs are used to discover devices on your network (using the drivers you just installed) and find out information each device.

If a driver doesn't exist for the device you want to talk to then you need to create a driver. More information on this can be found at https://github.com/richardwillars/homebox/wiki/Drivers

## Todo
Important features to build..
- documentation
- tests
- zwave adapter
- openzwave interface
- zigbee adapter
- websocket capability (so Homebox can be accessed using websockets as well as HTTP)
