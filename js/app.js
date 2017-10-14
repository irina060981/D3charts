/*global
	d3
*/
(function(){
    'use strict';

    var cmBlock = d3.select('#control_modules');

    var cmModulesArray = [];

    function addcontrolModeItem(dataItem, dataIndex){

    	console.log('addcontrolModeItem ... ');
    	
    	var $currentLi = cmBlock.append('li').attr('id', 'chart'+dataIndex,true);

    	var cmModule=d3.bubbleTree.apply($currentLi, [{dataset: dataItem, id: 'chart'+dataIndex}] );

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

        var evt=d3.event;

        evt.preventDefault();
        evt.stopPropagation();
        evt.stopImmediatePropagation();

        var $currentLi = getClosestLi(evt.target);

        if ($currentLi !== null) {
            var currentId = parseInt($currentLi.id.replace('chart',''));

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

    	dataAll.slice(0,1).forEach(function(dataItem, dataIndex){

    		addcontrolModeItem(dataItem, dataIndex);

    	});

        cmBlock
            .selectAll('li')
            .on('click', closeAllOtherDetails);

    });

}());