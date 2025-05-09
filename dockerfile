FROM node:20

WORKDIR /app


COPY package*.json ./


COPY prisma ./prisma


RUN npm install



COPY . .


CMD ["npm", "start"]
