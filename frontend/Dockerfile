FROM node:20.19.2

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

ENTRYPOINT npm run build && npm run start