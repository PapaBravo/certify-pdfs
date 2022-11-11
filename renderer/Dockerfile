FROM node:16

RUN wget https://github.com/wkhtmltopdf/packaging/releases/download/0.12.6-1/wkhtmltox_0.12.6-1.buster_amd64.deb
RUN dpkg --configure -a
#RUN apt-get install -y xvfb libfontconfig fontconfig libpng16-16 libxrender1 xfonts-75dpi build-essential xorg
RUN apt-get update \
    && apt-get install -y xvfb libfontconfig fontconfig libpng16-16 libxrender1 xfonts-75dpi \
    && apt-get purge -y --auto-remove $buildDeps
RUN dpkg -i wkhtmltox_0.12.6-1.buster_amd64.deb

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# RUN npm install
# If you are building your code for production
RUN npm ci --only=production

# Bundle app source
COPY . .

CMD [ "node", "server.js" ]