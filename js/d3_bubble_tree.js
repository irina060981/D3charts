/*global
	d3
*/
(function(){
    'use strict';

    d3.bubbleTree = function(params) {
    	var chartDom, circlesSVG;
    	var circleDist, baseCircleR;
    	var svgBaseHeight;

    	var baseKoef = 0.5;

    	var defaultParams = {
    		
    	};

		function checkParams() {
			Object.keys(defaultParams).forEach(function(prop){
				if (params[prop] === undefined) {
					params[prop] = defaultParams[prop];
				}				
			});
		}

		function changeHeightSVG(newHeight) {
			var height = svgBaseHeight;
			var bubbleLineY = circleDist/2;

			if (newHeight !== undefined) {
				height = Math.max(newHeight, height);	

				if (height>svgBaseHeight) {
					bubbleLineY = height/2;
				}
				
			} 

			circlesSVG.attr('height', height);

			circlesSVG.selectAll('.bubbleLine')
				.attr("transform", "translate(" + circleDist/2 + "," + bubbleLineY + ")");
		}

		function addDetailLine(d, i, arr, littlCircleR, strokeHeight) {
			var detailGroup = this;

			var detailLine = detailGroup
								.selectAll('.detailLine')
								.data(d.values).enter()
								.append('g').classed('detailLine', true)
								.attr('transform', function(data, index) { 
									var newY = strokeHeight + index * littlCircleR * 4;
									return 'translate(' + '0, ' + newY  + ')'; 
								});

			drawBall
				.apply(detailLine.append('circle'), [littlCircleR]);

			drawTextInBall
				.apply(detailLine.append('text'), [littlCircleR])
				.attr('transform', function(d, index){
												var newY = littlCircleR*baseKoef/4;
												return "translate(" + 0 + "," + newY + ")";
											});

			drawTextUnderBall
				.apply(detailLine.append('text'), [littlCircleR])
				.attr('transform', function(d, index){
												var newY = littlCircleR + littlCircleR * baseKoef;
												return "translate(" + 0 + "," + newY + ")";
											});
			
		}

		function redrawMiddleLine(yPos) {

			circlesSVG.selectAll('.ball_line.hidden').classed('hidden', false);

			circlesSVG
				.selectAll('.ball_line.item'+yPos)
				.classed('hidden', true);
		}



			/*blGroups.selectAll('.ball_line')
						.data(d3.ticks(0,1, params.dataset.length-1) ).enter()
						.append('line')
							.attr('class', function(d,i) { return 'item'+i; })
							.classed('ball_line', true)
							.attr('transform', function(d, index){
											var newY = baseCircleR * baseKoef/4;
											var newX = index*(circleDist*2);
											return "translate(" + newX + "," + newY + ")";
										})
							.attr('x1', circleDist/2)
							.attr('x2', circleDist*3/2)
							.attr('y1', 0)
							.attr('y2', 0)
							.attr("marker-start", "url(#markerCircle)")
							.attr("marker-end", "url(#markerArrow)");*/

		function addMiddleHorizontalConnections(detailGroup, yPos, bigDist, littleR) {
			
			//circlesSVG.selectAll('.ball_line_detail.hidden').classed('hidden', true);

			var detailedLines=detailGroup
								.append('g')
								.classed('detailLines', true);
			detailedLines
				.selectAll('.ball_line_detail.item'+yPos)
				.data([1,2]).enter()
					.append('line')
						.attr('class', function(d,i) { return 'item'+i; })
						.classed('ball_line_detail', true)
						.attr('x1', function(d) {
							if (d===1) {
								return bigDist/2;	
							} else {
								return bigDist*3/2;	
							}
						})
						.attr('x2', function(d){
							if (d===1) {
								return bigDist - littleR*2;
							} else {
								return bigDist + littleR*2;
							}
						})
						.attr('y1', 0)
						.attr('y2', 0)
						.attr("marker-start", "url(#markerCircle)")
						.attr("marker-end", "url(#markerArrow)")
						.attr('transform', function(){
											var newY = Math.round(baseCircleR * baseKoef/4);
											var newX = yPos*(bigDist*2);
											return "translate(" + 0 + "," + newY + ")";
										});
		}

		function createDetailsBlock(d, i, arr) {
			circlesSVG.selectAll('.detailGroup').remove();

			var yPos = (i===arr.length-1) ? i-1 : i;

			var marginGroup = circleDist/2 * 0.1;
			
			
			var littlCircleR = baseCircleR/(baseKoef*4);
			var strokeHeight = Math.floor(littlCircleR*baseKoef/2);

			var detailGroupX = yPos*(circleDist*2) + circleDist*3/2;

			var detailGroup = circlesSVG
								.append('g')
									.classed('detailGroup', true)
										.attr("transform", "translate(" + detailGroupX + "," + littlCircleR + ")");

			addDetailLine.apply(detailGroup, [d, i, d.values, littlCircleR, strokeHeight]);

			var newHeight = strokeHeight * 2 + littlCircleR*2*d.values.length + littlCircleR*2*(d.values.length-1) + littlCircleR;	

			redrawMiddleLine(yPos);

			addMiddleHorizontalConnections(detailGroup, yPos, circleDist, littlCircleR);

			changeHeightSVG(newHeight);
		}

		function ballClick(d, i, arr) {
			var evt=d3.event;

			evt.preventDefault();
			evt.stopPropagation();
			evt.stopImmediatePropagation();

			var targetClasses = d3.select(evt.target).attr('class').replace('ball_value','').replace('ball','').replace(' ','');

			//console.log('targetClasses', targetClasses, targetClasses.indexOf('active'));

			if (targetClasses.indexOf('active') === -1) {
				console.log('action ....');

				d3.selectAll('.ball_value.active').classed('active', false);
				d3.selectAll('.ball.active').classed('active', false);

				d3.selectAll('.ball_value.'+targetClasses).classed('active', true);
				d3.selectAll('.ball.'+targetClasses).classed('active', true);

				createDetailsBlock(d,i, arr);
			}
		}

		function drawBall(radius) {
			var circleObj=this;

			return circleObj
					.classed('ball', true)
					.attr('r', radius)
					.style("stroke", function(d) { 
						return d.color.replace('##', '#');
					})
					.style("stroke-width", Math.floor(radius*baseKoef/2)+"px")
					.on("click", ballClick);
		}

		function addBalls() {
			var percentGroup=this;

			var circleObj = percentGroup
								.append('g')
								.classed('balls', true)
									.selectAll('.ball')
									.data(params.dataset).enter()
									.append('circle')
										.attr('class', function(d,i) { return 'item'+i; });
			drawBall
				.apply(circleObj, [baseCircleR])
				.attr('transform', function(d, index){
											var newY = 0;
											var newX = index*(circleDist*2);
											return "translate(" + newX + "," + newY + ")";
										})
				.on("click", ballClick);

			return percentGroup;

		}

		function drawTextInBall(radius) {
			var textObj=this;

			return textObj
						.classed('ball_value', true)
						.text(function(d){
							return d.percentage + '%';
						})
						.style('fill', function(d) { 
								return d.color.replace('##', '#');
							})
						.style('font-size', radius/2+'px');
		}

		function addValueTextToBalls() {
			var percentGroup=this;

			var textObj = percentGroup
							.append('g')
							.classed('ball_values', true)
								.selectAll('.ball_value')
								.data(params.dataset).enter()
								.append('text')
									.attr('class', function(d,i) { return 'item'+i; });
			drawTextInBall.apply(textObj, [baseCircleR])					
							.attr('transform', function(d, index){
												var newY = baseCircleR * baseKoef/4;
												var newX = index*(circleDist*2);
												return "translate(" + newX + "," + newY + ")";
											})
							.on("click", ballClick);	

			return percentGroup;		
		}

		function divideTextObjToLines(textObjs, width) {
			textObjs.each(function(){
				var textObj = d3.select(this);
				var text = textObj.text();
				textObj.text('');
				var words = text.split(/\s+/).reverse();
				var line=[];

				var tspanObj = textObj
								.append('tspan')
									.attr('x', 0)
									.attr('y', 0)
									.attr('dy', 0);
				
				var word, lineHeight=1.1, lineNumber=0;

				//debugger;

				while (word = words.pop()) {
					line.push(word);		

					if (tspanObj.nodes()[0].getComputedTextLength() > width) {
						line.pop();
						line=[word];

						lineNumber++;

						tspanObj = textObj
								.append('tspan')
									.attr('x', 0)
									.attr('y', 0)
									.attr('dy', lineNumber * lineHeight + 'em')
									.text(word);
					} else {
						tspanObj.text(line.join(' '));
					}
				}
			});

		}

		function drawTextUnderBall(radius) {
			var textObj=this;

			return textObj
						.classed('ball_label', true)
						.text(function(d){
							return d.title;
						})
						.style('font-size', radius*baseKoef*0.8+'px');
		}

		function addLabelTextUnderBalls() {
			var percentGroup=this;

			var textObj = percentGroup
							.append('g')
							.classed('ball_labels', true)
								.selectAll('.ball_label')
								.data(params.dataset).enter()
								.append('text');

			drawTextUnderBall.apply(textObj, [baseCircleR])
					.attr('transform', function(d, index){
								var newY = baseCircleR + baseCircleR * baseKoef;
								var newX = index*(circleDist*2);
								return "translate(" + newX + "," + newY + ")";
							})
					.call(divideTextObjToLines, baseCircleR*baseKoef*5);

			//divideTextObjToLines.apply(textObj, [baseCircleR*2.5])
			return percentGroup;		
		}

		function addLinesBetweenBalls() {
			var percentGroup=this;

			var blGroups = percentGroup
							.append('g')
							.classed('ball_lines', true);

			//console.log('d3.ticks', d3.ticks(0,1, params.dataset.length-1));

			blGroups.selectAll('.ball_line')
						.data(d3.ticks(0,1, params.dataset.length-1) ).enter()
						.append('line')
							.attr('class', function(d,i) { return 'item'+i; })
							.classed('ball_line', true)
							.attr('transform', function(d, index){
											var newY = baseCircleR * baseKoef/4;
											var newX = index*(circleDist*2);
											return "translate(" + newX + "," + newY + ")";
										})
							.attr('x1', circleDist/2)
							.attr('x2', circleDist*3/2)
							.attr('y1', 0)
							.attr('y2', 0)
							.attr("marker-start", "url(#markerCircle)")
							.attr("marker-end", "url(#markerArrow)");

			return percentGroup;		
		}

		function addArrowDefinition(){
			var svgPart = this;

			var markerSize = baseCircleR/5;

			var arg1 = Math.round((markerSize-1)/6); //2
			var arg2 = Math.round((markerSize-1)/2); //6
			var arg3 = Math.round(markerSize-(markerSize-1)/6); //10
			var arg4 = arg3-1;
			
			var defs = svgPart.append('defs');

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
					.style('fill', '#415559');

			/*<marker id="markerArrow" markerWidth="13" markerHeight="13" refX="2" refY="6"
		           orient="auto">
		        <path d="M2,2 L2,11 L10,6 L2,2" style="fill: #000000;" />
		    </marker>*/

			var markerCircleSize = baseCircleR/20;

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
					.style('fill', '#415559');


			return svgPart;
		}

		function hideAllDetails(){
			circlesSVG.selectAll('.detailGroup').remove();
			changeHeightSVG();

			d3.selectAll('.ball_value').classed('active', false);
			d3.selectAll('.ball').classed('active', false);

			circlesSVG.selectAll('.ball_line.hidden').classed('hidden', false);
		}

		function drawCirclesGroup() {
			var cntDist = params.dataset.length * 2 -1;
			var totalWidth = chartDom.nodes()[0].offsetWidth;

			//console.log('totalWidth - ', totalWidth, params.dataset);

			circleDist = totalWidth/cntDist;
			baseCircleR = circleDist/2 * baseKoef;

			svgBaseHeight = circleDist * baseKoef *2.6;

			circlesSVG = chartDom
						.append('svg')
							.attr('height', svgBaseHeight)
							.attr('width', totalWidth);

			addArrowDefinition.apply(circlesSVG);

			var percentGroup = circlesSVG
						    	.append('g')
						    		.classed('bubbleLine', true)
						    		.attr("transform", "translate(" + circleDist/2 + "," + circleDist/2 + ")");

			addBalls.apply(percentGroup);

			addValueTextToBalls.apply(percentGroup);

			addLinesBetweenBalls.apply(percentGroup);

			addLabelTextUnderBalls.apply(percentGroup);

			circlesSVG.on("click", hideAllDetails);
		}

		function draw() {

			chartDom.selectAll("*").remove();
			drawCirclesGroup(chartDom);

			return chartDom;
		}

		function init() {
			checkParams();			
		}
		/********** init point ****************/

		chartDom = this;
		init();

		return {
			draw: draw
		};

    };

}());