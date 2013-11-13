angular.module("rectNG", [])
   .directive('rectng', function () {
      return {
         restrict: 'E',
         scope: {},
         controller: function ($scope, $element, $attrs) {

            /* STATE VARIABLES --------------------------------------------- */
            
            $scope.lastSelectIndex = -1;
            $scope.sortAscending = true;
            $scope.lastSortIndex = -1;
            $scope.visibleData = [];
            $scope.visibleModel = [];
            $scope.multiselect = true;
            
            /* EVENT HANDLING ---------------------------------------------- */
            
            // ROW SELECTION HANDLING
            $scope.cellClick = function (index, event) {
               
               // Single selection
               if($scope.multiselect == undefined || $scope.multiselect == false) {
                  for (var i = 0; i < $scope.visibleData.length; i++) {
                     $scope.visibleData[i].selected = false;
                  }
                  $scope.visibleData[index].selected = true;
                  $scope.lastSelectIndex = index;
                  
                  // Update the parent's selected rows variable
                  var selected = [], tmp;
                  tmp = $scope.cloneObj($scope.visibleData[index]); // don't return 'selected'
                  delete tmp.selected;
                  selected.push(tmp);
                  if ($attrs.selectedRows && $attrs.selectedRows != "")
                     $scope.$parent[$attrs.selectedRows] = [$scope.visibleData[index]];
                  return;
               }
               
               // Multiple selection
               var selected = [], tmp;
               // Range selection
               if (event.shiftKey) {
                  if ($scope.lastSelectIndex == -1) { // 0 => A
                     for (var i = 0; i < $scope.visibleData.length; i++) {
                        $scope.visibleData[i].selected = false;
                     }
                     $scope.visibleData[index].selected = true;
                     tmp = $scope.cloneObj($scope.visibleData[i]); // don't return 'selected'
                     delete tmp.selected;
                     selected.push(tmp);
                  } else if (index > $scope.lastSelectIndex) { // A => B
                     for (var i = $scope.lastSelectIndex; i <= index; i++) {
                        $scope.visibleData[i].selected = true;
                        tmp = $scope.cloneObj($scope.visibleData[i]); // don't return 'selected'
                        delete tmp.selected;
                        selected.push(tmp);
                     }
                  } else { // B <= A
                     for (var i = index; i <= $scope.lastSelectIndex; i++) {
                        $scope.visibleData[i].selected = true;
                        tmp = $scope.cloneObj($scope.visibleData[i]); // don't return 'selected'
                        delete tmp.selected;
                        selected.push(tmp);
                     }
                  }
               // Single (un)select
               } else if (event.ctrlKey || event.metaKey) {
                  $scope.visibleData[index].selected = !$scope.visibleData[index].selected;
                  
                  for (var i = 0; i < $scope.visibleData.length; i++) {
                     if($scope.visibleData[i].selected) {
                        tmp = $scope.cloneObj($scope.visibleData[i]); // don't return 'selected'
                        delete tmp.selected;
                        selected.push(tmp);
                     }
                  }
               // Select only one
               } else {
                  for (var i = 0; i < $scope.visibleData.length; i++) {
                     $scope.visibleData[i].selected = false;
                  }
                  $scope.visibleData[index].selected = true;
                  tmp = $scope.cloneObj($scope.visibleData[index]); // don't return 'selected'
                  delete tmp.selected;
                  selected.push(tmp);
               }
               $scope.lastSelectIndex = index;

               // Update the parent's selected rows variable
               if ($attrs.selectedRows && $attrs.selectedRows != ""){
                  $scope.$parent[$attrs.selectedRows] = selected;
               }
            };

            // SORT BY COLUMN
            $scope.sortBy = function (index, keepDirection) {
               if(index >= $scope.visibleModel.length)
                  return;
               
               if (index == $scope.lastSortIndex && (!keepDirection))
                  $scope.sortAscending = !$scope.sortAscending;

               $scope.data.sort($scope.sortFunction($scope.visibleModel[index].id, $scope.sortAscending));
               $scope.lastSortIndex = index;
               
               $scope.updateVisibleData();
            };
            
            /* ACTION ------------------------------------------------------ */
            
            // UPDATE THE COLUMN MODEL
            $scope.updateVisibleModel = function () {
               var model = [];
               for (var i = 0; i < $scope.columns.length; i++) {
                  if ($scope.columns[i].visible == true)
                     model.push($scope.columns[i]);
               }
               $scope.visibleModel = model;
            };

            // UPDATE THE VISIBLE ROWS
            $scope.updateVisibleData = function(){
               $scope.visibleData = [];
               if($scope.filter == undefined || $scope.filter == "") {
                  // Show all rows
                  for(var i = 0; i < $scope.data.length; i++) {
                     $scope.visibleData.push($scope.data[i]);
                  }
               }
               else {
                  // Show only rows matching the filter
                  var pattern = new RegExp($scope.filter, "i");
                  for(var i = 0; i < $scope.data.length; i++) {
                     var rowContent = "";
                     for (var j = 0; j < $scope.columns.length; j++) {
                        rowContent += $scope.data[i][$scope.columns[j].id] + " ";
                     }
                     
                     if(pattern.test(rowContent))
                        $scope.visibleData.push($scope.data[i]);
                  }
               }
            };
            
            $scope.selectAll = function(){
               var selected = [], tmp;
               // Prompt the parent scope with the new selection
               if ($attrs.selectedRows && $attrs.selectedRows != "") {
                  for (var i = 0; i < $scope.visibleData.length; i++) {
                     $scope.visibleData[i].selected = true;
                     tmp = $scope.cloneObj($scope.visibleData[i]);
                     delete tmp.selected; // don't return 'selected'
                     selected.push(tmp);
                  }
                  // Set the new selection on the parent's variable
                  $scope.$parent[$attrs.selectedRows] = selected;
                  $scope.$parent.$digest();
               }
               else {
                  for (var i = 0; i < $scope.visibleData.length; i++)
                     $scope.visibleData[i].selected = true;
               }
               
               $scope.lastSelectIndex = 0;
            };
            
            /* STATE FUNCTIONS --------------------------------------------- */
            
            // ROW SELECTION STATUS
            $scope.isRowSelected = function (index) {
               return ($scope.visibleData[index].selected ? "rectNG-selected" : "");
            };

            // DEFAULT COLUMN WIDTH
            $scope.columnWidth = function () {
               if ($scope.width.indexOf("%") > 0)
                  return (100.0 / $scope.visibleModel.length) + "%";
               else {
                  var width = parseFloat($scope.width);
                  return (width / $scope.visibleModel.length) + "px";
               }
            };
            
            /* AUXILIARY FUNCTIONS ----------------------------------------- */
            
            // Return a copy of the given object
            $scope.cloneObj = function(obj) {
               var target = {};
               for (var i in obj) {
                  if (obj.hasOwnProperty(i)) {
                     target[i] = obj[i];
                  }
               }
               return target;
            }
                        
            // Generic sort function by Triptych @ StackOverflow
            // values.sort($scope.sortFunction('price', true, parseInt));
            // values.sort($scope.sortFunction('city', false, function(a){return a.toUpperCase()}));
            $scope.sortFunction = function(field, reverse, compareFunction) {
               var key = compareFunction ?
                     function (x) {
                        return compareFunction(x[field])
                  } :
                     function (x) {
                        return x[field]
                  };
               reverse = [-1, 1][+ !! reverse];
            
               return function (a, b) {
                  var a = key(a), b = key(b);
                  if(!a && !b)
                     return 0;
                  else if(!a)
                     return -reverse;
                  else if(!b)
                     return reverse;
                  
                  return reverse * ((a > b) - (b > a));
               };
            }

            // INIT
            $scope.init = function () {
               var rectNGs = document.getElementsByClassName('rectNG');
               for (var i = 0; i < rectNGs.length; i++) {
                  rectNGs[i].onkeydown = rectNG_keyAction;
                  rectNGs[i].onkeyup = rectNG_keyAction;
                  rectNGs[i].onkeypress = rectNG_keyAction;
               };
            };
            
            /* PARAMETER WATCHES ------------------------------------------- */
            
            // MONITOR THE VALUES BOUND TO THE PARAMETERS
            // Watch the data variable
            $scope.$watch($attrs.data, function () {
               $scope.$parent.$watch($attrs.data, function () { // If the content changes
                  $scope.data = $scope.$parent.$eval($attrs.data) || [];
                  // Refresh visible rows
                  if($scope.lastSortIndex == -1)
                     $scope.updateVisibleData();
                  else {
                     $scope.sortBy($scope.lastSortIndex, true);
                  }
               });
               $scope.data = $scope.$parent.$eval($attrs.data) || []; // If the variable name changes
               // Refresh visible rows
               if($scope.lastSortIndex == -1)
                  $scope.updateVisibleData();
               else {
                  $scope.sortBy($scope.lastSortIndex, true);
               }
            });

            // Watch the columns variable
            $scope.$watch($attrs.columns, function () {
               $scope.$parent.$watch($attrs.columns, function () {// If the content changes
                  $scope.columns = $scope.$parent.$eval($attrs.columns) || [];
                  $scope.updateVisibleModel();
               });
               $scope.columns = $scope.$parent.$eval($attrs.columns) || []; // If the variable name changes
               $scope.updateVisibleModel();
            });

            // Watch the filter variable
            $scope.$watch($attrs.filter, function () {
               $scope.$parent.$watch($attrs.filter, function () {
                  $scope.filter = $scope.$parent.$eval($attrs.filter) || "";
                  $scope.updateVisibleData();
               });
               $scope.filter = $scope.$parent.$eval($attrs.filter) || "";
               $scope.updateVisibleData();
            });

            // Watch the multiselection flag
            $scope.$watch($attrs.multiselect, function () {
               $scope.multiselect = ($attrs.multiselect == undefined || $attrs.multiselect == "true");
            });

            // Watch the height variable
            $scope.$watch($attrs.height, function () {
               $scope.$parent.$watch($attrs.height, function () {
                  $scope.height = $scope.$parent.$eval($attrs.height) || $scope.height;
               });
               $scope.height = $scope.$parent.$eval($attrs.height) || $scope.height;
            });

            // Watch the width variable
            $scope.$watch($attrs.width, function () {
               $scope.$parent.$watch($attrs.width, function () {
                  $scope.width = $scope.$parent.$eval($attrs.width) || $scope.width;
               });
               $scope.width = $scope.$parent.$eval($attrs.width) || $scope.width;
            });
         },
         // Not ideal, but in order to keep everything packaged into a single file,
         // the CSS code is also embedded in the template
         template: '<div>\
            <style>\
              .rectNG {margin: 0;padding: 0 0 39px;display: block;outline: none;user-select: none;-ms-user-select: none;-moz-user-select: none;-webkit-user-select: none;}\
              /* Header */\
              .rectNG > div.rectNG-head {display: table;width: 100%;border-bottom: 2px solid #ccc;}\
              .rectNG > div.rectNG-head > div:first-child {display: table-row;height: 38px;cursor: pointer;}\
              .rectNG-title {display: table-cell;font-weight: bold;vertical-align: middle;padding: 3px 6px;}\
              /* Body */\
              .rectNG > .rectNG-body {width: 100%;height: 100%;overflow: auto;display: block;}\
              .rectNG > .rectNG-body > .rectNG-inner{display: table;width: 100%;}\
              .rectNG-inner > .rectNG-row {display: table-row;width: 100%;height: 33px;cursor: pointer;}\
              .rectNG-inner > .rectNG-row:nth-child(2n) {background-color: #fefefe;}\
              .rectNG-inner > .rectNG-row:nth-child(2n+1) {background-color: #f9f9f9;}\
              .rectNG-inner > .rectNG-row:hover {background-color: #eee;}\
              .rectNG-row > .rectNG-cell {display: table-cell;vertical-align: middle;padding: 3px 6px;}\
              /* Selected */\
              div.rectNG-row.rectNG-selected {background-color: #ddd !important;}\
            </style>\
            \
            \
            <div class="rectNG" tabindex="10000" style="width: {{width}}; height: {{height}};" ng-init="init()">\
               <div class="rectNG-head">\
                  <div>\
                     <div class="rectNG-title" ng-repeat="c in visibleModel" style="width: {{columnWidth()}};" ng-click="sortBy($index)">{{c.title}} <span ng-show="lastSortIndex==$index && sortAscending">&darr;</span><span ng-show="lastSortIndex==$index && !sortAscending">&uarr;</span></div>\
                  </div>\
               </div>\
               <div class="rectNG-body">\
                  <div class="rectNG-inner">\
                     <div class="rectNG-row" ng-repeat="row in visibleData" ng-click="cellClick($index, $event)" ng-class="isRowSelected($index)">\
                        <div class="rectNG-cell" ng-repeat="c in visibleModel" style="width: {{columnWidth()}};">{{row[c.id]}}</div>\
                     </div>\
                  </div>\
               </div>\
            </div>',
         replace: true
      };
   });

/* AUXILIARY FUNCTIONS ----------------------------------------------------- */

// On KeyUp, KeyDown, KeyPress
function rectNG_keyAction(e) {
   // CTRL + A / CMD + A => Select All
   if((e.metaKey && e.keyCode == 65) || ((e.ctrlKey && e.keyCode65) && $scope.multiselect)) {
      var scope = angular.element(event.target).scope();
      scope.selectAll();
      scope.$digest();
      e.preventDefault();
   }
}
