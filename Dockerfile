FROM node:14 AS build_stage
WORKDIR /app
COPY package*.json .
RUN npm install
COPY . .
RUN npm run dev

#FROM nginx
#COPY --from=build_stage /app/build /usr/share/nginx/html
