Usage
=====

After the initial installation you should be able to use your favorite Browser to load into the system.

Connecting the Interface-Hardware
---------------------------------
Using a regular USB a-to-b cable connect the Interface-Hardware equipped with the Shield to the Arduino. It should flash several times and keep the status LED lit up to indicate a ready state. 

Logging in
-------------------------------
In order to prevent anyone from deleting your data, you will have to log in with the account you created during the installation process, or one provided by your IT.

In the Menu-Bar please select Login.

Once you successfully logged in, you will see the Logout option along with the current Username on the right side of the menu-bar.

Creating the First Chromatogram
-------------------------------
In the Menu-Bar select *New Chromatogram*.

In the following screen you will be able to enter all the relevant data for later analysis aswell as a comment.

Details on the Input fields
~~~~~~~~~~~~~~~~~~~~~~~~~~~

Sample Name
___________
This is the name of the sample you want to measure. Enter it to find a specific measurement later easier.

Column
______
Enter the type of Column you are going to use for the HPLC run.

If you have any previous measurement, you will be offered a list of Columns to select from.

Flow
____
Enter the flow in ml/min that you will be using.

Injection Volume
________________
Enter the injection volume in µl.

Concentration & Concentration Unit
__________________________________
Enter the Concentration of your Sample and the respective unit.

Acquire Counter Channel
_______________________
Here you decide whether you want to make an UV-only run or if you want to measure the Counter-Channel too.

Half Life
_________
Please enter the half life of the radio nuclide you will be measuring. This allows you to get decay-corrected values (corrected to the start of the measurement) for peak areas.

.. note:: Even if you are doing UV-Only runs, you will have to enter a Half Life. Set it to the most oftenly used nuclide to avoid forgetting this later.

UV Wavelength
_____________
Please enter the UV Wavelength at which the detector will be measuring.

Maximum time of data acquisition
________________________________
You can limit the time data will be acquired by setting this to any value other than 0.

.. note:: If you set this, there is currently NO way to extend it during a run. Keep this in mind, and rather stop manually if you are not sure when your peaks will elute.

Sample Rate
___________
Set the Sampling Rate of the interface hardware. Since with our provided Hardware decays will be counted, we've had good results with a Sample Rate of 1 Hz. Up to a Sampling Rate of about 3 the Hardware still is pretty time-consistent, upwards of 4 it tends to drift. That drift is constant for the system itself, so runs made are comparable, but should be taken with a grain of salt.

Comment
_______
You can enter any comment you might find useful in the future here. This can be changed at a later point to extend it wtih more useful information such as starting activity and yield of preparative HPLC.

Factors and Units
_________________
This section can be used to Scale values by a factor. Also it names the Units which will be measured and later on these Names will be used in any reports. If you are not sure if the defaults fit your needs, keep them and make a testing run first.

Channel Order & Shift
_____________________
This defines the direction of Flow in your HPLC system. The first detector usually is the UV detector, and the offset between it and the previous detector is obviously 0 (since there is no previous one). The second detector in our systems is the Counter, which could have a delay of 30 seconds.

This will be used to position the graphs correctly on top of each other. You can verify this functionality by looking at the first x seconds in a measurement. The following channel(s) won't have any data during that time yet.

Use Rheodyne Switch
___________________
This defines if your injection valve has an electrical contact switch which will be used to start a measurement. If you do NOT have one, leave this unchecked. You will have to start the measurement manually by clicking the button or pressing the F4 key on your keyboard.

Eluent
______
Enter the eluents you are using in this HPLC run along with their concentration.

Save
____
Finally press the save button.

The User-Interface
~~~~~~~~~~~~~~~~~~
Upon loading a chromatogram or creating a new one by entering the information mentions above, you will be presented with the details view.

Here you can interact with the data.

Starting a Measurement and Loading Data
_______________________________________
If you have no data in the chromatogram, you can select the interface-hardware to use from a dropdown, or import a CSV file (header has to be present).

Press the ``Start`` Button to start the Measurement. The interface-hardware will begin initializing and shortly after you will see your data coming in.

If you previously selected to use the Rheodyne Switch, data acquisition will be paused until the valve is in the inject-position. Please use the injection valve to initiate the start of the measurement

Stopping a Measurement
______________________
If you have previously selected to use the Rheodyne Switch, you can put your injection valve into load position again, inject the new sample and turn the valve into inject position. 

This will result in a copy of the previous run being made. The comment will be adjusted to include the Run number (e.g. Run: 3).

