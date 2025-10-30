FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
COPY . .
RUN npm ci 
EXPOSE 5000
CMD ["node", "server.js"]
