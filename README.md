# Fd Cypress Recorder

`Fd Cypress Recorder` is a minimal plugin which records user interactions with a website. The interactions are then converted to Cypress test code which you can copy and paste into a Cypress test.
The plugin only automatically record click on `anchors`. If you want to do some custom actions, e.g. click on `span`, you can open up the context menu to record custom actions.

## Installation

Chrome Web Store: 

## Usage

1. Open the website you want to test
1. Click the Fd Cypress Recorder extension icon to open the popup
1. Press `Record` and the scenario recording starts
    1. Make sure the website has focus
    1. Press `CTRL`+`Print Screen` to open up a context menu with extra test options

## Templates

`Fd Cypress Recorder` has the option to save your current interactions as a template. The philosophy behind this is to provide the user the ability to start recording from a certain point.
For instance when you want to record various scenarios for which the user needs to be logged in then you can record all actions necessary to log in and save these interactions as template. The next time you can decide to go to the page which comes after login and load saved the template and continue from there.
Alternatively you can also decide to navigate to a whole different page and load the template. You can open the Context Menu and use the `Visit current url` option to record this navigation step.

## Disclaimer

As with all extensions, `Fd Cypress Recorder` has an impact on the user-experience while using your browser. And also because of its ability to listen for keyboard and mouse interactions it is recommended that you disable this plugin when you're not making use of it. 
