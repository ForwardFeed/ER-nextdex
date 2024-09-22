#!/bin/env bash
cd ..
sudo docker build -t app . --secret id=config.ts,src=devDexServer/config.ts
echo "Now Running the docker"
sudo docker run -it --rm --name app app