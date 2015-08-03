# Rect-NG

Rect-NG is a no frills compact table for Angular JS.

The component is available in two versions:

*   Raw HTML and CSS version
*   Bootstrap tables version

## Overview

Rect-NG is designed with these goals in mind:

*   All-in-one JS file
*   Small footprint
*   Easy to integrate
*   Easy to understand (customize it if you want)

Check the [project page](http://uniclau.github.io/rect-ng/) for live demos.

## Getting started

### Raw HTML/CSS

The obvious dependency in this case, is Angular JS. Make sure that your project already includes it.

      <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.4.1/angular.min.js"></script>

Then, include Rect-NG itself:

      <script src="rect-ng.min.js"></script>

### Bootstrap version

In this case, make sure that you also include Bootstrap (and the JQuery dependency as well):

      <link rel="stylesheet" type="text/css" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css">
      <script src="https://code.jquery.com/jquery-2.1.1.min.js"></script>
      <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/js/bootstrap.min.js"></script>
      <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.2.4/angular.min.js"></script>

Then, include the bootstrap version of Rect-NG:

      <script src="rect-ng-bootstrap.min.js"></script>

### Tell Angular to use it

Add `rectNG` as a dependency of your Angular application.

    var app = angular.module("myApp", ['rectNG']);

###Provide your data

Put some content in a variable in your scope.

    $scope.musicians = [
        {id: 1, name: "Jay", lname: "Kay", email: "user1@rect-ng.net"},
        {id: 2, name: "Herbie", lname: "Hancock", email: "user2@rect-ng.net"},
        // ...
    ];

###Define the columns you want to display

    $scope.columns = [
        {id: "id", title: "ID", visible: false}, 
        {id: "name", title: "Name"},         // by default, the columns you define are visible
        {id: "lname", title: "Last Name"},
        {id: "email", title: "Email"}
    ];

###Add the Rect-NG table in your Markup

    <rectng data="musicians" columns="columns"></rectng>

Et voilà! Your first table is ready.

## Row selection

Rect-NG allows users to select one or multiple rows by using the `Shift`, `Ctrl` or `Cmd` keys. `Cmd/Ctrl+A` will select all the items.

To get the currently selected rows, declare an array:

    $scope.selectedMusicians = [];

And tell Rect-NG to notify any changes to your variable:

    <rectng data="musicians" columns="columns" selected-rows="selectedMusicians"></rectng>

If no variable is provided to `selected-rows="..."`, selection capabilities are disabled.

## Programatically selecting

In order to manually select a row, do this from your scope:

    $scope.$broadcast('rectngSelectRow', 0);  // This will select the first row

You can select and deselect all the rows as well

    $scope.$broadcast('rectngSelectAll');
    $scope.$broadcast('rectngSelectNone');

## Multiple or single row selection

By default, the user can select more than one row at the same time.

    <rectng data="musicians" columns="columns" selected-rows="selectedProducers"></rectng>
    <rectng data="musicians" columns="columns" multiselect="true" selected-rows="selectedProducers"></rectng>

The two tables above should behave identically.

And of course, you can limit selection to just one row by doing this:

    <rectng data="musicians" columns="columns" multiselect="false" selected-rows="selectedProducers"></rectng>

## Row filtering

To display only the rows matching a given text, define a variable in your $scope:

    $scope.currentFilter = "";

Bind the value of an HTML text box to the variable in your scope.

    <input type="text" ng-model="currentFilter"/>

Tell rectNG to use it and see what happens when you type a string.

    <rectng data="musicians" columns="columns" filter="currentFilter"></rectng>

## Grid dimensions

To give your grid a precise size, define two variables in your scope:

    $scope.tableWidth = "50%";
    $scope.tableHeight = "300px";

Percentage and pixel units are supported.

Tell Rect-NG to use them to resize itself.

    <rectng data="musicians" columns="columns" height="tableHeight" width="tableWidth"></rectng>

Instead of using scope variables, you can also specify fixed dimensions from the dom. Just surround the desired value with quotation marks `'...'` so that it is interpreted as a javascript string:

    <rectng data="musicians" columns="columns" height="'300px'" width="'50%'"></rectng>

## Links

In a typical REST scenario, you want to provide a view listing all the items, and then allow to jump to an individual one. To achieve that, you need to provide links.

If your data has the following structure:

    $scope.list = [
        {name: "John", lastname: "Marshall", profile: "http://www.twitter.com/user1"},
        {name: "Mary", lastname: "Jones", profile: "http://www.twitter.com/user2"},
        // ...
    ];

We can tell Rect-NG to use the `profile`field as the href source to link to.

    <rect-ng data="musicians" columns="columns" href-field="profile" selected-rows="selectedProducers"></rect-ng>

This will draw a table with rows linking to their respective profile.

Note that it is still possible to select items, independently of wether text links are enabled or not.

## Paging

Rect-NG features a pager by default.

    <rectng data="musicians" columns="columns"></rectng>
    <rectng data="musicians" columns="columns" pager="true"></rectng>

The two tables above should behave identically.

However, the grid below will hide the pager and display all the rows.

    <rectng data="musicians" columns="columns" pager="false"></rectng>

## Working examples

See it working on the project page: [http://uniclau.github.io/rect-ng/](http://uniclau.github.io/rect-ng/)

## Projected features

Rect-NG is not yet completed. These are just some of the features that we'd like to implement.

*   Column resizing
*   Column reordering
*   Column hide/show box
*   Color customization

If you want, feel free to contribute to the project, just keeping it **small**, **simple**, **easily customizable** and **dependency-free**.

Thanks for reading!