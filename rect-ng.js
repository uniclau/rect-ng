angular.module("rectNG", [])
.directive('rectng', function() {
	return {
		restrict: 'E',
		scope: {},
		controller: function($scope, $element, $attrs) {

			/* STATE VARIABLES --------------------------------------------- */

			$scope.lastSelectIndex = -1;
			$scope.sortAscending = true;
			$scope.lastSortIndex = -1;
			$scope.visibleData = [];
			$scope.visibleModel = [];
			$scope.multiselect = true;
			$scope.showPager = true;
			$scope.currentPage = 1;
			$scope.availableItemsPerPage = [50, 100, 500];
			$scope.itemsPerPage = 50;
			$scope.showPageInputBox = false;
			$scope.useSelection = !!$attrs.selectedRows;
			$scope.hrefField = $attrs.hrefField;

			/* EVENT HANDLING ---------------------------------------------- */

			// ROW SELECTION HANDLING
			$scope.cellClick = function(index, event) {
				if(!$scope.useSelection) return;

				var selected = [], tmp, i;
				// Single selection
				if ($scope.multiselect == undefined || $scope.multiselect == false) {
					for (i = 0; i < $scope.visibleData.length; i++) {
						$scope.visibleData[i].selected = false;
					}
					$scope.visibleData[index].selected = true;
					$scope.lastSelectIndex = index;

					// Update the parent's selected rows variable
					tmp = $scope.cloneObj($scope.visibleData[index]); // don't return 'selected'
					delete tmp.selected;
					selected.push(tmp);

					if ($attrs.selectedRows)
						$scope.$parent[$attrs.selectedRows] = [$scope.visibleData[index]];
					return;
				}

				// Multiple selection

				// Range selection
				if (event.shiftKey) {
					if ($scope.lastSelectIndex == -1) { // 0 => A
						for (i = 0; i < $scope.visibleData.length; i++) {
							$scope.visibleData[i].selected = false;
						}
						$scope.visibleData[index].selected = true;
						tmp = $scope.cloneObj($scope.visibleData[i]); // don't return 'selected'
						delete tmp.selected;
						selected.push(tmp);
					}
					else if (index > $scope.lastSelectIndex) { // A => B
						for (i = $scope.lastSelectIndex; i <= index; i++) {
							$scope.visibleData[i].selected = true;
							tmp = $scope.cloneObj($scope.visibleData[i]); // don't return 'selected'
							delete tmp.selected;
							selected.push(tmp);
						}
					} 
					else { // B <= A
						for (i = index; i <= $scope.lastSelectIndex; i++) {
							$scope.visibleData[i].selected = true;
							tmp = $scope.cloneObj($scope.visibleData[i]); // don't return 'selected'
							delete tmp.selected;
							selected.push(tmp);
						}
					}
				// Single (un)select
				}
				else if (event.ctrlKey || event.metaKey) {
					$scope.visibleData[index].selected = !$scope.visibleData[index].selected;

					for (i = 0; i < $scope.visibleData.length; i++) {
						if ($scope.visibleData[i].selected) {
							tmp = $scope.cloneObj($scope.visibleData[i]); // don't return 'selected'
							delete tmp.selected;
							selected.push(tmp);
						}
					}
				// Select only one
				}
				else {
					for (i = 0; i < $scope.visibleData.length; i++) {
						$scope.visibleData[i].selected = false;
					}
					$scope.visibleData[index].selected = true;
					tmp = $scope.cloneObj($scope.visibleData[index]); // don't return 'selected'
					delete tmp.selected;
					selected.push(tmp);
				}
				$scope.lastSelectIndex = index;

				// Update the parent's selected rows variable
				if ($attrs.selectedRows) {
					$scope.$parent[$attrs.selectedRows] = selected;
				}
			};

			// SORT BY COLUMN
			$scope.sortBy = function(index, keepDirection) {
				if (index >= $scope.visibleModel.length)
					return;

				if (index == $scope.lastSortIndex && (!keepDirection))
					$scope.sortAscending = !$scope.sortAscending;

				$scope.data.sort($scope.sortFunction($scope.visibleModel[index].id, $scope.sortAscending));
				$scope.lastSortIndex = index;

				$scope.updateVisibleData();
			};

			/* ACTION ------------------------------------------------------ */

			// UPDATE THE COLUMN MODEL
			$scope.updateVisibleModel = function() {
				var model = [];
				for (var i = 0; i < $scope.columns.length; i++) {
					if ($scope.columns[i].visible === undefined || $scope.columns[i].visible === true)
						model.push($scope.columns[i]);
				}
				$scope.visibleModel = model;
			};

			// UPDATE THE VISIBLE ROWS
			$scope.updateVisibleData = function() {
				$scope.visibleData = [];
				var i;
				var start = ($scope.currentPage-1) * $scope.itemsPerPage;

				if ($scope.filter == undefined || $scope.filter == "") {
					var len = $scope.itemsPerPage < $scope.data.length - start ? 
								$scope.itemsPerPage : $scope.data.length - start;
					
					// Show all rows
					for (i = 0; i < len; i++) {
						$scope.visibleData.push($scope.data[start+i]);
					}
				}
				else {
					// Show only rows matching the filter
					var tempList = [];

					// Filter elements
					var pattern = new RegExp($scope.filter, "i");
					for (i = 0; i < $scope.data.length; i++) {
						var rowContent = "";
						for (var j = 0; j < $scope.columns.length; j++) {
							rowContent += $scope.data[i][$scope.columns[j].id] + " ";
						}

						if (pattern.test(rowContent)) {
							tempList.push($scope.data[i]);

							if(tempList.length >= (start + $scope.itemsPerPage))
								break;
						}
					}
					// Actually displayed elements
					var len = $scope.itemsPerPage < tempList.length - start ? 
								$scope.itemsPerPage : tempList.length - start;
								
					for(i = 0; i < len; i++) {
						$scope.visibleData.push(tempList[start+i]);
					}
				}
			};

			$scope.countVisibleEntries = function(){
				if (!$scope.filter) {
					return $scope.data.length;
				} 
				else {
					// Only rows matching the filter
					var rowContent;
					var tempList = [];
					var counter = 0;

					// Filter elements
					var pattern = new RegExp($scope.filter, "i");
					for (var i = 0; i < $scope.data.length; i++) {
						rowContent = "";
						for (var j = 0; j < $scope.columns.length; j++) {
							rowContent += $scope.data[i][$scope.columns[j].id] + " ";
						}

						if (pattern.test(rowContent)) {
							counter++;
						}
					}
					return counter;
				}
			};

			$scope.countPages = function() {
				return Math.ceil($scope.countVisibleEntries() / $scope.itemsPerPage);
			};

			$scope.nextPage = function(){
				var npages = $scope.countPages();

				if($scope.currentPage + 1 > npages)
					$scope.currentPage = npages;
				else
					$scope.currentPage++;

				$scope.updateVisibleData();
			};

			$scope.prevPage = function(){
				var npages = $scope.countPages();

				if($scope.currentPage - 1 < 1)
					$scope.currentPage = 1;
				else
					$scope.currentPage--;

				$scope.updateVisibleData();
			};

			$scope.toggleItemsPerPage = function() {
				var tmp = $scope.availableItemsPerPage.indexOf($scope.itemsPerPage);
				tmp = (tmp + 1) % $scope.availableItemsPerPage.length;
				$scope.itemsPerPage = $scope.availableItemsPerPage[tmp];

				var npages = $scope.countPages();
				if(parseInt($scope.currentPage) > npages)
					$scope.currentPage = npages;

				$scope.updateVisibleData();
			};

			$scope.gotoPage = function(e) {
				if((e && e.type == "keydown" && e.keyCode == 13) || (e && e.type == "blur")) {
					e.preventDefault();
					$scope.showPageInputBox = false;

					var npages = $scope.countPages();
					if(parseInt($scope.currentPage) > npages)
						$scope.currentPage = npages;
					else if(parseInt($scope.currentPage) < 1)
						$scope.currentPage = 1;
					else
						$scope.currentPage = parseInt($scope.currentPage) || 1;

					$scope.updateVisibleData();
				}
			};

			$scope.selectAll = function() {
				if(!$scope.useSelection || !$scope.multiselect) return;

				var i, selected = [], tmp;
				// Prompt the parent scope with the new selection
				if ($attrs.selectedRows) {
					for (i = 0; i < $scope.visibleData.length; i++) {
						$scope.visibleData[i].selected = true;
						tmp = $scope.cloneObj($scope.visibleData[i]);
						delete tmp.selected; // don't return 'selected'
						selected.push(tmp);
					}
					// Set the new selection on the parent's variable
					$scope.$parent[$attrs.selectedRows] = selected;
				}
				else {
					for (i = 0; i < $scope.visibleData.length; i++)
						$scope.visibleData[i].selected = true;
				}

				$scope.lastSelectIndex = 0;
			};

			$scope.selectNone = function() {
				if(!$scope.useSelection || !$scope.multiselect) return;

				for (var i = 0; i < $scope.visibleData.length; i++) {
					$scope.visibleData[i].selected = false;
				}
				// Set the new selection on the parent's variable
				if ($attrs.selectedRows) {
					$scope.$parent[$attrs.selectedRows] = [];
				}

				$scope.lastSelectIndex = 0;
			};

			$scope.keyUp = function(e) {
				var i;
				if ($scope.lastSelectIndex > 0)
					$scope.lastSelectIndex--;
				else
					$scope.lastSelectIndex = 0;

				for (i = 0; i < $scope.visibleData.length; i++)
					$scope.visibleData[i].selected = false;
				$scope.visibleData[$scope.lastSelectIndex].selected = true;

				// Scroll if we need to
				var currentTop = 0;
				var gBody = e.target.querySelector('.rectNG-body');
				var gRows = gBody.querySelectorAll('.rectNG-row');
				for(i = 0; i < $scope.lastSelectIndex && i < gRows.length; i++) {
					currentTop += gRows[i].offsetHeight;
				}
				if(currentTop < gBody.scrollTop)
					gBody.scrollTop = currentTop;

				// Set the new selection on the parent's variable 
				if ($attrs.selectedRows) {
					var tmp = $scope.cloneObj($scope.visibleData[$scope.lastSelectIndex]);
					delete tmp.selected; // don't return 'selected'
					$scope.$parent[$attrs.selectedRows] = [tmp];
				}
			};

			$scope.keyDown = function(e) {
				var i;
				if ($scope.lastSelectIndex < $scope.visibleData.length - 1)
					$scope.lastSelectIndex++;
				else
					$scope.lastSelectIndex = $scope.visibleData.length - 1;

				for (i = 0; i < $scope.visibleData.length; i++)
					$scope.visibleData[i].selected = false;
				$scope.visibleData[$scope.lastSelectIndex].selected = true;

				// Scroll if we need to
				var currentTop = 0, lastHeight = 0;
				var gBody = e.target.querySelector('.rectNG-body');
				var gRows = gBody.querySelectorAll('.rectNG-row');
				for(i = 0; i <= $scope.lastSelectIndex && i < gRows.length; i++) {
					currentTop += gRows[i].offsetHeight;
					lastHeight = gRows[i].offsetHeight;
				}
				if(currentTop >= gBody.scrollTop + gBody.offsetHeight)
					gBody.scrollTop = currentTop - gBody.offsetHeight;

				// Set the new selection on the parent's variable
				if ($attrs.selectedRows) {
					var tmp = $scope.cloneObj($scope.visibleData[$scope.lastSelectIndex]);
					delete tmp.selected; // don't return 'selected'
					$scope.$parent[$attrs.selectedRows] = [tmp];
				}
			};

			/* EVENT FUNCTIONS --------------------------------------------- */

			// KEY DOWN
			$scope.onKey = function(e){
				if (e.type != "keydown")
					return;

				// CTRL + A / CMD + A => Select All
				if ((e.metaKey && e.keyCode == 65) || ((e.ctrlKey && e.keyCode65))) {
					e.preventDefault();
					$scope.selectAll();
				}
				else if (e.keyCode == 38) { // KEY UP
					e.preventDefault();
					$scope.keyUp(e);
				}
				else if (e.keyCode == 40) { // KEY DOWN
					e.preventDefault();
					$scope.keyDown(e);
				}
			};

			/* STATE FUNCTIONS --------------------------------------------- */

			// ROW SELECTION STATUS
			$scope.isRowSelected = function(index) {
				return ($scope.visibleData[index].selected ? "rectNG-selected" : "");
			};

			// DEFAULT COLUMN WIDTH
			$scope.getColumnWidth = function() {
				if (!$scope.width || $scope.width.indexOf("%") > 0)
					return (100.0 / $scope.visibleModel.length) + "%";
				else {
					var width = parseFloat($scope.width);
					return (width / $scope.visibleModel.length) + "px";
				}
			};
			$scope.columnWidth = $scope.getColumnWidth();

			/* EXTERNAL EVENTS ----------------------------------------- */

			$scope.$on('rectngSelectRow', function(event, index){
				if (index < 0 || index >= $scope.visibleData.length)
					return;

				$scope.lastSelectIndex = index;

				for (var i = 0; i < $scope.visibleData.length; i++)
					$scope.visibleData[i].selected = false;
				$scope.visibleData[index].selected = true;

				// Set the new selection on the parent's variable
				if ($attrs.selectedRows) {
					var tmp = $scope.cloneObj($scope.visibleData[$scope.lastSelectIndex]);
				delete tmp.selected; // don't return 'selected'
				$scope.$parent[$attrs.selectedRows] = [tmp];

				if(!$scope.$parent.$$phase)
					$scope.$parent.$digest();
			}

			if(!$scope.$parent.$$phase && !$scope.$$phase)
				$scope.$digest();
			});

			$scope.$on('rectngSelectAll', function(event, index){
				$scope.selectAll();

				if(!$scope.$parent.$$phase && !$scope.$$phase)
					$scope.$digest();
			});

			$scope.$on('rectngSelectNone', function(event, index){
				$scope.selectNone();

				if(!$scope.$parent.$$phase && !$scope.$$phase)
					$scope.$digest();
			});

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
			};

			// Generic sort function by Triptych @ StackOverflow
			// values.sort($scope.sortFunction('price', true, parseInt));
			// values.sort($scope.sortFunction('city', false, function(a){return a.toUpperCase()}));
			$scope.sortFunction = function(field, reverse, compareFunction) {
				var key = compareFunction ?
				function(x) {
					return compareFunction(x[field]);
				} :
				function(x) {
					return x[field];
				};
				reverse = [-1, 1][+!!reverse];

				return function(a, b) {
					a = key(a);
					b = key(b);
					if (!a && !b)
						return 0;
					else if (!a)
						return -reverse;
					else if (!b)
						return reverse;

					return reverse * ((a > b) - (b > a));
				};
			};

			/* PARAMETER WATCHES ------------------------------------------- */

			// MONITOR THE VALUES BOUND TO THE PARAMETERS
			// Watch the data variable
			$scope.$watch($attrs.data, function() {
				$scope.$parent.$watch($attrs.data, function() { // If the content changes
					$scope.data = $scope.$parent.$eval($attrs.data) || [];
					// Refresh visible rows
					if ($scope.lastSortIndex == -1)
						$scope.updateVisibleData();
					else {
						$scope.sortBy($scope.lastSortIndex, true);
					}
				});
				$scope.data = $scope.$parent.$eval($attrs.data) || []; // If the variable name changes
				// Refresh visible rows
				if ($scope.lastSortIndex == -1)
					$scope.updateVisibleData();
				else {
					$scope.sortBy($scope.lastSortIndex, true);
				}
			});

			// Watch the columns variable
			$scope.$watch($attrs.columns, function() {
				$scope.$parent.$watch($attrs.columns, function() { // If the content changes
					$scope.columns = $scope.$parent.$eval($attrs.columns) || [];
					$scope.updateVisibleModel();
				});
				$scope.columns = $scope.$parent.$eval($attrs.columns) || []; // If the variable name changes
				$scope.updateVisibleModel();
			});

			// Watch the filter variable
			$scope.$watch($attrs.filter, function() {
				$scope.$parent.$watch($attrs.filter, function() {
					$scope.filter = $scope.$parent.$eval($attrs.filter) || "";
					$scope.updateVisibleData();
				});
				$scope.filter = $scope.$parent.$eval($attrs.filter) || "";
				$scope.updateVisibleData();
			});

			// Watch the multiselection flag
			$scope.$watch($attrs.multiselect, function() {
				$scope.multiselect = ($attrs.multiselect === undefined || $attrs.multiselect == "true");
			});

			// Watch the pager flag
			$scope.$watch($attrs.pager, function() {
				$scope.showPager = ($attrs.pager === undefined || $attrs.pager == "true");

				if(!$scope.showPager)
					$scope.itemsPerPage = 10000000000000; // A ridiculous amount that we will never reach
			});

			// Watch the height variable
			$scope.$watch($attrs.height, function() {
				$scope.$parent.$watch($attrs.height, function() {
					$scope.height = $scope.$parent.$eval($attrs.height) || $scope.height;
				});
				$scope.height = $scope.$parent.$eval($attrs.height) || $scope.height;
			});

			// Watch the width variable
			$scope.$watch($attrs.width, function() {
				$scope.$parent.$watch($attrs.width, function() {
					$scope.width = $scope.$parent.$eval($attrs.width) || $scope.width;
				});
				$scope.width = $scope.$parent.$eval($attrs.width) || $scope.width;
				$scope.columnWidth = $scope.getColumnWidth();
			});
		},
		// Not ideal, but in order to keep everything packaged into a single file,
		// the CSS code is also embedded in the template
		template: [
		'<div>',
			'<style>',
				'.rectNG {margin: 0; padding: 0 0 79px; display: block; outline: none; user-select: none; -ms-user-select: none; -moz-user-select: none; -webkit-user-select: none;}',
				// HEADER
				'.rectNG > div.rectNG-head {display: table;width: 100%;border-bottom: 2px solid #ccc;}',
				'.rectNG > div.rectNG-head > div:first-child {display: table-row;height: 38px;cursor: pointer;}',
				'.rectNG-title {display: table-cell;color:#555;font-size: 16px;font-weight: bold;vertical-align: middle;padding: 3px 6px;}',
				// BODY
				'.rectNG > .rectNG-body {width: 100%;height: 100%;overflow: auto;display: block;}',
				'.rectNG > .rectNG-body > .rectNG-inner{display: table;width: 100%;}',
				'.rectNG-inner > .rectNG-row {display: table-row;width: 100%;height: 33px;cursor: pointer;}',
				'.rectNG-inner > .rectNG-row:nth-child(2n) {background-color: #fefefe;}',
				'.rectNG-inner > .rectNG-row:nth-child(2n+1) {background-color: #f9f9f9;}',
				'.rectNG-inner > .rectNG-row:hover {background-color: #eee;}',
				'.rectNG-row > .rectNG-cell {display: table-cell;vertical-align: middle;padding: 3px 6px;}',
				// FOOTER
				'.rectNG > .rectNG-footer {width: 100%; height: 35px; border-top: 2px solid #ccc;}',
				'.rectNG > .rectNG-footer > .rectNG-pager {float: right; padding-top: 12px;}',
				'.rectNG > .rectNG-footer > .rectNG-pager > .rectNG-page {display:table-cell;}',
				'.rectNG > .rectNG-footer > .rectNG-pager > .rectNG-page > span {padding: 4px 8px; background-color: #f9f9f9;cursor: pointer;}',
				'.rectNG > .rectNG-footer > .rectNG-pager > .rectNG-page > span:hover {background-color: #ddd;}',
				'.rectNG > .rectNG-footer > .rectNG-pager > .rectNG-page > .rectNG-pageinput {width: 50px; height: 20px; margin: 0; border: 0; font-size: 14px; text-align: center; outline: none; user-select: none; -ms-user-select: none; -moz-user-select: none; -webkit-user-select: none;}',
				'.rectNG > .rectNG-footer > .rectNG-pager > .rectNG-entries {display:table-cell;}',
				'.rectNG > .rectNG-footer > .rectNG-pager > .rectNG-entries > span {margin-right: 20px; padding: 4px 20px; background-color: #f9f9f9;cursor: pointer;}',
				'.rectNG > .rectNG-footer > .rectNG-pager > .rectNG-entries > span:hover {background-color: #ddd;}',
				// SELECTED
				'div.rectNG-row.rectNG-selected {background-color: #ddd !important;}',
			'</style>',

			'<div class="rectNG" ng-init="init()" ng-keydown="onKey($event)" tabindex="10000" style="width: {{width}}; height: {{height}}; padding: {{showPager ? \'0 0 79px\' : \'0 0 44px\'}}; ">',
				'<div class="rectNG-head">',
					'<div>',
						'<div class="rectNG-title" ng-repeat="c in visibleModel" style="width: {{columnWidth}};" ng-click="sortBy($index)">{{c.title}} <span ng-show="lastSortIndex==$index && sortAscending">&darr;</span><span ng-show="lastSortIndex==$index && !sortAscending">&uarr;</span></div>',
					'</div>',
				'</div>',
				'<div class="rectNG-body">',
					'<div class="rectNG-inner">',
						'<div class="rectNG-row" ng-repeat="row in visibleData track by $index" ng-click="cellClick($index, $event)" ng-class="isRowSelected($index)">',
							'<div class="rectNG-cell" ng-repeat="c in visibleModel" style="width: {{columnWidth}};">',
								'<a ng-if="hrefField" ng-href="{{visibleData[$parent.$parent.$index][hrefField]}}">{{visibleData[$parent.$parent.$index][c.id]}}</a>',
								'<span ng-if="!hrefField">{{visibleData[$parent.$parent.$index][c.id]}}</span>',
							'</div>',
						'</div>',
					'</div>',
				'</div>',
				'<div class="rectNG-footer" ng-show="showPager">',
					'<div class="rectNG-pager">',
						'<div class="rectNG-entries"><span class="arrow" ng-click="toggleItemsPerPage()">{{itemsPerPage}}</span></div>',
						'<div class="rectNG-page"><span class="arrow" ng-click="prevPage()">&larr;</span></div>',
						'<div class="rectNG-page">',
							'<span ng-show="!showPageInputBox" ng-click="gotoPage($event)">{{currentPage + \' / \' + countPages()}}</span>',
							'<input class="rectNG-pageinput" ng-show="showPageInputBox" ng-keydown="gotoPage($event)" ng-blur="gotoPage($event)" ng-model="currentPage" type="text"></input>',
						'</div>',
						'<div class="rectNG-page"><span class="arrow" ng-click="nextPage()">&rarr;</span></div>',
					'</div>',
				'</div>',
			'</div>',
		'</div>'].join(''),
		replace: true
	};
});
