Linux Server Administration & Nginx Reverse Proxy

This document describes the server hardening, firewall, and reverse proxy setup used to deploy the Smart Queue Management System.

1. User Permissions & SSH Hardening
Application runs under a non-root user (harish_arumugam) with sudo privileges via membership in the sudo group — no direct root login.
Edited /etc/ssh/sshd_config:
PermitRootLogin no — disables SSH login as root entirely.
PasswordAuthentication no — disables password-based SSH login.
Generated an ED25519 SSH key pair and added the public key to ~/.ssh/authorized_keys, so authentication is key-based only.
Restarted the SSH service after changes: sudo systemctl restart ssh
Verified the new config with a fresh connection from a separate terminal before closing the original session, to avoid getting locked out.
2. Firewall (UFW)

Configured UFW to deny all incoming traffic by default, with explicit allow rules for only the required ports:

sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

Verified with sudo ufw status verbose:

Default: deny (incoming), allow (outgoing)
Only 22, 80, 443 allowed (IPv4 and IPv6)
3. Application Stack

The Smart Queue Management System runs as four Docker containers, orchestrated via docker-compose.yml:

client — React frontend — internal port 8080
server — Express API — internal port 5000
mongo — MongoDB database — internal port 27017
redis — Redis cache — internal port 6379

Containers are started with: docker compose up -d --build

4. Nginx Reverse Proxy

Installed system-level Nginx (separate from the containers) to act as the public-facing reverse proxy in front of the client and server containers.

Config file: nginx.conf (in this same folder), installed at /etc/nginx/sites-available/smart-queue and symlinked into sites-enabled.

Key features:

HTTP to HTTPS redirect: all port 80 traffic gets a 301 redirect to HTTPS.
Reverse proxy routing:
/ routes to the React client container (127.0.0.1:8080)
/api/ routes to the Express API container (127.0.0.1:5000)
Gzip compression enabled for text, JSON, JS, CSS, and XML responses.
Caching headers: Cache-Control public, max-age=600 applied to frontend responses.
Rate limiting: /api/ requests are limited to 10 requests/second per client IP (limit_req_zone in nginx.conf, applied via limit_req zone=api_limit burst=20 nodelay), protecting the API from abuse.
5. SSL/TLS

Since this is a sandbox environment without a public domain name, SSL termination uses a self-signed certificate rather than Let's Encrypt, generated with openssl req -x509 -nodes -days 365 -newkey rsa:2048, using the server IP as the certificate common name.

Nginx is configured to use TLS 1.2/1.3 only, with the certificate and key referenced in the server block listening on port 443.

In a production deployment with a real domain, this would be replaced with a Let's Encrypt certificate via Certbot instead, e.g. sudo certbot --nginx -d yourdomain.com

6. Verification
sudo nginx -t — confirmed configuration syntax is valid.
curl -k https://localhost/ — confirmed frontend served over HTTPS.
curl -k https://localhost/api/health — confirmed API reachable over HTTPS through the proxy, returning status ok.
curl -I http://localhost/ — confirmed HTTP requests receive a 301 redirect to HTTPS.
Verified in-browser at https://server-ip that the full application loads and functions (joining the queue, etc.), accepting the expected self-signed certificate warning.