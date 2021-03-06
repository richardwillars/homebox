const groupBy = (xs, key) =>
  xs.reduce((rv, x) => {
    (rv[x[key]] = rv[x[key]] || []).push(x); // eslint-disable-line no-param-reassign
    return rv;
  }, {});

const getDriversWithStats = async (devicesCollection, driverList) => {
  const devices = devicesCollection.find();
  const devicesGroupedByDrivers = groupBy(devices, "driverId");
  return Object.keys(devicesGroupedByDrivers).map(driverId => {
    const driverInfo = Object.values(driverList).find(
      driver => driver.driverId === driverId
    );
    return {
      driverId,
      deviceCount: devicesGroupedByDrivers[driverId].length,
      comms: driverInfo ? driverInfo.comms : null,
      type: driverInfo ? driverInfo.driverType : null
    };
  });
};

const discover = async (
  driverId,
  driverUtils,
  devicesCollection,
  md5,
  deviceUtils,
  driverList
) => {
  try {
    // check that the driver exists and that it matches the specified type
    const foundDriver = await driverUtils.doesDriverExist(driverId, driverList);

    // if found, load it
    if (foundDriver === false) {
      const e = new Error("driver not found");
      e.type = "NotFound";
      throw e;
    }
    const driver = driverList[driverId];
    const type = driver.driverType;

    // call the discover method on the driver and wait for it to return devices
    const foundDevices = (await driver.api.discover()) || [];

    // get a list of existing devices from the db
    const existingDevices = devicesCollection.find({
      type,
      driverId
    });

    // loop through existingDevices and determine if they exist in the foundDevices list
    const toUpdate = [];
    existingDevices.forEach(existingDevice => {
      foundDevices.find(foundDevice => {
        if (
          existingDevice.deviceId ===
          md5(`${type}${driverId}${foundDevice.originalId}`)
        ) {
          if (
            typeof foundDevice.name === "undefined" ||
            foundDevice.name === "" // eslint-disable-line no-param-reassign
          ) {
            foundDevice.name = existingDevice.name; // eslint-disable-line no-param-reassign
          }
          toUpdate.push({
            device: existingDevice,
            specs: foundDevice
          });
          return true;
        }
        return false;
      });
    });

    // if they do exist in the foundDevices list, update them
    const promises = [];
    toUpdate.forEach(r => {
      promises.push(deviceUtils.updateDevice(r.device, r.specs));
    });
    await Promise.all(promises);

    // loop through foundDevices and determine if they don't exist in the existing devices list
    const newDevices = foundDevices.filter(
      foundDevice =>
        existingDevices.find(
          existingDevice =>
            existingDevice.deviceId ===
            md5(`${type}${driverId}${foundDevice.originalId}`)
        ) === undefined
    );
    // if there are any other devices in foundDevices, create them
    await Promise.all(
      newDevices.map(async r => {
        await deviceUtils.createDevice(type, driverId, r);
      })
    );

    const finalDevices = devicesCollection.find({
      // get the entire list of devices from the db
      type,
      driverId
    });

    await driverList[driverId].api.initDevices(finalDevices);
    return finalDevices;
  } catch (e) {
    if (e.type) {
      if (e.type === "Driver") {
        e.driver = driverId;
      }
    }
    throw e;
  }
};

const getEventDescriptions = async schemas => {
  const events = {};
  Object.keys(schemas.deviceTypes).forEach(type => {
    events[type] = schemas.deviceTypes[type].events;
  });
  return events;
};

const getCommands = async schemas => {
  const commands = {};
  Object.keys(schemas.deviceTypes).forEach(type => {
    commands[type] = schemas.deviceTypes[type].commands;
  });
  return commands;
};

const getAllDevices = async devicesCollection => devicesCollection.find();

const getDevicesByType = async (driverType, devicesCollection) =>
  devicesCollection.find({
    type: driverType
  });

const getDevicesByDriver = async (driverId, devicesCollection) =>
  devicesCollection.find({
    driverId
  });

const getDeviceById = async (deviceId, devicesCollection) => {
  const device = devicesCollection.findOne({
    deviceId
  });

  if (!device) {
    const e = new Error("device not found");
    e.type = "NotFound";
    throw e;
  }
  return device;
};

