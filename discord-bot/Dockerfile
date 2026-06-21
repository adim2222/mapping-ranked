FROM archlinux:latest

RUN pacman -Syu --noconfirm nodejs npm

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

CMD ["node", "index.js"]
