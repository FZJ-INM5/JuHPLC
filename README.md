# JuHPLC

This project allows using chromatography on imported files (csv) and data aquisition from a compatible hardware device.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. 
See deployment for notes on how to deploy the project on a live system.

### Prerequisites

Install a fresh raspbian onto the SD card you are gonna use, connect network to it.

### Installing

The installation is as easy as running the setup script. This will download the current development version of the project along with all its dependencies.

```
https://raw.githubusercontent.com/FZJ-INM5/JuHPLC/master/setup.sh | sudo bash
```

After this it is required to create a user account using
```
python3 /home/pi/JuHPLC/manage.py createsuperuser
```
and following the instructions on screen.

## Running the tests

Currently none - Todo

## Usage

Use your favourite webbrowser and connect to the IP-address / name of the raspberry in it.

## Built With

* [Django](https://www.djangoproject.com/) - The web framework used
* [Dygraphs](http://dygraphs.com/) - An awesome charting-library
* [python](https://www.python.org/) - Used to generate RSS Feeds
* Bootstrap
* and many more things to be added later

## Contributing

Please read [CONTRIBUTING.md](https://gist.github.com/PurpleBooth/b24679402957c63ec426) for details on our code of conduct, and the process for submitting pull requests to us.

## Authors

* **Volker Mauel** - *Initial work* - [Volkermauel](https://github.com/volkermauel)

## License

This project is licensed under the TODO

## Acknowledgments


