#!/bin/bash
sudo apt-get update
sudo apt-get install -y git chromium-browser python3-pip
git clone https://github.com/FZJ-INM5/JuHPLC
cd JuHPLC
sudo pip3 install -r requirements.txt
python3 manage.py migrate
sudo cp juhplc.service /etc/systemd/system/juhplc.service
sudo systemctl enable juhplc
sudo systemctl start juhplc
