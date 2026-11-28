MFDIY for Windows
=================

MFDIY lets you build your own MFDs and show them on a phone or tablet
while you fly. No code required.

This is a beta. Star Citizen's telemetry isn't connected yet, so the
bridge is simulating Star Citizen: what your MFDs show is made up, not
read from the game.


1. Extract the zip
------------------

Right-click the zip and choose Extract All. Don't open MFDIY.cmd from
inside the zip: it can't start from there.

Tip: before extracting, right-click the zip, choose Properties, tick
Unblock and choose OK. Windows then asks fewer questions later.

Put the MFDIY folder anywhere you like, for example in Documents. Keep
it in the same place when you update (see step 5), so Windows remembers
what you allowed.


2. Start the bridge
-------------------

Open the MFDIY folder and double-click MFDIY.cmd. A window opens: that's
the bridge. Keep it open while you use MFDIY; close it to stop the
bridge.

MFDIY isn't signed yet, so Windows may say "Windows protected your PC".
Choose More info, then Run anyway. It may also ask whether you want to
run MFDIY.cmd: choose Run.


3. Allow it on your network
---------------------------

The first time, Windows asks whether "Node.js JavaScript Runtime" may
use the network. Node.js comes with MFDIY and runs the bridge. Tick
Private networks and choose Allow. Without it, your phone and tablet
can't connect.

If you clicked Cancel:
  1. Open Windows Security, then Firewall & network protection.
  2. Choose "Allow an app through firewall", then "Change settings".
  3. Tick Private next to every "Node.js JavaScript Runtime".
  4. Choose OK.

If your phone or tablet still can't connect, Windows may treat your
home network as a public one. Open Settings, Network & internet, choose
your connection (Wi-Fi or Ethernet) and set its network profile type to
Private.


4. Connect your phone or tablet
-------------------------------

Your phone or tablet must be on the same network as this PC.

Scan the QR code in the bridge's window with its camera. It opens your
profiles. If it doesn't, type one of the addresses listed under the
QR code into the device's browser.

To open one profile straight away, open the address that ends in
/connect on this PC (it's in the bridge's window), choose the profile
and scan the QR code shown there. That profile then waits for a tap to
engage, which keeps the screen on.

Your PC may be on several networks (a VPN, WSL, a virtual machine). If
the first address doesn't work, the /connect page lets you choose
another.


5. Your profiles
----------------

Profiles are saved on this PC, in:

  %APPDATA%\MFDIY

(usually C:\Users\<your name>\AppData\Roaming\MFDIY). The bridge's
window shows the exact folder. They're not kept in the MFDIY folder, so
to update MFDIY, close the bridge, delete the old MFDIY folder and
extract the new zip in its place. Your profiles stay.

To back up your profiles, copy that folder.


Ports
-----

The bridge uses port 80 when it's free, so addresses need no port.
If another program already uses it, the bridge takes port 8420 (or any
free port) and shows the address with the port.


More
----

https://mfdiy.app

MFDIY is an unofficial fan project and is not affiliated with or
endorsed by any game developer or publisher. It's free and open source
(MIT licence, see LICENSE.txt). Node.js and the other parts that come
with it have their own licences: see node\LICENSE.txt and
bridge\THIRD-PARTY-NOTICES.txt.
