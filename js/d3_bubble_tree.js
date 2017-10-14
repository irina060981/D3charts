/*global
	d3
*/
(function(){
    'use strict';

    d3.bubbleTree = function(params) {

    	var $chartDom, $mainSVG;
    	var svgParams = {height: 0, width: 0, baseCircleDist: 0};

    	var defaultParams={
    		margin: 20,
    		maxRadius: 64,
    		blackColor: '#415559',
    		maxFontSize: 16,
    		minFontSize: 6
    		/*
    		minFontSize: 6,
    		labelDistanceKoef: 1.8,
    		animDur: 200,
    		betweenGroupsKoef: 1.2*/
    	};

		function checkParams() {
			Object.keys(defaultParams).forEach(function(prop){
				if (params[prop] === undefined) {
					params[prop] = defaultParams[prop];
				}				
			});
		}

		function calcBaseValues() {
			var width, height, fontSizeL1, fontSizeL2, fontSizeL3;
			var leftSpace = 0, baseCircleDist=0, circleRL1=0, circleRL2=0, circleRL3=0;

			width = $chartDom.nodes()[0].offsetWidth;

			baseCircleDist = Math.round((width-2*params.margin) / params.dataset.length);
			leftSpace = baseCircleDist;

			circleRL1 = Math.min(params.maxRadius, Math.round(baseCircleDist/(3*2)));
			leftSpace = leftSpace - circleRL1*2 - 2*params.margin;

			circleRL2 = Math.min(params.maxRadius, Math.round(leftSpace/(2*2)));
			leftSpace = leftSpace - circleRL2*2 - 2*params.margin;

			circleRL3 = Math.min(params.maxRadius, Math.round(leftSpace/2));
			leftSpace = leftSpace - circleRL3*2 - 2*params.margin;

			fontSizeL1 = Math.max(Math.min(Math.round(circleRL1/2), params.maxFontSize), params.minFontSize);
			fontSizeL2 = Math.max(Math.min(Math.round(fontSizeL1/2), params.maxFontSize), params.minFontSize);
			fontSizeL3 = Math.max(Math.min(Math.round(fontSizeL2/2), params.maxFontSize), params.minFontSize);

			height = circleRL1*2 + 2*params.margin + fontSizeL1*2;

			svgParams.width = width;
			svgParams.height = height;

			svgParams.baseCircleDist = baseCircleDist;
			
			svgParams.circleL1 = {radius: circleRL1, strokeWidth: Math.round(circleRL1*0.2), fontSize: fontSizeL1};
			svgParams.circleL2 = {radius: circleRL2, strokeWidth: Math.round(circleRL2*0.2), fontSize: fontSizeL2};
			svgParams.circleL3 = {radius: circleRL3, strokeWidth: Math.round(circleRL3*0.2), fontSize: fontSizeL3};
		}

		function setSVGSize($svg, width, height) {
			return $svg
					.attr('height', height)
					.attr('width', width)
					.attr('viewBox', '0 0 '+ width + ' ' + height);
		}

		function addMarkerArrow($defs, level) {
			var radius = svgParams['circleL'+level].radius;
			var markerSize = radius/3;

			var arg1 = Math.round((markerSize-1)/6); //2
			var arg2 = Math.round((markerSize-1)/2); //6
			var arg3 = Math.round(markerSize-(markerSize-1)/6); //10
			var arg4 = arg3-1;

			$defs.append('marker')
				.attr('id', 'markerArrowL'+level)
				.attr('markerUnits', 'strokeWidth')
				.attr('markerWidth', markerSize*2)
				.attr('markerHeight', markerSize*2)
				.attr('refX', arg1)
				.attr('refY', arg2)
				.attr('orient', 'auto')
					.append('path')
					.attr('d', 'M' + arg1 + ',' + arg1+ ' L' + arg1 + ',' + arg4 + ' L' + arg3 + ',' + arg2 + ' L' + arg1 + ',' + arg1)
					.style('fill', params.blackColor);			
		}

		function addMarkerPoint($defs, level) {
			var radius = svgParams['circleL'+level].radius;
			var markerCircleSize = radius/15;

			$defs.append('marker')
				.attr('id', 'markerCircleL'+level)
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
		}

		function addMarkersDefinition(){
			var $defs = $mainSVG.append('defs');
			var levels = ['1', '2', '3'];

			levels.forEach(function(level){
				addMarkerArrow($defs, level);
				addMarkerPoint($defs, level);
			});
		}

		function createSVG(){
			$chartDom.selectAll("*").remove();	

			calcBaseValues();

			$mainSVG = $chartDom
						.append('svg')
							.attr('id', params.id)
							.attr('xmlns', "http://www.w3.org/2000/svg")
							.attr('xmlns:xlink', "http://www.w3.org/1999/xlink")
							.attr('x',"0")
							.attr('y',"0")
							;
			
			setSVGSize($mainSVG, svgParams.width, svgParams.height);

			console.log('svgParams', svgParams);

			addMarkersDefinition();		
		}

		function findBiggestHeight() {
			return $mainSVG.selectAll('.chartGroup').node().getBoundingClientRect().height;
		}

		function checkSVGHeight() {
			var biggetsHeight = findBiggestHeight();

			svgParams.height = biggetsHeight + params.margin*2;
			setSVGSize($mainSVG, svgParams.width, svgParams.height);

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

				word = words.pop();
				while (word !== undefined) {
					line.push(word);		

					if (tspanObj.nodes()[0].getComputedTextLength() > width) {
						line.pop();
						line=[word];

						lineNumber=lineNumber+1;

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

					word = words.pop();
				}
			});
		}

		function drawValueBall($group, circleData, layer, dataset) {			
			var labelY = 0, valueFontSize;

			var strokeWidth = Math.floor(radius * 0.2);

			var radius = circleData.radius;
			var strokeWidth = circleData.strokeWidth;
			var fontSize = circleData.fontSize;

			var $ballsGroup = $group
								.selectAll('.ballGroup')
								.data(dataset).enter()
									.append('g')
										.attr('class', function(d, i) { return 'item'+i; })
										.classed('layer'+layer, true)
										.classed('ballGroup', true);

			$ballsGroup.append('circle')
					.attr('class', function(d,i) { return 'item'+i; })
					.classed('ball', true)
					.attr('r', radius)
					.style("stroke", function(d) { 
						return d.color.replace('##', '#');
					})
					.attr('data-color', function(d) { 
						return d.color.replace('##', '#');
					})
					.style("stroke-width", strokeWidth+"px");

			valueFontSize = Math.round(radius/2);

			$ballsGroup.append('text')
					.attr('class', function(d,i) { return 'item'+i; })
					.classed('ball_value', true)

					.text(function(d){
						return d.percentage + '%';
					})
					.style('fill', function(d) { 
							return d.color.replace('##', '#');
						})
					.attr('dy', Math.round(valueFontSize/3) + 'px')
					.style('font-size', valueFontSize + 'px');

			labelY = radius + strokeWidth + fontSize/2;

			$ballsGroup.append('text')
					.attr('class', function(d,i) { return 'item'+i; })
					.classed('ball_label', true)
					.text(function(d){
						return d.title;
					})
					.style('font-size', fontSize +'px')
					.attr("transform", "translate(0," + labelY + ")")
					.call(divideTextObjToLines, radius+strokeWidth*2, fontSize/2);

			return $ballsGroup;
		}

		function drawMiddleLine($group) {
			var $blGroups = $group
							.append('g')
							.classed('ball_lines', true);	

			var lineX1 = svgParams.circleL1.strokeWidth*2;
			var lineX2 = svgParams.baseCircleDist - svgParams.circleL1.radius*2 - svgParams.circleL1.strokeWidth*3;
			var len = lineX2- lineX1;

			var $ballLines = $blGroups.selectAll('.ball_line')
						.data(d3.ticks(0,1, params.dataset.length-1) ).enter()
						.append('line')
							.attr('class', function(d,i) { return 'item'+i; })
							.classed('ball_line', true)
							.attr('transform', function(d, index){
											var newY = 0;
											var newX = svgParams.circleL1.radius + index*svgParams.baseCircleDist;
											//var newX = Math.round(index*(circleDiametr*3) + bigRadius);
											return "translate(" + newX + "," + newY + ")";
										})
							.attr('x1', lineX1)
							.attr('x2', lineX2)
							.attr('y1', 0)
							.attr('y2', 0)
							.style('stroke', params.blackColor)
							.attr("marker-start", "url(#markerCircleL1)")
							.attr("marker-end", "url(#markerArrowL1)")
							.attr("stroke-dasharray", len + " " + len)
						    .attr("stroke-dashoffset", len);
							;

			$ballLines
				.transition()
				    .attr("stroke-dashoffset", 0);
		}

		function defineBallGroup(object) {
			while (object!== undefined && d3.select(object).attr('class').indexOf('ballGroup') === -1) {
				object = object.parentNode;
			}

			return d3.select(object);
		}

		function closeBallGroupDetails($ballGroup) {

			console.log('closing ball group', $ballGroup.attr('class'));

			$ballGroup.classed('active', false);
		}

		function openBallGroupDetails($ballGroup) {

			console.log('opening ball group', $ballGroup.attr('class'));

			$ballGroup.classed('active', true);
		}

		function bigBallGroupClick(){
			var evt=d3.event;

			evt.preventDefault();
			evt.stopPropagation();
			evt.stopImmediatePropagation();

			var $ballGroup = defineBallGroup(evt.target);

			if ($ballGroup.attr('class').indexOf('active') > -1) {
				closeBallGroupDetails($ballGroup);
			} else {
				openBallGroupDetails($ballGroup);
			}
		}

		function addBigBallsInLine($group) {
			var $balls = $group
							.append('g')
							.classed('bigBalls', true);

			drawValueBall($balls, svgParams.circleL1, '1', params.dataset)
				.attr('transform', function(d, i){
					var newY = 0;
					var newX = i*svgParams.baseCircleDist;

					return "translate(" + newX + "," + newY + ")";
				})
				.on("click", bigBallGroupClick);
			checkSVGHeight();
		}

		function addChart() {
			var $bigChartGroup = $mainSVG
									.append('g')
									.classed('chartGroup', true)
									.attr('transform', 'translate(' + params.margin + ', ' + params.margin + ')');

			var $bigBallsGroup = $bigChartGroup
							    	.append('g')
							    		.classed('bubbleLine', true)
							    		.attr("transform", "translate(" +svgParams.circleL1.radius + "," + svgParams.circleL1.radius + ")");
			
			addBigBallsInLine($bigBallsGroup);
			drawMiddleLine($bigBallsGroup);
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