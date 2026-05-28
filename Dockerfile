FROM ubuntu:questing-20251217

RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y curl git \
        libglib2.0-0 libx11-6 libxcomposite1 libxdamage1 libxext6 libxfixes3 \
        libxrandr2 libgbm1 libxkbcommon0 libpango-1.0-0 libcairo2 libasound2 \
        libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 libxcb1 \
        libxshmfence1 libgl1 xvfb && \
    rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash && \
    apt-get install -y nodejs && \
    npm install -g npm@11.2.0 && \
    npm install -g yo generator-code @vscode/vsce && \
    rm -rf /var/lib/apt/lists/*

ARG USERNAME=ubuntu
USER $USERNAME
WORKDIR /home/$USERNAME/
