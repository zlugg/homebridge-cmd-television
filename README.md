# Homebridge television command plugin

## Installation

1. install homebridge
2. install my plugin using: sudo npm i -g homebridge-cmd-television
3. configure accesory (See configuration sample)
Thats it! Now when you turn the television on or switch the input to another source it will run the command set in the config.

## Configuration

Configuration sample:

 ```
"accessories": [
    {
      "accessory": "cmd-television",
      "name": "PS4",
      "oncmd": "ps4-waker",
      "offcmd": "ps4-waker standby",
      "interval": 60,
      "statecmd": "ps4-waker search | jq -r '.statusLine, .[\"running-app-titleid\"]'",
      "stateok": "200 Ok",
      "inputMap": {
        "1": {
          "name": "netflix",
          "label": "Netflix",
          "identifier": "CUSA00127",
          "cmd": "ps4-waker start CUSA00127"
        },
        "2": {
          "name": "youtube",
          "label": "Youtube",
          "identifier": "CUSA01116",
          "cmd": "ps4-waker start CUSA01116"
        },
        "3": {
          "name": "appletv",
          "label": "Apple TV",
          "identifier": "CUSA24386",
          "cmd": "ps4-waker start CUSA24386"
        },
        "4": {
          "name": "cyberpunk2077",
          "label": "Cyberpunk 2077",
          "identifier": "CUSA18278",
          "cmd": "ps4-waker start CUSA18278"
        },
        "5": {
          "name": "genshinImpact",
          "label": "Genshin Impact",
          "identifier": "CUSA23678",
          "cmd": "ps4-waker start CUSA23678"
        }
      }
    }
  ]
```

Warning do not install using git clone and moving the folder to youre node_modules dir. This will break the plugin.
