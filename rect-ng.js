angular.module("rectNG", [])
   .directive('rectng', function () {
      return {
         restrict: 'E',
         scope: {},
         controller: function ($scope, $element, $attrs) {

            /* STATE VARIABLES */
            
            $scope.lastSelectIndex = -1;
            $scope.sortAscending = true;
            $scope.lastSortIndex = -1;
            $scope.visibleData = [];
            $scope.multiselect = true;
            
            /* EVENT HANDLING */
            
            // ROW SELECTION HANDLING
            $scope.cellClick = function (index) {
               
               // Single selection
               if($scope.multiselect == undefined || $scope.multiselect == false) {
                  for (var i = 0; i < $scope.visibleData.length; i++) {
                     $scope.visibleData[i].selected = false;
                  }
                  $scope.visibleData[index].selected = true;
                  $scope.lastSelectIndex = index;
                  
                  // Update the parent's selected rows variable
                  var selected = [], tmp;
                  tmp = rectNG_clone($scope.visibleData[index]); // don't return 'selected'
                  delete tmp.selected;
                  selected.push(tmp);
                  if ($attrs.selectedRows && $attrs.selectedRows != "")
                     $scope.$parent[$attrs.selectedRows] = [$scope.visibleData[index]];
                  return;
               }
               
               // Multiple selection
               var selected = [], tmp;
               // Range selection
               if ($scope.shiftOn) {
                  if ($scope.lastSelectIndex == -1) { // 0 => A
                     for (var i = 0; i < $scope.visibleData.length; i++) {
                        $scope.visibleData[i].selected = false;
                     }
                     $scope.visibleData[index].selected = true;
                     tmp = rectNG_clone($scope.visibleData[i]); // don't return 'selected'
                     delete tmp.selected;
                     selected.push(tmp);
                  } else if (index > $scope.lastSelectIndex) { // A => B
                     for (var i = $scope.lastSelectIndex; i <= index; i++) {
                        $scope.visibleData[i].selected = true;
                        tmp = rectNG_clone($scope.visibleData[i]); // don't return 'selected'
                        delete tmp.selected;
                        selected.push(tmp);
                     }
                  } else { // B <= A
                     for (var i = index; i <= $scope.lastSelectIndex; i++) {
                        $scope.visibleData[i].selected = true;
                        tmp = rectNG_clone($scope.visibleData[i]); // don't return 'selected'
                        delete tmp.selected;
                        selected.push(tmp);
                     }
                  }
               // Single (un)select
               } else if ($scope.ctrlOn || $scope.metaOn) {
                  $scope.visibleData[index].selected = !$scope.visibleData[index].selected;
                  
                  for (var i = 0; i < $scope.visibleData.length; i++) {
                     if($scope.visibleData[i].selected) {
                        tmp = rectNG_clone($scope.visibleData[i]); // don't return 'selected'
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
                  tmp = rectNG_clone($scope.visibleData[index]); // don't return 'selected'
                  delete tmp.selected;
                  selected.push(tmp);
               }
               $scope.lastSelectIndex = index;

               // Update the parent's selected rows variable
               if ($attrs.selectedRows && $attrs.selectedRows != ""){
                  $scope.$parent[$attrs.selectedRows] = selected;
               }
            };

            // SELECTION MODIFIERS
            $scope.onKeyDown = function (e) {
               
               // CTRL + A / CMD + A => Select All
               if((e.metaKey && e.keyCode == 65) || (e.ctrlKey && e.keyCode65) && $scope.multiselect) {
                  var selected = [], tmp;
                  for (var i = 0; i < $scope.visibleData.length; i++) {
                     $scope.visibleData[i].selected = true;
                     tmp = rectNG_clone($scope.visibleData[i]); // don't return 'selected'
                     delete tmp.selected;
                     selected.push(tmp);
                  }
                  
                  // Set the new selection on the parent's variable
                  if ($attrs.selectedRows && $attrs.selectedRows != "")
                     $scope.$parent[$attrs.selectedRows] = selected;
                  $scope.shiftOn = false;
                  $scope.ctrlOn = false;
                  $scope.metaOn = false;
                  $scope.lastSelectIndex = 0;
                  e.preventDefault();
                  return;
               }
               
               // Update the internal status variables
               if (e.shiftKey)
                  $scope.shiftOn = true;
               else
                  $scope.shiftOn = false;

               if (e.ctrlKey)
                  $scope.ctrlOn = true;
               else
                  $scope.ctrlOn = false;

               if (e.metaKey)
                  $scope.metaOn = true;
               else
                  $scope.metaOn = false;
            };

            /* STATE FUNCTIONS */
            
            // ROW SELECTION STATUS
            $scope.isRowSelected = function (index) {
               return ($scope.visibleData[index].selected ? "rectNG-selected" : "");
            };

            // VISIBLE MODEL
            $scope.visibleModel = function () {
               var ret = [];
               for (var i = 0; i < $scope.columns.length; i++) {
                  if ($scope.columns[i].visible == true)
                     ret.push($scope.columns[i]);
               }
               return ret;
            };

            // DEFAULT COLUMN WIDTH
            $scope.columnWidth = function () {
               if ($scope.width.indexOf("%") > 0)
                  return (100.0 / $scope.visibleModel().length) + "%";
               else {
                  var width = parseFloat($scope.width);
                  return (width / $scope.visibleModel().length) + "px";
               }
            };

            // SORT BY COLUMN
            $scope.sortBy = function (index) {
               if (index == $scope.lastSortIndex)
                  $scope.sortAscending = !$scope.sortAscending;

               var m = $scope.visibleModel();
               $scope.data.sort(rectNG_sortFunction(m[index].id, $scope.sortAscending));
               $scope.lastSortIndex = index;
               
               $scope.updateVisible();
            };

            // UPDATE THE VISIBLE ROWS
            $scope.updateVisible = function(){
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
            
            // INIT
            $scope.init = function () {
               var rectNGs = document.getElementsByClassName('rectNG');
               for (var i = 0; i < rectNGs.length; i++) {
                  rectNGs[i].onkeydown = rectNG_keyChange;
                  rectNGs[i].onkeyup = rectNG_keyChange;
                  rectNGs[i].onkeypress = rectNG_keyChange;
                  rectNGs[i].onblur = rectNG_onBlur;
               };
            };
            
            /* PARAMETER WATCHES */
            
            // MONITOR THE VALUES BOUND TO THE PARAMETERS
            // Watch the data variable
            $scope.$watch($attrs.data, function () {
               $scope.$parent.$watch($attrs.data, function () { // If the content changes
                  $scope.data = $scope.$parent.$eval($attrs.data) || [];
                  // Refresh visible rows
                  if($scope.lastSortIndex == -1)
                     $scope.updateVisible();
                  else
                     $scope.sortBy($scope.lastSortIndex);
               });
               $scope.data = $scope.$parent.$eval($attrs.data) || []; // If the variable name changes
               // Refresh visible rows
               if($scope.lastSortIndex == -1)
                  $scope.updateVisible();
               else
                  $scope.sortBy($scope.lastSortIndex);
            });

            // Watch the columns variable
            $scope.$watch($attrs.columns, function () {
               $scope.$parent.$watch($attrs.columns, function () {// If the content changes
                  $scope.columns = $scope.$parent.$eval($attrs.columns) || [];
               });
               $scope.columns = $scope.$parent.$eval($attrs.columns) || []; // If the variable name changes
            });

            // Watch the filter variable
            $scope.$watch($attrs.filter, function () {
               $scope.$parent.$watch($attrs.filter, function () {
                  $scope.filter = $scope.$parent.$eval($attrs.filter) || "";
                  $scope.updateVisible();
               });
               $scope.filter = $scope.$parent.$eval($attrs.filter) || "";
               $scope.updateVisible();
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
                     <div class="rectNG-title" ng-repeat="c in visibleModel()" style="width: {{columnWidth()}};" ng-click="sortBy($index)">{{c.title}} <span ng-show="lastSortIndex==$index && sortAscending">&darr;</span><span ng-show="lastSortIndex==$index && !sortAscending">&uarr;</span></div>\
                  </div>\
               </div>\
               <div class="rectNG-body">\
                  <div class="rectNG-inner">\
                     <div class="rectNG-row" ng-repeat="row in visibleData" ng-click="cellClick($index)" ng-class="isRowSelected($index)">\
                        <div class="rectNG-cell" ng-repeat="c in visibleModel()" style="width: {{columnWidth()}};">{{row[c.id]}}</div>\
                     </div>\
                  </div>\
               </div>\
            </div>',
         replace: true
      };
   });

///////////////////////////////////////////////////////////////////////////////
// AUXILIARY FUNCTIONS

// Generic sort function by Triptych @ StackOverflow
// values.sort(rectNG_sortFunction('price', true, parseInt));
// values.sort(rectNG_sortFunction('city', false, function(a){return a.toUpperCase()}));
function rectNG_sortFunction(field, reverse, compareFunction) {
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
         return reverse;
      else if(!b)
         return -reverse;
      
      return reverse * ((a > b) - (b > a));
   };
}

// On KeyUp, KeyDown, KeyPress
function rectNG_keyChange(event) {
   var scope = angular.element(event.target).scope();
   scope.onKeyDown(event);
   scope.$digest();
}

// Clear key state when losing focus
function rectNG_onBlur(e){
   var scope = angular.element(event.target).scope();
   scope.ctrlOn = false;
   scope.shiftOn = false;
   scope.metaOn = false;
}

// Return a copy of the given object
function rectNG_clone(obj) {
   var target = {};
   for (var i in obj) {
      if (obj.hasOwnProperty(i)) {
         target[i] = obj[i];
      }
   }
   return target;
}
