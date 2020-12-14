var request = require("request");
var Service, Characteristic, VolumeCharacteristic;
const { exec } = require('child_process');

module.exports = function(homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;

  homebridge.registerAccessory(
    "homebridge-cmd-television",
    "cmd-television",
    CmdTelevisionAccessory
  );
};

function CmdTelevisionAccessory(log, config) {
  this.log = log;
  this.config = config;
  this.name = config["name"];
  this.oncmd = config["oncmd"];
  this.offcmd = config["offcmd"];
  this.statecmd = config["statecmd"];
  this.stateok = config["stateok"];
  this.inputMap = config["inputMap"];
  this.interval = config["interval"];

  this.enabledServices = [];

  this.state = false;
  this.activeIdent = 0;

  this.tvService = new Service.Television(this.name, "Television");

  this.tvService.setCharacteristic(Characteristic.ConfiguredName, this.name);

  this.tvService.setCharacteristic(
    Characteristic.SleepDiscoveryMode,
    Characteristic.SleepDiscoveryMode.ALWAYS_DISCOVERABLE
  );
  this.tvService
    .getCharacteristic(Characteristic.Active)
    .on("set", this.setPowerState.bind(this))
    .on("get", this.getPowerState.bind(this))

  this.tvService
    .getCharacteristic(Characteristic.ActiveIdentifier)
    .on("set", this.setInput.bind(this))
    .on("get", this.getInput.bind(this))

  this.enabledServices.push(this.tvService);
  for (let key in this.inputMap) {
    let source = this.inputMap[key]
    let newInputService = createInputSource(source.name, source.label, key);
    this.tvService.addLinkedService(newInputService);
    this.enabledServices.push(newInputService);
  }
  this.statePolling()
}

//get input
CmdTelevisionAccessory.prototype.getInput = function(callback) {
  return callback(null, this.activeIdent);
};

//set input
CmdTelevisionAccessory.prototype.setInput = function(newValue, callback) {
  const remoteAction = this.inputMap[newValue];
  if (!remoteAction) {
    callback(null);
  } else {
    callback();
    this.log("choose channel: "+newValue);
    exec(this.inputMap[newValue].cmd);
  };
}

// Method to determine current state
CmdTelevisionAccessory.prototype.getState = function (callback) {
  var self = this;

  // Return cached state if no statecmd provided
  if (this.statecmd === undefined) {
    callback(null, this.state);
    return;
  }

  // Execute command to detect state
  exec(this.statecmd, function (error, stdout, stderr) {
    var state = false;
    var activeIdent = 0;

    // Error detection
    if (stderr) {
      self.log("Failed to determine " + this.name + " state.");
      self.log(stderr);
    }
    if (stdout) {
      var ks = stdout.split("\n");
      if (ks[0] === self.stateok) {
        state = true
      }
      let foundIdent = 0
      for (let key in self.inputMap) {
        let source = self.inputMap[key]
        if (source.identifier === ks[1]) {
          activeIdent = key
	}
      }
    }

    self.log("State: " + state + " ident: " + activeIdent);
    callback(stderr, state, activeIdent);
  });
}

//state polling
CmdTelevisionAccessory.prototype.statePolling = function() {
  var self = this
  clearTimeout(this.name)
  this.getState(function (error, state, activeIdent) {
    if (!error && state !== this.state) {
      self.state = state
      self.activeIdent = activeIdent
      self.tvService.getCharacteristic(Characteristic.Active).getValue()
      self.tvService.getCharacteristic(Characteristic.ActiveIdentifier).getValue();
    }
  })
  setTimeout(this.statePolling.bind(this), this.interval * 1000)
};

//get power status
CmdTelevisionAccessory.prototype.getPowerState = function(callback) {
  return callback(null, this.state);
};

//set power status
CmdTelevisionAccessory.prototype.setPowerState = function(state, callback) {
  this.log.debug("state", state);
  if (state) {
    exec(this.oncmd);
    this.log("turn on");
    callback();
  } else {
    exec(this.offcmd);
    this.log("turn off");
    callback();
  };
};

CmdTelevisionAccessory.prototype.getServices = function() {
  return this.enabledServices;
};

//make the input
function createInputSource(
  id,
  name,
  number,
  type = Characteristic.InputSourceType.HDMI
) {
  var input = new Service.InputSource(id, name);
  input
    .setCharacteristic(Characteristic.Identifier, number)
    .setCharacteristic(Characteristic.ConfiguredName, name)
    .setCharacteristic(
      Characteristic.IsConfigured,
      Characteristic.IsConfigured.CONFIGURED
    )
    .setCharacteristic(Characteristic.InputSourceType, type);
  return input;
}
