FROM ubuntu:25.04

RUN apt update
RUN apt upgrade -y
RUN apt install -y curl

RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash
RUN apt install -y nodejs
RUN npm install -g npm@11.2.0

RUN npm install -g yo generator-code
RUN npm install -g vsce

RUN apt-get update
RUN apt-get install -y git
RUN rm -rf /var/lib/apt/lists/*

ARG USERNAME=ubuntu
USER $USERNAME
WORKDIR /home/$USERNAME/
