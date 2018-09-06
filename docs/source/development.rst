Development
===========

This software relies on Django and Vue heavily. If you are not familiar with their respective concepts yet, I'd suggest to take a look at them before reading any further.

WebApp/Webapp/Settings.py file
------------------------------
This file contains the django configuration.

The most imporant configuration parameters here are the following:

DATABASES
_________
This parameter controls which Database-Backend will be used for persisting the data.

The Default is to use an sqlite database for everything.

Commented you will see an exmaple configuration for a MySQL/Mariadb-Backend.

All Database-engines supported by Django are supported here, so feel free to play around with using PostgreSQL or any other of the supported backends.

STATIC_ROOT
___________

This is the static directory that will be served by the Django-internal Webserver.

STATIC_URL
___________

This is the URL of the static directory. This means by accessing http://localhost/static/ you will be able to access the files from the static directory.

COMPRESS_ENABLED
________________

This Option controls the compressing of included Javascript and Css files.

This has to be ``True`` (default) to enable the html export, as the re requirements will be packed into the single html file and served as this.

The Runtime-implications of this are neglectable since the additional time to compress the files is saved by only requiring one socket.

During development you should set this to ``False`` to allow easier debugging.

CHROMIUM_PATH
_____________

This is the path to the chromium executable.

If you want to use PDF exports, this is required to be set to a valid executable.

On Linux-systems (default) this should point to ``chromium-browser``.

On Windows-systems this setting could point to ``D:\\chrome-win32\\chrome.exe``. 

.. note:: Double-backslashes are required to prevent misinterpretation as escape-sequence.

SESSION_SAVE_EVERY_REQUEST
__________________________

This setting makes sure user-sessions are refreshed with every request. 

This prevents unexpected session termination during normal operation.

I'd suggest keeping this set to ``True`` (default). Only change this if you know what you're doing.

Changing Mouse-Behaviour
------------------------

All interactions with the graphs are handled inside the Vue-Component dygraphs-graph.js located at ``JuHPLC/static/js/JuHPLC/Vue-Components``.

The interactionModel defined inside the mounted() method can be adjusted to personal preference.

This model has been developed with the default dygraphs interaction model in mind, so all regular actions that work inside dygraphs still work as expected.

Changing Dygraphs-initialization
--------------------------------

If you want to pass additional options to the dygraphs Object during initialization look for the line ``this.$data._graph = new Dygraph(...)``.

Changing the Peak-Table
-----------------------

The Component of the Peak-Table is located at ``JuHPLC/static/js/JuHPLC/Vue-Components/peak-table.js``.

All of the Calculations for Peakarea, retention factor and similar are located in the ``JuHPLC/static/js/JuHPLC/Peak.js`` file. This should be included for proper functionality. 

Changing Rendering of the Peak-Table
____________________________________

If you want to change rendering aspects, this should happen in the peak-table.js file by calling the correct functions from Peak.js.

Upon Creation of a row in the Peak-Table a SavitzkyGolayPeak object will be created inside the Vue-Component peak-table-row which can be used by accessing ``this.$data._peak`` inside this component.

Changing any other rendering Aspect
-----------------------------------

By using Django-Views most other aspects are handled inside the respective view file located inside ``JuHPLC/templates/``.

``ChromatogramDetails.html`` Is the most important View here, where all of the Vue-Components are initialized, aswell as the chromatography menu-bar is added.


