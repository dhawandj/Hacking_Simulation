
import { ModuleType } from './types';
import { LayoutDashboard, Terminal, Cctv, Network, Server, Crosshair, Smartphone, Mic, Settings } from 'lucide-react';

export const MODULES = [
  { id: ModuleType.DASHBOARD, label: 'OVERVIEW', icon: LayoutDashboard },
  { id: ModuleType.TERMINAL, label: 'TERMINAL', icon: Terminal },
  { id: ModuleType.CCTV, label: 'SURVEILLANCE', icon: Cctv },
  { id: ModuleType.NETWORK, label: 'HOME NET', icon: Network },
  { id: ModuleType.SERVERS, label: 'CORP SERVERS', icon: Server },
  { id: ModuleType.DRONE, label: 'DRONE CTRL', icon: Crosshair },
  { id: ModuleType.MOBILE, label: 'MOBILE INT', icon: Smartphone },
  { id: ModuleType.VOICE, label: 'VOICE MASK', icon: Mic },
  { id: ModuleType.SETTINGS, label: 'SYSTEM CFG', icon: Settings },
];

export const FAKE_LOGS = [
  "Initializing handshake protocol...",
  "Bypassing firewall (Layer 7)...",
  "Injecting SQL payload into root directory...",
  "Decryption key found: 0x4F92A...",
  "Tracing IP address origin...",
  "Packet sniffer active on port 8080...",
  "Downloading confidential manifest...",
  "Override sequence initiated...",
  "Access granted to mainframe.",
  "Rerouting DNS traffic...",
  "Masking signature...",
  "Uploading trojan.exe...",
  "Brute force attempt: admin/password123...",
  "Connection established with satellite uplink.",
  "Cleaning log files...",
  "System kernel updated.",
];

export const TERMINAL_COMMANDS = [
  "nmap -sV -p- 192.168.1.x",
  "ssh root@mainframe.corp.net",
  "./exploit_v4.sh --silent",
  "grep -r 'password' /var/www/",
  "tracepath -m 30 8.8.8.8",
  "ping -c 1000 127.0.0.1",
  "decrypt_ssl_stream.py",
];

export const FAKE_SMS = [
    { id: 1, from: "+1 (555) 019-2834", text: "Target has arrived at location. Stand by.", time: "10:42 PM" },
    { id: 2, from: "UNKNOWN", text: "Don't forget the package. Lockbox 442.", time: "10:45 PM" },
    { id: 3, from: "+1 (555) 012-9988", text: "Did you secure the perimeter?", time: "10:48 PM" },
    { id: 4, from: "AlertSys", text: "SECURITY ALERT: Motion detected in Sector 7.", time: "10:55 PM" },
    { id: 5, from: "+1 (555) 882-1100", text: "Meeting changed to 2300 hours.", time: "11:02 PM" },
    { id: 6, from: "Ghost", text: "Upload complete. Disconnect now.", time: "11:15 PM" },
];

export const DARK_WEB_ITEMS = [
    { id: 1, name: "Zero-Day Exploit Pack (iOS 17)", price: 2.5000, desc: "Remote code execution vulnerability.", seller: "xX_RootMaster_Xx" },
    { id: 2, name: "Corp Database Dump (Fortune 500)", price: 1.2000, desc: "2TB of sensitive financial records.", seller: "LeakKing" },
    { id: 3, name: "Ghost Protocol VPN", price: 0.1500, desc: "Untraceable double-hop routing.", seller: "AnonOps" },
    { id: 4, name: "Physical Keycard Cloner", price: 0.4500, desc: "Works on HID iClass SE.", seller: "HardwareHacker" },
    { id: 5, name: "Valid Credit Cards (Bulk)", price: 0.0500, desc: "Batch of 50, varying limits.", seller: "CardingCrew" },
    { id: 6, name: "DDoS Botnet Rent (24h)", price: 0.8000, desc: "100k IoT devices ready.", seller: "NetDestroyer" },
];

export const DARK_CHAT_LOGS = [
    { user: "System", text: "Connected to encrypted channel." },
    { user: "Admin", text: "Welcome. No logs are kept here." },
    { user: "Buyer77", text: "Is the exploit verified?" },
    { user: "Vendor_X", text: "Yes, escrow available." },
];