At any point you will be able to manually stop the run by pressing the ``Stop`` Button.

Interacting with the graphs during a run
________________________________________
You can interact with the graphs during a run. Please remember to press the save button to make sure any changes, such as peak integration, are saved. Pressing the ``Stop`` Button without saving the changes before will result in discarding the changes.

You can zoom into graphs by using drag&drop over a specific region in the graph you want to inspect closer.

Zooming in general happens either in X or in Y direction.

A double-click will reset the zoom back to where it was initially, making sure all data is visible.

Integrating Peaks
_________________
You can integrate peaks by doing a drag&drop action with the right mouse button over the portion of the graph you want to integrate.

A point will indicate where the starting position of the peak will be before you right-click. 

A Preview of the Peak will be shown to you while you keep the right mouse button pressed.

Renaming Peaks
________________
You can manually rename the peak. If no name is given, or a peak is named ``undefined``, it's number will instead be shown as the annotation.

Peak Area
_________
Peak Area is calculated as the area between the starting point of the peak and the ending point of a peak. If no manual baseline adjustment has been done, there will be a linear regression between the starting and the ending point of the peak and the graph.

If you integrate a peak in the Counter-channel, the value in brackets will be the decay-corrected values to the beginning of the run.

Comparing Peak areas
____________________
You can compare different peak areas in the same graph by checking the checkbox in front of them. The last column of the Peak-Table will be adjusted to reflect the respective relative peak area of all selected peaks inside this graph.

Adjusting the Deadtime
______________________
You can manually adjust the deadtime of the chromatogram by using the Button ``Deadtime Selection`` and clicking inside the graph where you know the deadtime is over.

You can see that if you chose a different deadtime, that the retention factor (k') will be adjusted accordingly.

Remember to deactive the ``Deadtime Selection`` mode once you are done with selecting the deadtime.

Predefined axis scaling
_______________________
Especially for known products and preparative HPLC it's useful to scale the graphs into a well-known region. This is possible for both axis. Using Ctrl+X to scale the X-Axis (same for all graphs) and Ctrl+Y to scale a graphs Y-axis you can achieve that. It's also possible to reach that option from the menu bar.

Deletion of Peaks
_________________
Peaks can be deleted by using the Delete button in the Peak-Table.

If you want to delete all peaks at once (e.g. after a failed attempt of automatic peak finding) you can use the button in the menu bar.

Finding Peaks
_____________
Based on the Savitzky-Golay-Filtering an automatic peak finding method has been implemented in the software to assist the user in searching for specific peaks. Using Ctrl+F or the ``Find Peaks`` Button in the menu bar, you can search for peaks fulfilling minimum criterias such as *Minimum peak width*, *Minimum Peak Height* and *Minimum Peak Area*.

Peak finding will work only on one graph at a time.

Saving the Changes
__________________
Remember to save your changes once you are done!

After saving it's possible to download all of the chromatogram as an HTML file, you can send via e-mail to a collegue, containing the full software. Anyone with a browser can take a look at such a file, zoom into graphs or modify and compare peaks.


Calibrations
------------

In order to create a calibration (or a set containing multiple calibrations) please integrate the peaks in the graphs you want to use for the calibration curve and save these. 

It is also important to use the correct Concentation and Unit in these runs, as the calculation will be based on the data filled in there.

Multiple Calibrations can be exported as a set by checking the checkbox on the calibrations site and clicking export.


Creating a new Calibration
--------------------------

Select the Calibration Site and click new.

Enter the name you gave the peak. E.g. Iodtubercidin. For every Chromatogram you want to use in this calibration please select the ``Use`` checkbox on the right side.

Upon selecting the chromatograms at the end of the page you will find the calibration data (Slope, Y-Intercept, correlation coefficient) Along with the UV Wavelength, the Column, the Concentation Unit, the Sample Name, the retention factor and the allowed error margin.

Clicking ``Submit`` will save this data on the server and allow you to export a set of calibrations as explained in the previous section.


This part has been decoupled from the server on purpose, as this allows anyone to use their own calibrations, even when working offline.

You can integrate peaks before applying the calibration data or afterwards, the results will be the same.

Using a Calibration to match peaks to compounds
-----------------------------------------------

After exporting you will be offered to download a .json file.

Inside any chromatogram you can use the menu-bar to open the Options-Box.  There is a File-Selection for loading calibration data.  Load the previously exported data there.
