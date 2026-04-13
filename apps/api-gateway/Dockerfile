FROM node:20-alpine
WORKDIR /app
COPY package.json tsconfig.json ./
RUN npm install
COPY src ./src
COPY tests ./tests
COPY jest.config.cjs ./
RUN npm run build
EXPOSE 8080
CMD ["npm", "start"]
