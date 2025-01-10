FROM node:lts-alpine

RUN apk --no-cache add python3 make g++

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm rebuild bcrypt --build-from-source

EXPOSE 3030

CMD ["npm", "run", "start:dev"]