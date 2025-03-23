FROM ubuntu:22.04

RUN apt update
RUN apt upgrade -y
RUN apt install -y curl

RUN curl -fsSL https://deb.nodesource.com/setup_21.x | bash
RUN apt install -y nodejs

RUN npm install -g yo generator-code
RUN npm install -g vsce

RUN apt-get update
RUN apt-get install -y git
RUN rm -rf /var/lib/apt/lists/*

ARG USERNAME=nUser
ARG GROUPNAME=nUser
ARG UID=1000
ARG GID=1000
RUN groupadd -g $GID $GROUPNAME && \
    useradd -m -s /bin/bash -u $UID -g $GID $USERNAME
USER $USERNAME
WORKDIR /home/$USERNAME/
