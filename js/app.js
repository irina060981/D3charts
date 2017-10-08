/*global
	d3
*/
(function(){
    'use strict';

    var cmBlock = d3.select('#control_modules');

    function addcontrolModeItem(dataItem){

    	console.log('addcontrolModeItem ... ');
    	
    	var $currentLi = cmBlock.append('li');

    	var cmModule=d3.bubbleTree.apply($currentLi, [{dataset: dataItem}] );

    	cmModule.draw();

		window.addEventListener("resize", cmModule.draw);
    }

    d3.json("json/ballExample.json", function(dataAll) {

    	dataAll.slice(0,1).forEach(function(dataItem){

    		addcontrolModeItem(dataItem);

    	});


    });

}());