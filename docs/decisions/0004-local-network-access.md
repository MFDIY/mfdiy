# 0004: Reaching the bridge on the local network

- **Status:** Accepted
- **Date:** 2026-11-24 (updated 2026-11-28, when the QR code was built; not checked yet on real devices)

## Decision

1. **Plain HTTP on the LAN.** The bridge serves the app over `http://` and telemetry over `ws://` on the same origin (see 0003). No HTTPS in version 1.
2. **A friendly name via mDNS.** The bridge advertises itself as `mfdiy.local`, so users open `http://mfdiy.local` instead of an IP address.
   - Listen on port 80 when it's free, so no port is needed in the address; otherwise fall back to 8420, then to any free port (8420 can fall in a range Windows reserves for Hyper-V or WSL), and show the full address. Windows lets any program use port 80 without admin rights; it's only unavailable when another program (IIS, another web server) has it.
   - If the name is taken (e.g. two bridges on one network), rename automatically (`mfdiy-2.local`) and show the actual name.
3. **A QR code as the primary way to connect.** The bridge's window shows a QR code containing a working address. It also lists the IP-and-port address as a fallback for devices that can't resolve `.local` names.
   - Until the bridge has a window of its own (the Windows download, 0020), its window is the console: it prints a QR code of its likeliest address, lists the others, and points to `/connect` on the PC.
   - `/connect` is the app's **Connect a device** page, reached from the home page's header: a QR code, the address to type, and what it opens (the profiles, or one profile straight away, which then shows tap to engage, 0005). _On trial, not checked yet on real devices._
   - A gaming PC is often on several networks (VPNs, WSL, Hyper-V, VirtualBox). The bridge sends its addresses to the app, home network ranges and real adapters first, and the page offers the others when the first doesn't work.

## Why

- WebSockets don't require HTTPS. An `http://` page may open `ws://` connections; only an `https://` page is blocked from doing so (mixed content). Serving everything from the bridge over HTTP avoids the problem entirely.
- Public certificate authorities never issue certificates for private IPs or `.local` names. The alternatives, self-signed certificates or a custom certificate authority installed on every device, produce browser warnings or put users at risk.
- mDNS is a small Node dependency with no router setup and no internet connection required. `.local` resolves out of the box on Windows 10+, macOS, iOS and Raspberry Pi OS.
- A QR code avoids typing on phones entirely and covers the devices where mDNS doesn't work.

## Consequences

- The app is not a **secure context** on LAN addresses. APIs that need one (service workers and installable PWAs, Wake Lock, clipboard, `crypto.subtle`) are unavailable by default. See 0005 for keeping the display awake.
- The app cannot be hosted on the public site (GitHub Pages) and talk to the bridge; the public site only hosts marketing material and a simulated-data demo.
- Android support for `.local` names varies by version and browser; the QR code and IP fallback cover it.
- The Windows firewall must allow the bridge's HTTP port and mDNS (UDP 5353). On first start, Windows asks whether `node.exe` ("Node.js JavaScript Runtime") may use the network. In the zip (0003), the console tells the player beforehand to allow it on private networks, and afterwards how to allow it if they clicked Cancel; the README adds that a network Windows treats as public must be set to private. An installer could add the rule itself later.

## Revisit when

Secure-context features become essential. This would be a free feature, not a paid one (0013). The upgrade path is the Plex approach: give each bridge its own subdomain of an MFDIY domain (e.g. `<id>.local.mfdiy.app`) pointing at its private IP, with a real certificate issued via a DNS challenge. Known costs:

- An online service that issues DNS records and certificates.
- Let's Encrypt rate limits per registered domain, probably needing a Public Suffix List entry.
- Routers, Pi-hole and ISPs that block public DNS answers pointing to private IPs (DNS rebinding protection).
- Browser permission prompts for public sites accessing the local network.
