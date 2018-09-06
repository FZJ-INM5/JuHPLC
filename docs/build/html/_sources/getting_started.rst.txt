Getting Started
===============

This document will show you how to get up and running with JuHPLC.

You will have your environment ready in 5 minutes.

Prerequisites
---------------

Install a fresh raspbian onto the SD card you are gonna use and connect any network to it.

Installing
~~~~~~~~~~~~~~~~~~~

The installation is as easy as running the setup script. This will download the current development version of the project along with all its dependencies.:

    $ curl https://raw.githubusercontent.com/FZJ-INM5/JuHPLC/master/setup.sh | sudo bash

After this it is required to create a user account using:

    $ python3 /home/pi/JuHPLC/manage.py createsuperuser

and following the instructions on screen.

Usage
~~~~~
Use your favourite webbrowser and connect to the IP-address / name of the raspberry with it.
To find out the ip, you can easily run the ``ipconfig`` command and look for ``eth0``.
See :doc:`Usage <usage>` for an advanced introduction to the usage of your System.

Updating
--------
Switch into the subfolder /home/pi/JuHPLC
Run ``sudo systemctl stop juhplc`` to stop the service.
Run ``git pull`` to download the latest sourcecode.
Run ``python3 manage.py migrate`` to update the database.
Start the service again with ``sudo systemctl start juhplc``.