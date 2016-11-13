FROM node
RUN npm install nodemon -g
WORKDIR /src
EXPOSE 3000
EXPOSE 5858
ENTRYPOINT ["/bin/bash", "-c", "if [ -z \"$REMOTE_DEBUGGING\" ]; then nodemon -L --debug; else nodemon -L --debug-brk; fi"]
COPY . /src
RUN npm install
