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

##### Row selection

RectAngular JS allows users to select one or multiple rows by using the Shift, Ctrl and Meta keys. To get the currently selected rows, declare an empty array:

	$scope.selectedMusicians = [];
	
And tell rect-ng to notify any changes to your variable:

	<rectng data="musicians" columns="columns" selected-rows="selectedMusicians"></rectng>

In order to manually select a row, from the scope containing the grid, do this:

	$scope.$broadcast('rectngSelectRow', 0);  // This will select the first row
	
You can select and deselect all the rows as well

	$scope.$broadcast('rectngSelectAll');
	$scope.$broadcast('rectngSelectNone');
	
##### Multiple row selection
By default, the user can select more than one row at the same time.

	<rectng data="musicians" columns="columns"></rectng>
	<rectng data="musicians" columns="columns" multiselect="true"></rectng>

The two tables above sholud behave identically.

And of course, you can limit selection to just one row by doing this:

	<rectng data="musicians" columns="columns" multiselect="false"></rectng>
		
	
##### Filtering
To display only rows matching a given filter, define a variable in your $scope:
	
	$scope.currentfilter = "";

Tell rectNG to use it.

	<rectng data="musicians" columns="columns" filter="currentFilter"></rectng>
	
Bind the value of an input HTML element to a variable in your scope and see what happens when you type a filter.
##### Grid dimensions
To give your grid a precise size, define two variables in your scope:
	
	$scope.tableWidth = "50%";
    $scope.tableHeight = "300px";

Both percentage and pixel units are supported.

Tell rect-ng to use them to resize itself.

	<rectng data="musicians" columns="columns" height="tableHeight" width="tableWidth"></rectng>
	
Instead of using scope variables, you can also specify fixed dimensions from the dom. Just surround the desired value with quotation marks '...' so that it is interpreted as a javascript string:

	<rectng data="musicians" columns="columns" height="'300px'" width="'50%'"></rectng>

Look at the file **[example.html](https://github.com/uniclau/rect-ng/blob/master/example.html)** to see it in action.

##### Paging
RectNG features a pager by default. There is no need to pass any parameter. 
	
### Projected features
RectAngular JS is not yet complete. These are just some of the features that we'd like to implement.

* Column resizing
* Column reordering
* Column hide/show box
* Color customization

Meanwhile, feel free to contribute with your own changes, always keeping it **small**, **simple**, **easily customizable** and **dependency-free**.

Thanks for reading!