/*global
	d3
*/
(function(){
    'use strict';

    var cmBlock = d3.select('#control_modules');

    var cmModulesArray = [];

    function addcontrolModeItem(dataItem, dataIndex){

    	//console.log('addcontrolModeItem ... ');
    	
    	var $currentLi = cmBlock.append('li').attr('id', 'chart'+dataIndex,true);

    	var cmModule=d3.bubbleTree.apply($currentLi, [{
                dataset: dataItem, 
                id: 'chart'+dataIndex,

                circleRL1_radius: 40, //radius for l-0, if undefined will be calculated
                circleRL1_font_size: 17, //font size for l-0, if undefined will be calculated
                circleRL2_radius: 26, //radius for l-1, if undefined will be calculated
                circleRL2_font_size: 12, //font size for l-1, if undefined will be calculated
                
                transitionDuration: 900, //duration for transitions
            
                alertMessage: 'Alert message! Alert message! Alert message!', // alert message
                alertBackground: '#ff0090', // alert background
                alertColor: '#fff', // alert text color
                alertStroke: d3.color('#ff0090').darker(1) // alert border
            }] );

    	cmModule.draw();

		window.addEventListener("resize", cmModule.draw);

        cmModulesArray.push(cmModule);
    }

    function getClosestLi(nodeItem) {
        var curObject = nodeItem;

        while (curObject.tagName.toLowerCase() !== 'li' && curObject.parentNode !== null) {
            curObject = curObject.parentNode;
        }

        if (curObject.tagName.toLowerCase() === 'li') {
            return curObject;
        } else {
            return null;
        }
    }

    function closeAllOtherDetails() {
         var currentId;
        var evt=d3.event;

        evt.preventDefault();
        evt.stopPropagation();
        evt.stopImmediatePropagation();

        var $currentLi = getClosestLi(evt.target);

        if ($currentLi !== null) {
            currentId = parseInt($currentLi.id.replace('chart',''));

            cmModulesArray.forEach(function($element, index){
                //debugger;
                if (currentId !== index) {
                    $element.hideDetails();
                }
            });
        } else {
            console.log('something wrong with click');
        }
    }

    d3.json("json/ballExample.json", function(dataAll) {

    	dataAll.slice(0,2).forEach(function(dataItem, dataIndex){

    		addcontrolModeItem(dataItem, dataIndex);

    	});

        cmBlock
            .selectAll('li')
            .on('click', closeAllOtherDetails);

    });

}());