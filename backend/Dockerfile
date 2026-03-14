FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Environment configuration
ENV API_PORT=8080

EXPOSE 8080

CMD ["npx", "nodemon", "server.js"]
