# hyperdrive-daemon-app

WIP

## Usage

_Thank you for installing the Hyperdrive Daemon app!_

To operate it, you need to have the [`hyperdrive-daemon-client`](https://github.com/andrewosh/hyperdrive-daemon-client) or [`hyperdrive-daemon`](https://github.com/andrewosh/hyperdrive-daemon) node module installed globally:

```bash
$ npm install -g hyperdrive-daemon-client
```

Then use the `hyperdrive` CLI to for example add a drive:

```bash
$ hyperdrive create ~/Hyperdrive/my-drive
✔ Created a drive with the following info:

  Path: /Users/julian/Hyperdrive/my-drive
  Key:  f692424821fc16a7c97d82aa2ea2a9bf75bce0d25019ada5356a2dc657cbbb66
  Seeding: true
```

For more commands, see the [hyperdrive-daemon README](https://github.com/andrewosh/hyperdrive-daemon#cli).

Turn on `Launch at Login` from the tray menu if you want to have your Hyperdrives available at all times.
