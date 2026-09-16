FROM node:22

WORKDIR /app

COPY . .

RUN grep -R "fast-equals" . || true

RUN npm install --verbose

RUN npm run build

EXPOSE 3009

CMD ["npm", "start"]
