FROM ubuntu:questing-20251007

RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y curl git && \
    rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash && \
    apt-get install -y nodejs && \
    npm install -g npm@11.2.0 && \
    npm install -g yo generator-code @vscode/vsce && \
    rm -rf /var/lib/apt/lists/*

ARG USERNAME=ubuntu
USER $USERNAME
WORKDIR /home/$USERNAME/
