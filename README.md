rect-ng
=======

RectAngular JS is a no frills compact Grid for Angular JS. 

rect-ng is gently inspired by **[ng-grid](http://angular-ui.github.io/ng-grid/)**. However, not everybody needs a very complex grid to display data tables all of the time.

As I was spending much more time on tweaking and "undoing" stuff that was doing what I didn't want to, I decided to start a simple yet elegant alternative from scratch.

### Overview

RectAngular JS is designed with these goals in mind:

* All-in-one JS file. Period.
* Dependency-Free.
* Small footprint.
* Simple to integrate.
* Code easy to understand (hence customizable)

### Getting started
Integrating rect-ng in your angular application can't be simpler.

##### Include the JS file
	
      <script src="rect-ng.js"></script>

##### Tell angular to use it

Add **rectNG** as a dependency of your Angular application.

	var app = angular.module("test", ['rectNG']);

##### Provide some data

	$scope.musicians = [
       {id: 1, name: "Jay", lname: "Kay", email: "user1@rect-ng.net"},
       {id: 2, name: "Herbie", lname: "Hancock", email: "user2@rect-ng.net"},
        /* ... */ ];

##### Define what to display

	$scope.columns = [{id: "id", title: "ID", visible: false}, 
       {id: "name", title: "Name", visible: true}, 
       {id: "lname", title: "Last Name", visible: true}, 
       {id: "email", title: "Email", visible: true}];
      
##### Add the table to your DOM

	<rectng data="musicians" columns="columns"></rectng>
	
### More options

##### Selection

RectAngular JS allows users to select one or multiple rows by using the Shift, Ctrl and Meta keys. To get the currently selected rows, declare an empty array:

	$scope.selectedMusicians = [];
	
And tell rect-ng to use your variable:

	<rectng data="musicians" columns="columns" selected-rows="selectedMusicians"></rectng>
	
##### Filtering
To display only rows matching a given filter, define a variable in your $scope:
	
	$scope.currentfilter = "";

Tell rectNG to use it.

	<rectng data="musicians" columns="columns" filter="currentFilter"></rectng>
	
Bind the value of an input HTML element to a variable in your scope and see what happens when you type a filter.
		
##### Sizing
To give your grid a precise size, define two variables in your scope:
	
	$scope.tableWidth = "50%";
    $scope.tableHeight = "200px";

Both percentage and pixel units are supported.

Tell rect-ng to use them to resize itself.

	<rectng data="musicians" columns="columns" height="tableHeight" width="tableWidth"></rectng>
	
Look at the file **[example.html](https://github.com/uniclau/rect-ng/blob/master/example.html)** to see it in action.
	
### Projected features
RectAngular JS is not yet complete. These are just some of the features that we'd like to implement.

* Paging
* Column resizing
* Column reordering
* Column hide/show box
* Color customization

Meanwhile, feel free to contribute with your own changes, always keeping it **small**, **simple**, **easily customizable** and **dependency-free**.

Thanks for reading!