const getDeviceTypes = async schemas => schemas.deviceTypes;

const runCommand = async (
  deviceId,
  command,
  body,
  driverList,
  devicesCollection,
  schemas,
  jsonValidator
) => {
  const device = devicesCollection.findOne({
    deviceId
  });
  if (!device) {
    const e = new Error("device not found");
    e.type = "NotFound";
    throw e;
  }
  if (typeof device.commands[command] === "undefined") {
    const e = new Error("command not found");
    e.type = "BadRequest";
    throw e;
  }
  if (device.commands[command] === false) {
    const e = new Error("command not supported");
    e.type = "BadRequest";
    throw e;
  }
  const driverObj = driverList[device.driverId];

  const fnName = `command_${command}`;
  // if a schema is specified, confirm that the request body matches it
  const commandRequestSchema =
    schemas.deviceTypes[driverObj.driverType].commands.properties[command]
      .requestSchema;
  if (commandRequestSchema) {
    const validated = jsonValidator.validate(body, commandRequestSchema);
    if (validated.errors.length !== 0) {
      const e = new Error("the supplied json is invalid");
      e.type = "Validation";
      e.errors = validated.errors;
      throw e;
    }
  }
  return driverObj.api[fnName](device, body);
};

const removeDevice = async (deviceId, devicesCollection, driverList, comms) => {
  const device = await getDeviceById(deviceId, devicesCollection);
  // call the driver if there is a removeDevice method
  const driverObj = driverList[device.driverId];
  if (driverObj.api.removeDevice) {
    await driverObj.api.removeDevice();
  }

  // call the interface's removeDevice method
  const commsInterface = comms.getActiveCommsById(driverObj.comms);
  await commsInterface.removeDevice(device.originalId);

  // remove the device from the database
  devicesCollection.remove(device);
};

const getDriverPairingInstructions = async (driverId, driverList) => {
  if (!driverList[driverId]) {
    const e = new Error("driver not found");
    e.type = "NotFound";
    throw e;
  }
  if (driverList[driverId].api.pairingInstructions) {
    return {
      markdown: await driverList[driverId].api.pairingInstructions()
    };
  }
  return {};
};

const getDeviceFailedRemovalInstructions = async (
  deviceId,
  devicesCollection,
  driverList
) => {
  const device = await getDeviceById(deviceId, devicesCollection);
  if (!device) {
    const e = new Error("device not found");
    e.type = "NotFound";
    throw e;
  }
  if (!driverList[device.driverId]) {
    const e = new Error("driver not found");
    e.type = "NotFound";
    throw e;
  }
  if (driverList[device.driverId].api.failedRemovalInstructions) {
    return {
      markdown: await driverList[device.driverId].api.failedRemovalInstructions(
        deviceId
      )
    };
  }
  return {};
};

module.exports = (
  devicesCollection,
  eventsCollection,
  md5,
  driverUtils,
  deviceUtils,
  driverList,
  jsonValidator,
  schemas,
  comms
) => ({
  getDriversWithStats: () => getDriversWithStats(devicesCollection, driverList),
  discover: driverId =>
    discover(
      driverId,
      driverUtils,
      devicesCollection,
      md5,
      deviceUtils,
      driverList
    ),
  getEventDescriptions: () => getEventDescriptions(schemas),
  getCommands: () => getCommands(schemas),
  getAllDevices: () => getAllDevices(devicesCollection),
  getDevicesByType: driverType =>
    getDevicesByType(driverType, devicesCollection),
  getDevicesByDriver: driverId =>
    getDevicesByDriver(driverId, devicesCollection),
  getDeviceById: deviceId => getDeviceById(deviceId, devicesCollection),
  getDeviceTypes: () => getDeviceTypes(schemas),
  runCommand: (deviceId, command, body) =>
    runCommand(
      deviceId,
      command,
      body,
      driverList,
      devicesCollection,
      schemas,
      jsonValidator
    ),
  removeDevice: deviceId =>
    removeDevice(deviceId, devicesCollection, driverList, comms),
  getDriverPairingInstructions: driverId =>
    getDriverPairingInstructions(driverId, driverList),
  getDeviceFailedRemovalInstructions: deviceId =>
    getDeviceFailedRemovalInstructions(deviceId, devicesCollection, driverList)
});
