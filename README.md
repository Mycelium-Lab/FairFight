# Multiplayer Game
You appear in a locked room with another player. Your goal is to survive and kill the other player. When you die you lose money. When your opponent dies you receive their money.

# How to test it?

0. ```npm install pm2 -g```
1. In cloned repo directory: ```npm i```
2. ```npm run prod```
3. visit http://127.0.0.1:5000/

# How to deploy?

<h2>Install Node.js</h2>

```
cd ~
curl -sL https://deb.nodesource.com/setup_16.x -o /tmp/nodesource_setup.sh
```

```
sudo bash /tmp/nodesource_setup.sh
sudo apt install nodejs
```
Check version
```
node -v
```

<h2>Install Git</h2>

```
sudo apt-get update
sudo apt-get install git
```

<h2>Clone repository</h2>

```
git clone https://github.com/Mycelium-Lab/tonGame.git
```

<h2>Install PostgreSQL</h2>

```
sudo apt update 
sudo apt install postgresql postgresql-contrib
sudo -i -u postgres
psql 
create database somedb;
createuser egorg;
ALTER USER egorg WITH ENCRYPTED PASSWORD 'password';
alter user egorg superuser createrole somedb;
\q
psql -h localhost -p 5432 -U egorg tongame
\i path/to/tongame/tables.sql

```

<h2>Install Redis</h2>

```
sudo apt install redis-server
sudo systemctl status redis
```

<h2>Install pm2</h2>

```
npm install pm2 -g
```

<h2>Create .env file</h2>

```
nano .env
```

With variables

```
DB="tongame"
DB_USER="egorg"
DB_PASSWORD="password"
PRIVATE_KEY="signerkey"
```

<h2>Install and configure NGINX</h2>

```
sudo apt update
sudo apt install nginx
sudo apt-get remove apache2*
sudo apt install ufw
```

Firewall

```
ufw allow ssh
ufw app list
sudo ufw allow 'Nginx HTTP'
```

Check Nginx

```
sudo systemctl status nginx
```

Create config files

```
sudo nano /etc/nginx/sites-available/tongame
sudo nano /etc/nginx/sites-enable/tongame
```
Add to both
```
upstream websocket {
    server localhost:8033;
}

server {
    listen 80;
    server_name 141.8.195.14;
    location / {
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $host;
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        # location /overview {
        #     proxy_pass http://127.0.0.1:3000$request_uri;
        #     proxy_redirect off;
        # }
    }
    location /socket.io/ {
        proxy_pass http://127.0.0.1:8033;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }
}

```
Check Nginx

```
nginx -t
```

<h2>Run application</h2>

```
cd ~/tongame
npm i
npm run prod
```

<h2>Possible errors</h2>

<h3>Polling websocket error</h3>

Change in the end of ```lib/game/main.js```

```
window.gameRoom = new GameRoom(
  `${window.location.protocol}//` + window.location.hostname + '',
  address,
  localStorage.getItem('publicKey')
);
```