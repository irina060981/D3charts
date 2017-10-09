/*global
	d3
*/
(function(){
    'use strict';

    d3.bubbleTree = function(params) {
    	var $chartDom, $mainSVG;

    	var circleDiametr, bigRadius;

    	var defaultParams={
    		blackColor: '#415559',
    		margin: 20,
    		minFontSize: 6
    	};

    	var baseSVGWidth, baseSVGHeight;

		function checkParams() {
			Object.keys(defaultParams).forEach(function(prop){
				if (params[prop] === undefined) {
					params[prop] = defaultParams[prop];
				}				
			});
		}

		function addMarkersDefinition(radius){
			var $svg = this;

			var markerSize = radius/5;

			var arg1 = Math.round((markerSize-1)/6); //2
			var arg2 = Math.round((markerSize-1)/2); //6
			var arg3 = Math.round(markerSize-(markerSize-1)/6); //10
			var arg4 = arg3-1;
			
			var defs = $svg.append('defs');

			defs.append('marker')
				.attr('id', 'markerArrow')
				.attr('markerUnits', 'strokeWidth')
				.attr('markerWidth', markerSize*2)
				.attr('markerHeight', markerSize*2)
				.attr('refX', arg1)
				.attr('refY', arg2)
				.attr('orient', 'auto')
					.append('path')
					.attr('d', 'M' + arg1 + ',' + arg1+ ' L' + arg1 + ',' + arg4 + ' L' + arg3 + ',' + arg2 + ' L' + arg1 + ',' + arg1)
					.style('fill', params.blackColor);

			var markerCircleSize = radius/20;

			defs.append('marker')
				.attr('id', 'markerCircle')
				.attr('markerUnits', 'strokeWidth')
				.attr('markerWidth', markerCircleSize*3)
				.attr('markerHeight', markerCircleSize*3)
				.attr('refX', markerCircleSize*2-1)
				.attr('refY', markerCircleSize*2-1)
					.append('circle')
					.attr('r', markerCircleSize)
					.attr('cx', markerCircleSize*2-1)
					.attr('cy', markerCircleSize*2-1)
					.style('stroke', 'none')
					.style('fill', params.blackColor);


			return $svg;
		}

		function changeHeightSVG(newHeight) {
			var height = baseSVGHeight;
			var bubbleLineY = Math.round(circleDiametr*0.7);

			if (newHeight !== undefined) {
				height = Math.max(newHeight, height);	

				if (height>baseSVGHeight) {
					bubbleLineY = height/2;
				}
				
			} 

			$mainSVG.attr('height', height);

			var svgX = circleDiametr/2 + params.margin;

			$mainSVG.selectAll('.bubbleLine')
				.attr("transform", "translate(" + svgX + "," + bubbleLineY + ")");
		}

		function divideTextObjToLines(textObjs, width, dy) {
			textObjs.each(function(){
				var textObj = d3.select(this);
				var text = textObj.text();
				textObj.text('');
				var words = text.split(/\s+/).reverse();
				var line=[];

				var tspanObj = textObj
								.append('tspan')
									.classed('ball_label_span', true)									
									.attr('x', 0)
									.attr('y', 0)
									.attr('dy', dy+'px');
				
				var word, lineHeight=dy*2, lineNumber=0;

				while (word = words.pop()) {
					line.push(word);		

					if (tspanObj.nodes()[0].getComputedTextLength() > width) {
						line.pop();
						line=[word];

						lineNumber++;

						tspanObj = textObj
								.append('tspan')
									.classed('ball_label_span', true)
									.attr('x', 0)
									.attr('y', 0)
									.attr('dy', lineNumber * lineHeight + dy + 'px')
									.text(word);
					} else {
						tspanObj.text(line.join(' '));
					}
				}
			});
		}

		function drawValueBall(radius, dataset) {			
			var $ballsLine = this;
			var fontSize;

			var $ballsGroup = $ballsLine
								.selectAll('.ballGroup')
								.data(dataset).enter()
									.append('g')
										.attr('class', function(d,i) { return 'item'+i; })
										.classed('ballGroup', true);

			$ballsGroup.append('circle')
					.attr('class', function(d,i) { return 'item'+i; })
					.classed('ball', true)
					.attr('r', radius)
					.style("stroke", function(d) { 
						return d.color.replace('##', '#');
					})
					.style("stroke-width", Math.floor(radius * 0.2)+"px");

			fontSize = radius/2;

			$ballsGroup.append('text')
					.attr('class', function(d,i) { return 'item'+i; })
					.classed('ball_value', true)

					.text(function(d){
						return d.percentage + '%';
					})
					.style('fill', function(d) { 
							return d.color.replace('##', '#');
						})
					.attr('dy', fontSize/4+'px')
					.style('font-size', fontSize+'px');

			fontSize = Math.max(params.minFontSize,radius/4);

			$ballsGroup.append('text')
					.attr('class', function(d,i) { return 'item'+i; })
					.classed('ball_label', true)
					.text(function(d){
						return d.title;
					})
					.style('font-size', fontSize +'px')
					.attr("transform", "translate(0," + (radius * 1.4) + ")")
					.call(divideTextObjToLines, radius*2.1, fontSize/2);

			return $ballsGroup;
		}

		function defineDetailsHeight(){
			var element = $mainSVG.selectAll('.detailGroup').node();
			var maxHeight = 0;

			$mainSVG.selectAll('.detailGroup').each(function(){
				maxHeight = Math.max(this.getBoundingClientRect().height, maxHeight);
			})
			//debugger;
			//return element.getBoundingClientRect().height + circleDiametr*0.4;
			return maxHeight + circleDiametr*0.4;
		}

		function drawDetailBlock(detailGroupX, detailGroupY, radius, parentIndex, values){
			var $container = this;

			var $detailGroup = $container
								.append('g')
									.attr('class', 'item' + parentIndex)
									.classed('detailGroup', true)
									.attr('transform', function(){

										return 'translate(' + detailGroupX + ', '  + detailGroupY + ')';
									});

			return drawValueBall.apply($detailGroup, [radius/2, values])
								.attr('transform', function(dat, ind){

											var newY = ind * radius * 1.6;
											var newX = 0;

											return "translate(" + newX + "," + newY + ")";
										});

		}

		function createDetailsBlock(layer,d,i, arr, radius, parentIndex) {
			var yPos, detailGroupX, detailGroupY, radiusF;
			var $container, $groups;

			if (layer === 'layer1') {
				yPos = (i===arr.length-1) ? i-1 : i;
				//detailGroupX = yPos*(radius*6) + radius*4 + radius*0.4;
				//var newX = i*(circleDiametr*3);
				detailGroupX = yPos*(circleDiametr*3) + circleDiametr*2 + params.margin;
				detailGroupY = radius * 0.75;

				$container = $mainSVG;
				if (i===arr.length-1) {
					$container.selectAll(".detailGroup.item"+(i-1)).remove();
				}

				radiusF = circleDiametr/2;

			} else if (layer === 'layer2') {
				detailGroupX = circleDiametr/2 + circleDiametr/5;
				detailGroupY = -(radius*d.values.length+ radius * 0.2)/2 ;

				$container = $mainSVG.selectAll('.detailGroup.item'+parentIndex).selectAll('.ballGroup.active');

				radiusF = circleDiametr/4;
			} else {
				return null;
			}
			
			$groups  = drawDetailBlock.apply($container, [detailGroupX, detailGroupY , radiusF, i, d.values]);
			changeHeightSVG(defineDetailsHeight());

			if (layer === 'layer1') {
				$groups
					.style('cursor', function(data) {
						if (data.values !== undefined) {
							return 'pointer';
						} else {
							return 'default';
						}
					})
					.on("click", detailBallGroupClick);
			}
		}

		function hideAllDetails(){
			$mainSVG.selectAll('.detailGroup').remove();
			changeHeightSVG();

			d3.selectAll('.bubbleLine.layer1').selectAll('.ballGroup').classed('active', false);
		}

		function detailBallGroupClick(d, i, arr) {
			var targetItem, $targetObject;
			var evt=d3.event;

			evt.preventDefault();
			evt.stopPropagation();
			evt.stopImmediatePropagation();

			//console.log('detailBallGroupClick - ', d, i, arr);
			
			if (d.values !== undefined) {
				$targetObject = defineCorrectTarget(evt.target);

				targetItem = $targetObject.attr('class').replace(/^.*item(\d+).*$/,"$1");

				if ( d3.selectAll('.detailGroup').selectAll('.ballGroup.item'+targetItem).attr('class').indexOf('active')===-1 ) {
					
					d3.selectAll('.detailGroup').selectAll('.ballGroup.item'+targetItem).classed('active', true);
					createDetailsBlock('layer2', d,i, arr, circleDiametr/4, targetItem);
				}
			}
			
		}

		function defineCorrectTarget(target) {
			var $targetObject = d3.select(target);

			if ($targetObject.attr('class').indexOf('ball_label_span') > -1) {
				$targetObject = $targetObject.select(function() { return this.parentNode; });				
			}

			return $targetObject;
		}

		function bigBallGroupClick(d, i, arr){
			var targetItem, $targetObject;
			var evt=d3.event;

			evt.preventDefault();
			evt.stopPropagation();
			evt.stopImmediatePropagation();

			//console.log('click target - ', d3.select(evt.target).attr('class'));
			
			$targetObject = defineCorrectTarget(evt.target);		

			targetItem = $targetObject.attr('class').replace(/^.*item(\d+).*$/,"$1");

			if ( d3.selectAll('.bubbleLine.layer1').selectAll('.ballGroup.item'+targetItem).attr('class').indexOf('active')===-1 ) {
				
				d3.selectAll('.bubbleLine.layer1').selectAll('.ballGroup').classed('active', false);
				d3.selectAll('.bubbleLine.layer1').selectAll('.ballGroup.item'+targetItem).classed('active', true);
				createDetailsBlock('layer1', d,i, arr, circleDiametr/2);
			}
		}

		function addBigBallsInLine(radius) {
			var $bigBallsGroup = this;
			//debugger;
			var $balls = $bigBallsGroup
								.append('g')
								.classed('balls', true);
								
			drawValueBall.apply($balls, [radius, params.dataset])
								.attr('transform', function(d, i){
											var newY = 0;
											var newX = i*(circleDiametr*3);

											return "translate(" + newX + "," + newY + ")";
										})
								.on("click", bigBallGroupClick);
										
		}

		function createSVG(){
			$chartDom.selectAll("*").remove();	

			baseSVGWidth = $chartDom.nodes()[0].offsetWidth;
			circleDiametr = Math.round((baseSVGWidth-2*params.margin)/(params.dataset.length + (params.dataset.length-1) * 2));
			bigRadius = Math.min(circleDiametr/2, 64);

			baseSVGHeight = Math.round(bigRadius*2 + bigRadius + bigRadius);

			$mainSVG = $chartDom
						.append('svg')
							.attr('height', baseSVGHeight)
							.attr('width', baseSVGWidth);

			addMarkersDefinition.apply($mainSVG, [circleDiametr/2]);
		
		}

		function addChart(){
			var $bigBallsGroup = $mainSVG
					    	.append('g')
					    		.classed('bubbleLine', true)
					    		.classed('layer1', true)
					    		.attr("transform", "translate(" + (circleDiametr/2 + params.margin) + "," + Math.round(circleDiametr*0.7) + ")");

			
			addBigBallsInLine.apply($bigBallsGroup, [bigRadius]);

			$mainSVG.on("click", hideAllDetails);
		}

		function draw() {
			createSVG();

			addChart();

			return $chartDom;
		}

    	function init() {
			checkParams();			
		}
		/********** init point ****************/

		$chartDom = this;
		init();

		return {
			draw: draw
		};
    };

}());