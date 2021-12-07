# JuHPLC

This project allows using chromatography on imported files (csv) and data aquisition from a compatible hardware device.

![Flat Badge](https://readthedocs.org/projects/juhplc/badge/?version=latest&style=flat)

## Demo

There are some Demo-Files included, which require no installation and will give you an idea of our software.
* [Demo1](https://fzj-inm5.github.io/JuHPLC-Demo1.html)
* [Demo2](https://fzj-inm5.github.io/JuHPLC-Demo2.html)

## Hardware
For more details on the Hardware, please click [here](https://github.com/FZJ-INM5/JuHPLC-Hardware)

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. 
See deployment for notes on how to deploy the project on a live system.

### Prerequisites

Install a fresh raspbian onto the SD card you are gonna use and connect any network to it.

### Installing

The installation is as easy as running the setup script. This will download the current development version of the project along with all its dependencies.

```
curl https://raw.githubusercontent.com/FZJ-INM5/JuHPLC/master/setup.sh | sudo bash
```

After this it is required to create a user account using
```
python3 /home/pi/JuHPLC/manage.py createsuperuser
```
and following the instructions on screen.

## Running the tests

Currently none - Todo

## Usage

Use your favourite webbrowser and connect to the IP-address / name of the raspberry with it.
To find out the ip, you can easily run the ``` ifconfig ``` command and look for eth0.

For more info check out the [documentation](https://juhplc.readthedocs.io/en/latest/).

## Updating
Switch into the subfolder /home/pi/JuHPLC

Run ```sudo systemctl stop juhplc``` to stop the service.

Run ``` git pull ``` to download the latest sourcecode.

Run ```python3 manage.py migrate``` to update the database.

Start the service again with ```sudo systemctl start juhplc``` .

### Starting fresh
Run ```sudo systemctl stop juhplc && mv db.sqlite3 db.sqlite3.bak && python3 manage.py migrate && sudo systemctl start juhplc```
This will:
1. Stop the Service
2. Move the Database-File to db.sqlite3.bak
3. Create a new Database-File
4. Start the Service again

### Features
* Data aquisition with our arduino-based interface
* Integrating peaks
* Selecting peaks and see their relativ areas
* Zooming into graphs synchronized (X-axis-scaling affects all graphs)
* Keyboard-shortcuts for all important actions (hover over the buttons to find out more!)
* Free axis-scaling
* Export functionality in several formats (CSV, Peaksimple, HTML, PDF-Reports)
* Automatic Peak-Finding based on Savitzky-Golay-Smoothing and filtering
* Free Baseline-editing using supporting points both, linear and with cubic splines

## Built With

* [Django](https://www.djangoproject.com/) - The web framework used
* [python](https://www.python.org/) - used for the backend code
* [Dygraphs](http://dygraphs.com/) - An awesome charting-library
* [Bootstrap](https://getbootstrap.com/) - Frontend framework that allows automatic resizing upon changing the window-size aswell as cross platform compatibility. (mobile devices)
* [Vue.js](https://vuejs.org/) - used for dividing the frontend code into reusable components
* [Pyserial](https://pythonhosted.org/pyserial/) - Allows us to connect with our arduino-based aqusition interface
* [jQuery](https://jquery.com/) - The javascript framework driving the web
* [Math.js](http://mathjs.org/) - For the implementation of [Eilers penalized least squares](https://pubs.acs.org/doi/abs/10.1021/ac034173t)
* [Chromium](https://www.chromium.org/) - Used for PDF-Report generation

## Contributing

Please read [CONTRIBUTING.md](https://gist.github.com/PurpleBooth/b24679402957c63ec426) for details on our code of conduct, and the process for submitting pull requests to us.

## Authors

* **Volker Mauel** - *Initial work* - [Volkermauel](https://github.com/volkermauel)

## License

This project is licensed under the MIT License

Copyright (c) 2018 Volker Mauel, Dirk Bier, Bernd Neumaier

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


## Acknowledgments
* **Dr. Dirk Bier** - Initial project idea, hardware creation, first software implementations of the arduino code
* **Dan Vanderkam** - For the dygraphs project, without which it would have been much more work
