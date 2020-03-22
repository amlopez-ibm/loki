FROM node:10.16.3

RUN curl -L -O https://artifacts.elastic.co/downloads/beats/filebeat/filebeat-7.4.2-amd64.deb
RUN dpkg -i filebeat-7.4.2-amd64.deb

COPY filebeat.yml /etc/filebeat/filebeat.yml

WORKDIR /usr/src/app
COPY package.json .
RUN npm install
RUN /usr/bin/filebeat &

COPY . .
RUN mkdir logs || true
RUN chmod 777 -R logs
RUN rm logs/* || true
RUN rm -rf /etc/mysql || true
RUN mkdir /var/lib/filebeat
RUN chmod 777 -R /var/lib/filebeat
RUN mkdir /var/log/filebeat
RUN chmod 777 -R /var/log/filebeat

EXPOSE 8080
CMD /usr/bin/filebeat & npm start