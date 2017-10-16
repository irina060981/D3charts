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
    		maxRadius: 50,
    		blackColor: '#415559',
    		maxFontSize: 16,
    		minFontSize: 5,
    		circleRL1_radius: 40,
    		circleRL1_font_size: 17,
    		circleRL2_radius: 26,
    		circleRL2_font_size: 12, 
    		transitionDuration: 900,
    		alertMessage: 'Alert message! Alert message! Alert message!',
    		alertBackground: '#ff0090',
    		alertColor: '#fff',
    		alertStroke: d3.color('#ff0090').darker(1)
    	};

		function getTranslateX($object) {
			var attr, checkSymbol;
			if ($object !== null && $object.attr('transform') !== null ) {
				attr= $object.attr('transform').replace('translate(','').replace(')','').trim();
				if (attr.indexOf(',') > 0) {
					checkSymbol = attr.indexOf(',');
				} else if (attr.indexOf(' ') > 0) {
					checkSymbol = attr.indexOf(' ');
				} 

				if (checkSymbol !== undefined) {
					return parseInt(attr.substr(0, checkSymbol));
				} else {
					return parseInt(attr);
				}
			}
			return 0;
		}

		function getTranslateY($object) {
			var attr, checkSymbol;

			if ($object !== null && $object.attr('transform') !== null ) {
				attr= $object.attr('transform').replace('translate(','').replace(')','').trim();
				if (attr.indexOf(',') > 0) {
					checkSymbol = attr.indexOf(',');
				} else if (attr.indexOf(' ') > 0) {
					checkSymbol = attr.indexOf(' ');
				} 

				if (checkSymbol !== undefined) {
					return parseInt(attr.substr(checkSymbol+1));
				} else {
					return parseInt(attr);
				}
			}
			
			return 0;
		}
		
		function getItemIndex($object) {
			return parseInt($object.attr('class').replace(/^.*item(\d+).*$/,"$1"));
		}

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
			//debugger;

			baseCircleDist = Math.round((width-2*params.margin) / params.dataset.length);
			leftSpace = baseCircleDist;

			circleRL1 = params.circleRL1_radius || Math.min(params.maxRadius, Math.round(baseCircleDist/(3*2)));
			circleRL2 = params.circleRL2_radius || Math.round(circleRL1*0.65);
			circleRL3 = Math.round(circleRL2*0.65);
			//debugger;
			fontSizeL1 = params.circleRL1_font_size || Math.max(Math.min(Math.round(circleRL1/3), params.maxFontSize), params.minFontSize);
			fontSizeL2 = params.circleRL2_font_size || Math.max(Math.min(Math.round(circleRL2/3), params.maxFontSize), params.minFontSize);
			fontSizeL3 = Math.max(Math.min(Math.round(circleRL3/3), params.maxFontSize), params.minFontSize);

			height = circleRL1*2 + 2*params.margin + fontSizeL1*2;

			svgParams.width = width;
			svgParams.height = height;

			svgParams.widthM = width - 2*params.margin;

			svgParams.baseCircleDist = baseCircleDist;
			
			svgParams.circleL1 = {radius: circleRL1, strokeWidth: Math.round(circleRL1*0.2), fontSize: fontSizeL1 };
			svgParams.circleL2 = {radius: circleRL2, strokeWidth: Math.round(circleRL2*0.2), fontSize: fontSizeL2};
			svgParams.circleL3 = {radius: circleRL3, strokeWidth: Math.round(circleRL3*0.2), fontSize: fontSizeL3};

			[1,2,3].forEach(function(item){
				svgParams['circleL'+item].fullHeight = svgParams['circleL'+item].radius*2 + svgParams['circleL'+item].fontSize;
			});
		}

		function setSVGSize($svg, width, height, withAnimation) {
			$svg
				.attr('width', width);

			if (withAnimation === true) {
				$svg
					.transition()
						.duration(params.transitionDuration)
						.attr('height', height);
			} else {
				$svg
					.attr('height', height);
			}
					
			return $svg;
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
							;
			
			setSVGSize($mainSVG, svgParams.width, svgParams.height);

			addMarkersDefinition();		
		}

		function findBiggestHeight(className) {
			return $mainSVG.selectAll(className).node().getBoundingClientRect().height;
		}

		function checkSVGHeight(withAnimation) {
			var biggetsHeight = findBiggestHeight('.chartGroup');

			svgParams.height = biggetsHeight + params.margin*3;
			setSVGSize($mainSVG, svgParams.width, svgParams.height, withAnimation);
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

			var $innerBallGroup = $ballsGroup.append('g').classed('innerBallGroup', true).classed('layer'+layer, true);


			$innerBallGroup.append('circle')
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

			$innerBallGroup.append('text')
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

			$innerBallGroup.append('text')
					.attr('class', function(d,i) { return 'item'+i; })
					.classed('ball_label', true)
					.text(function(d){
						return d.title;
					})
					.style('font-size', fontSize +'px')
					.attr("transform", "translate(0," + labelY + ")")
					.call(divideTextObjToLines, radius, fontSize/2);

			return $ballsGroup;
		}

		function addAnimationToLine($ballLines, len) {
			$ballLines
				.attr("stroke-dasharray", len + " " + len)
				.attr("stroke-dashoffset", len)
				.transition()
					.duration(params.transitionDuration)
				    .attr("stroke-dashoffset", 0);
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
							.attr("stroke-dashoffset", 0);

			addAnimationToLine($ballLines, len);
		}

		function findParentWithClass(object, checkclass) {
			//debugger;
			while (object!== null && d3.select(object).attr('class').indexOf(checkclass) === -1) {
				object = object.parentNode;
			}
			if (d3.select(object).attr('class').indexOf(checkclass) !== -1) {
				return d3.select(object);
			}
			return null;
		}

		function removeVertLine($ballGroup) {
			var $detailGroup = d3.select($ballGroup.node().parentNode);
			$detailGroup.selectAll('.vertLine.layer2').remove();
		}

		function closeBallGroupDetails($ballGroup, layer) {
			var xRightVL, xLeftVL;
			var $parentDetailGroup, $ballGroups;

			var indexes = getIndexesOfBallGroup($ballGroup);
			$ballGroup.classed('active', false);

			if (layer === 1) {
				$mainSVG.selectAll('.ball_line.item'+indexes.i).classed('hidden', false);
			}
			$ballGroup.selectAll('.detailGroup').remove();
			
			$parentDetailGroup = d3.select($ballGroup.node().parentNode);
			$ballGroups = $parentDetailGroup.selectAll('.ballGroup.layer2');

			if (layer === 2) {
				//debugger;
				xLeftVL =  $parentDetailGroup.selectAll('.vertLine.layer2.left').attr('x1');
				xRightVL =  $parentDetailGroup.selectAll('.vertLine.layer2.right').attr('x1');
				removeVertLine($ballGroup);
				removeLeftLines2($ballGroup);
			

				if ($parentDetailGroup.selectAll('.ballGroup.layer2.active').nodes().length === 0) {
					placeCenterBallGroup($parentDetailGroup, 2);
				}

			}

			alignSmallDetailGroups($ballGroup, layer+1);

			if (layer === 2) {
				addLeftLinesL($ballGroups,2);

				if ($ballGroups.select('.detailGroup').nodes().length === 0) {
					addRightLinesL($ballGroups,2);
				} else {

					addRightLinesLCorrectedL2($ballGroups, $ballGroups.select('.detailGroup'));
				}
			} 
		}

		function getIndexesOfBallGroup($ballGroup) {			
			var parent, index, itemPos, $parentObj;

			var classData = $ballGroup.attr('class');
			itemPos = classData.indexOf('item');

			index = parseInt(classData.substr(itemPos, classData.indexOf(' ', itemPos)).replace('item',''));

			if (classData.indexOf('layer2') > -1) {

				$parentObj = findParentWithClass($ballGroup.node().parentNode, 'ballGroup');
				classData = $parentObj.attr('class');
				itemPos = classData.indexOf('item');
				parent = parseInt(classData.substr(itemPos, classData.indexOf(' ', itemPos)).replace('item',''));
			}

			return {parent: parent, i: index};
		}

		function drawAlertBox() {
			var $box = $mainSVG
						.append('g')
							.classed('alertBox', true)
							.classed('hidden', true)
							.style('cursor', 'pointer');
			var $textBlock = $box
								.append('text')
								.text(params.alertMessage)
								.style('fill', params.alertColor)
									.call(divideTextObjToLines, svgParams.circleL1.radius, svgParams.circleL1.fontSize);
			//debugger;
			var textSizes = $textBlock.node().getBoundingClientRect();

			$box
				.insert('rect', 'text')
					.attr('x', 0)
					.attr('y', 0)
					.attr('rx', Math.round(params.margin/2))
					.attr('ry', Math.round(params.margin/2))
					.style('fill', params.alertBackground)
					.style('stroke', params.alertStroke)
					
					.attr('width', Math.round(textSizes.width + params.margin * 2))
					.attr('height', Math.round(textSizes.height + params.margin * 2));

			$textBlock
				.attr('transform', 'translate(' + params.margin + ',' + params.margin + ')');

			$box
				.on('click', function(){
					$box
						.attr('transform', 'translate(0,0)')
						.classed('hidden', true);
				});
			return $box;
		}

		function getAlertBox() {
			if ($mainSVG.select('.alertBox').nodes().length > 0) {
				return $mainSVG.select('.alertBox');
			} else {
				return drawAlertBox();
			}
		}
		function createAlertMessage($alertBox) {
			var mousePos = d3.mouse($mainSVG.node());
			var alertBoxSize = $alertBox.node().getBoundingClientRect();

			var x = Math.max(0, Math.round(mousePos[0] - alertBoxSize.width/2));
			var y = Math.max(0, mousePos[1] - alertBoxSize.height - 10);

			$alertBox
				.attr('transform', 'translate(' + x + ',' + y + ')')
				.classed('hidden', false);
		}

		function showAlert() {
			var $alertBox = getAlertBox();
			if ($alertBox.attr('class').indexOf('hidden') === -1) {
				$alertBox
					.attr('transform', 'translate(0,0)')
					.classed('hidden', true);

			} else {
				createAlertMessage($alertBox);
			}
		}
		function smallBallGroupClick(d, i){
			var evt=d3.event;

			evt.preventDefault();
			evt.stopPropagation();
			evt.stopImmediatePropagation();

			if (d.values !== undefined) {
				executeBallClick(2, d);
			} else {
				showAlert();
			}
		}

		function alignSmallDetailGroups($group, layer) {
			var $correctedGroup = $group;

			var newHeight, newYEnd, corY, corX, rightCorY;
			if (layer>2) {

				newHeight = $group.node().getBoundingClientRect().height;
				newYEnd = newHeight + getTranslateY($group);

				while($correctedGroup.node().nextSibling !== null) {
					$correctedGroup = d3.select($correctedGroup.node().nextSibling);

					corY = getTranslateY($correctedGroup);
					corX = getTranslateX($correctedGroup);

					rightCorY = newYEnd+svgParams['circleL'+(layer-1)].fontSize*2;
					newHeight = $correctedGroup.node().getBoundingClientRect().height;

					$correctedGroup.attr('transform', 'translate(' + corX + ','+ rightCorY + ')');
					newYEnd = rightCorY + newHeight;			
				}
			}
		}
		function findPrevSibling(group, checkClass) {
			while (group!== null && d3.select(group).attr('class').indexOf(checkClass) === -1) {
				group = group.previousSibling;
			}

			if (d3.select(group).attr('class').indexOf(checkClass) !== -1) {
				return d3.select(group);
			}
			return null;
		}

		function findNextBigGroupX($group){
			var bigGroup = $group.node().parentNode;

			if (bigGroup.nextSibling !== null && d3.select(bigGroup.nextSibling).attr('class').indexOf('ballGroup') !== -1 ) {
				return getTranslateX(d3.select(bigGroup.nextSibling));
			}
			return svgParams.widthM;
		}

		function placeCenterBallGroupL2($group) {
			var groupX=0, x1, x2, diff;
			var $prevObj, $nextObj;

			groupX =Math.round((svgParams.baseCircleDist - svgParams.circleL1.radius*2)/2)+svgParams.circleL1.radius;

			$group
				.attr('transform', "translate(" + groupX + "," + 0 + ")");
		}

		function placeCenterBallGroupL3($group) {
			var groupX=0, x1, x2, diff;
			var $prevObj, $prevObjP, $nextObj, $parentDetail;

			$parentDetail = findParentWithClass($group.node().parentNode, 'detailGroup');

			diff = Math.floor((svgParams.baseCircleDist - svgParams.circleL1.radius*2 - svgParams.circleL2.radius*2 - svgParams.circleL3.radius*2)/5);
			//debugger;
			groupX = diff + svgParams.circleL1.radius*2;
			$parentDetail
				.attr('transform', "translate(" + groupX + "," + 0 + ")");	
			
			groupX = diff + svgParams.circleL2.radius*2;

			$group
				.attr('transform', "translate(" + groupX + "," + 0 + ")");	
		}

		function placeCenterBallGroup($group, layer) {
			var ballX=0;

			if (layer === 2) {
				placeCenterBallGroupL2($group);
			} 
			if (layer == 3) {
				placeCenterBallGroupL3($group);
			}

			$group.selectAll('.ballGroup')
				.attr('transform', function(d, i){
					var groupY = svgParams['circleL'+(layer-1)].fullHeight * i;
					return "translate(" + ballX + "," + groupY + ")";
				});
		}

		function findStartVertLine($ballGroups, checkInner, checkParent, checkLayer) {
			var minY=1000000000000000, maxY=0;

			$ballGroups.each(function(item, index){
				var $group = d3.select(this);
				var curY = getTranslateY($group);

				if (checkInner === true) {
					curY = curY + getTranslateY($group.select('.innerBallGroup'));
				}

				if (checkParent === true && $group.attr('class').indexOf('layer'+checkLayer) > -1) {
					curY = curY + getTranslateY(d3.select($group.node().parentNode.parentNode));
				}

				minY = Math.min(minY, curY);
				maxY = Math.max(maxY, curY);

			});
			return {min: minY, max: maxY, len: maxY-minY};
		}

		function addVertLine($detailGroup, $ballGroups, x, layer, side, withAnimation) {

			var dataForVert = findStartVertLine($ballGroups);

			var $lines = $detailGroup
							.append('line')
								.attr('class', function(d,i) { return 'layer'+layer;})
								.classed('vertLine', true)
								.classed(side, true)
								.attr('y1', dataForVert.min)
								.attr('y2', dataForVert.len)
								.attr('x2', x)
								.attr('x1', x)
								.style('stroke', params.blackColor)
								.style('stroke-width', '1px');

			if (withAnimation === true) {
				addAnimationToLine($lines, Math.abs(dataForVert.max-dataForVert.min));
			}
		}

		function addLeftLinesL($ballGroups, layer, withAnimation) {
			var x1, x2, $parentBalls;
			var $parentDetailGroup = d3.select($ballGroups.node().parentNode);
			var $parentBallInnerGroup = d3.select($parentDetailGroup.node().previousSibling);

			var len = getTranslateX($parentDetailGroup) - getTranslateX($parentBallInnerGroup) - svgParams['circleL'+layer].radius - svgParams['circleL'+(layer-1)].radius;//debugger;

			x1 = Math.floor(-len*0.8-svgParams['circleL'+layer].radius+ svgParams['circleL'+layer].strokeWidth);
			x2 = Math.floor(-len*0.2-svgParams['circleL'+layer].radius- svgParams['circleL'+layer].strokeWidth);

			var lineY=0;

			var $line = $ballGroups
						.selectAll('.innerBallGroup.layer'+layer)
						.append('line')
							.attr('class', function(d,i) { return 'item'+i + ' layer'+layer;})
							.classed('leftLine', true)
							.attr('y1', 0)
							.attr('y2', 0)
							.attr('x2', x2)
							.attr('x1', x1)
							.style('stroke', params.blackColor)
							.style('stroke-width', '1px')
							.attr('marker-start', 'url(#markerCircleL1)')
							.attr('marker-end', 'url(#markerArrowL1)');

			if (withAnimation === true) {
				addAnimationToLine($line, Math.abs(x2-x1));
			}

			addVertLine($parentDetailGroup, $ballGroups, x1, layer, 'left', withAnimation);
		}

		function addRightLinesL($ballGroups, layer, withAnimation) {
			var x1, x2, $parentBalls, dataForVert;
			var $parentDetailGroup = d3.select($ballGroups.node().parentNode);
			var $parentBallInnerGroup = d3.select($parentDetailGroup.node().previousSibling);

			var len = getTranslateX($parentDetailGroup) - getTranslateX($parentBallInnerGroup) - svgParams['circleL'+layer].radius - svgParams['circleL'+(layer-1)].radius;//debugger;

			x2 = Math.floor(len*0.8+svgParams['circleL'+layer].radius- svgParams['circleL'+layer].strokeWidth);
			x1 = Math.floor(len*0.2+svgParams['circleL'+layer].radius+ svgParams['circleL'+layer].strokeWidth);

			var lineY=0;

			$ballGroups.each(function(){
				var $line;
				var $ballGroup = d3.select(this);

				if ($ballGroup.attr('class').indexOf('active') === -1 && $ballGroup.selectAll('.innerBallGroup.layer'+layer).selectAll('.rightLine').nodes().length === 0) {
					$line = $ballGroup
					.selectAll('.innerBallGroup.layer'+layer)
					.append('line')
						.attr('class', function(d,i) { return 'item'+i + ' layer'+layer;})
						.classed('rightLine', true)
						.attr('y1', 0)
						.attr('y2', 0)
						.attr('x2', x2)
						.attr('x1', x1)
						.style('stroke', params.blackColor)
						.style('stroke-width', '1px')
						.attr('marker-start', 'url(#markerCircleL1)')
						.attr('marker-end', 'url(#markerCircleL1)');

					if (withAnimation === true) {
						addAnimationToLine($line, Math.abs(x2-x1));
					}
				}				
			});


			if (layer === 2) {
				addVertLine($parentDetailGroup, $ballGroups, x2, layer, 'right', withAnimation);
			}
		}

		function addRightLinesLCorrectedL2($ballGroups, $detailGroup) {
			var dataForVert = findStartVertLine($ballGroups);

			var $parentDetailGroup = d3.select($ballGroups.node().parentNode);

			var widthDetail = $detailGroup.node().getBoundingClientRect().width;
			
			var x1 = Math.round(svgParams.circleL2.radius*1.22);
			var x2 = Math.round(widthDetail + svgParams.circleL2.radius*1.5);

			$ballGroups.each(function(){
				var $ballGroup = d3.select(this);
				var $line;

				if ($ballGroup.attr('class').indexOf('active') === -1) {
					$line = $ballGroup
								.selectAll('.innerBallGroup.layer2')
								.append('line')
									.attr('class', function(d,i) { return 'item'+i + ' layer2';})
									.classed('rightLine', true)
									.attr('y1', 0)
									.attr('y2', 0)
									.attr('x2', x2)
									.attr('x1', x1)
									.style('stroke', params.blackColor)
									.style('stroke-width', '1px')
									.attr('marker-start', 'url(#markerCircleL1)')
									.attr('marker-end', 'url(#markerCircleL1)')
									;
				}				
			});

			addVertLine($parentDetailGroup, $ballGroups, x2, 2, 'right');
		}

		function removeLeftLines2($detailGroup) {
			var $parentDetailGroup = findParentWithClass($detailGroup.node(), 'detailGroup');
			$parentDetailGroup.selectAll('.leftLine.layer2').remove();
			$parentDetailGroup.selectAll('.rightLine.layer2').remove();
			$parentDetailGroup.selectAll('.vertLine.layer2').remove();
		}

		function createDetailsBlock(indexes, $ballGroup, layer, dataset) {
			var $parentDetail, x2, parentDetailWidth;
			var $detailGroup = $ballGroup
								.append('g')
									.attr('class', function(){
										var classN='item' + indexes.i;
										if (indexes.parent !== undefined) {
											classN='item' + indexes.i + ' parent' + indexes.parent;
										}
										return classN;
									})
									.classed('detailGroup', true)
									.classed('layer'+layer, true);

			if (layer === 3) {
				removeLeftLines2($ballGroup);
			}

			var $resultBalls = drawValueBall($detailGroup, svgParams['circleL'+layer], layer, dataset);

			placeCenterBallGroup($detailGroup, layer);//, $detailGroup.node().previousSibling, $detailGroup.node().parentNode.nextSibling);

			$resultBalls.on('click', smallBallGroupClick);

			if (layer<3) {
				$detailGroup.selectAll('.innerBallGroup')
					.on("mouseenter", ballGroupMouseOver)
					.on("mouseleave", ballGroupMouseOut);
			}	

			alignSmallDetailGroups($ballGroup, layer);

			if (layer === 2) {
				addLeftLinesL($resultBalls,2, true);
				addRightLinesL($resultBalls, 2, true);
			} else {
				$parentDetail = findParentWithClass($ballGroup.node(), 'detailGroup');
				addLeftLinesL($parentDetail.selectAll('.ballGroup.layer2'),2);

				addLeftLinesL($resultBalls,3, true);
				addRightLinesL($resultBalls, 3, true);

				addRightLinesLCorrectedL2($parentDetail.selectAll('.ballGroup.layer2'), $detailGroup);
			}

			return $detailGroup;
		}


		function openBallGroupDetails($ballGroup, layer) {
			var indexes = getIndexesOfBallGroup($ballGroup);
			var dataset;

			if (indexes.parent === undefined) {
				dataset = params.dataset[indexes.i].values;
			} else {
				dataset = params.dataset[indexes.parent].values[indexes.i].values;
			}

			if (dataset === undefined) {
				showAlert();
			} else {

				$ballGroup.classed('active', true);

				if (layer === 1) {
					$mainSVG.selectAll('.ball_line.item'+indexes.i).classed('hidden', true);
				}			

				createDetailsBlock(indexes, $ballGroup, layer+1, dataset);	
			}
		}

		function defineCenterBall($group, layer) {
			var dataset = $group.select('.detailGroup').selectAll('.ballGroup.layer'+(layer+1));

			$group.select('.detailGroup').selectAll('.ballGroup.layer'+(layer+1)).classed('centerAlign', false);
			//debugger;
			var midHeight = Math.round($group.select('.detailGroup.layer'+ (layer+1)).node().getBoundingClientRect().height / 2);
			var minDiff=100000000000, aligningIndex = 0;

			dataset.each(function(item, index){
				//debugger;
				var $ballGroup = d3.select(this);
				var currentAligningY = getTranslateY($ballGroup) + getTranslateY($ballGroup.select('.innerBallGroup')) + svgParams['circleL'+(layer+1)].radius;

				var curDiff = Math.abs(midHeight-currentAligningY);
				minDiff = Math.min(minDiff, curDiff);
				if (minDiff===curDiff) {
					aligningIndex = index;
				}
			});

			return d3.select(dataset.nodes()[aligningIndex]);
		}

		function makeLeftLonger($leftLine) {
			var x1, x2, len;

			if ($leftLine.node() !== null && $leftLine.attr('class').indexOf('corrected') === -1) {
				x1 = parseInt($leftLine.attr('x1'));
				x2 = parseInt($leftLine.attr('x2'));

				x1 = x1 * 1.1;

				len = Math.abs(x1-x2);

				$leftLine
					.attr('x1', x1)
					.attr('stroke-dasharray', len + ' ' + len)
					.attr('stroke-dashoffset', 0);

				$leftLine.classed('corrected', true);
			}
		}

		function makeRightLonger($rightLine, layer) {
			var x1, x2, len, i;
			//debugger;

			if ($rightLine.node() !== null && $rightLine.attr('class').indexOf('corrected') === -1) {

				i = getItemIndex(findParentWithClass($rightLine.node(), 'layer1'));
				if (i< params.dataset.length-1) {
					x1 = parseInt($rightLine.attr('x1'));
					x2 = parseInt($rightLine.attr('x2'));

					if (layer === 2) {
						x2 = Math.round(x2 * 1.02);	
					} else {
						x2 = Math.round(x2 * 1.2);
					}
					
					len = Math.abs(x1-x2);

					$rightLine
						.attr('x2', x2)
						.attr('stroke-dasharray', len + ' ' + len)
						.attr('stroke-dashoffset', 0);

					$rightLine.attr('marker-end', 'url(#markerArrowL1)');
					$rightLine.classed('corrected', true);
				}
			} 
		}

		function makeMiddleLineLonger($ballGroup) {
			if ($ballGroup.select('.centerAlign.layer2').nodes().length > 0) {
				makeLeftLonger($ballGroup.select('.centerAlign.layer2').select('.leftLine.layer2'));
				//debugger;
				if ($ballGroup.select('.centerAlign.layer3').nodes().length === 0) {
					makeRightLonger($ballGroup.select('.centerAlign.layer2').select('.rightLine.layer2'), 2);
				} else {

					if ($ballGroup.select('.centerAlign.layer2').select('.centerAlign.layer3').nodes().length > 0) {
						makeRightLonger($ballGroup.select('.centerAlign.layer2').select('.centerAlign.layer3').select('.rightLine.layer3'), 3);
					} else {
						makeRightLonger($ballGroup.select('.centerAlign.layer2').select('.rightLine.layer2'), 2);
					}
				}
			}
		}

		function correctVertLines($detailGroup, layer) {
			var $leftVertLine = $detailGroup.selectAll('.vertLine.left.layer'+layer);
			var x = $leftVertLine.attr('x1');

			var dataForVert = findStartVertLine($detailGroup.selectAll('.ballGroup.layer'+layer), true);

			$leftVertLine
				.attr('y1', dataForVert.min)
				.attr('y2', dataForVert.max);

			var $rightVertLine = $detailGroup.selectAll('.vertLine.right.layer'+layer);
			x = $rightVertLine.attr('x1');

			dataForVert = findStartVertLine($detailGroup.selectAll('.ballGroup'), false, true, 3);
			$rightVertLine
				.attr('y1', dataForVert.min)
				.attr('y2', dataForVert.max);
		}

		function centerDetailGroupFinal($detailGrop) {
			var detailGroupWidth, diff, x, y, leftLineWIdth

			if ($detailGrop.nodes().length > 0) {
				detailGroupWidth = $detailGrop.node().getBoundingClientRect().width;

				diff = Math.round((svgParams.baseCircleDist - detailGroupWidth - svgParams.circleL1.radius*2)/2);

				if ($detailGrop.selectAll('.detailGroup').nodes().length === 0) {
					x = diff + detailGroupWidth/2 + svgParams.circleL1.radius;
				} else {

					if ($detailGrop.selectAll('.layer2.centerAlign').nodes().length >0) {
						leftLineWIdth = $detailGrop.selectAll('.layer2.centerAlign').selectAll('.innerBallGroup').select('.leftLine').node().getBoundingClientRect().width*1.4;
					} else {
						leftLineWIdth = $detailGrop.select('.layer2').selectAll('.innerBallGroup').select('.leftLine').node().getBoundingClientRect().width*1.4;
						leftLineWIdth = leftLineWIdth + $detailGrop.selectAll('.simplyMiddle.layer2.rightLine').node().getBoundingClientRect().width*1.4;
					}
					
					x = svgParams.circleL1.radius + svgParams.circleL2.radius + diff + leftLineWIdth;
				}

				y = getTranslateY($detailGrop);
				$detailGrop
					.attr('transform', 'translate(' + x + ' , ' + y + ')');

			}
		}

		function placeOddBalls($ballGroup, layer) {//nechetnoye
			var $ballGroupForAligning, currentAligningY, groupX, groupY;

			$ballGroupForAligning = defineCenterBall($ballGroup, layer);
			$ballGroupForAligning
				.classed('centerAlign', true);

			//console.log('defined', layer, $ballGroupForAligning.node());

			currentAligningY = getTranslateY($ballGroupForAligning) + getTranslateY($ballGroupForAligning.select('.innerBallGroup')) + svgParams['circleL'+(layer+1)].radius;

			groupX = getTranslateX($ballGroup.select('.innerBallGroup'));
			
			groupY = currentAligningY-svgParams['circleL'+layer].radius+svgParams['circleL'+layer].fontSize;

			$ballGroup.select('.innerBallGroup')
				.attr('transform', 'translate('  + groupX + ',' + groupY + ')');
		}

		function placeEvenBalls($ballGroup, layer) {
			var groupX, groupY;

			var $detailGroup = $ballGroup.select('.detailGroup');
			var groupHeight = $detailGroup.node().getBoundingClientRect().height;

			groupX = getTranslateX($ballGroup.select('.innerBallGroup'));
			groupY = Math.round(groupHeight/2-svgParams['circleL'+layer].radius)+svgParams['circleL'+layer].fontSize;

			$ballGroup.select('.innerBallGroup')
				.attr('transform', 'translate('  + groupX + ',' + groupY + ')');

		}

		function addLayerMiddleLines($ballGroup, layer){
			var $rightLine, $leftLine, xLeft, xRight, y, xLeft2;

			$leftLine = $ballGroup.select('.vertLine.left.layer'+layer);
			if (layer ===2) {
				$rightLine = $ballGroup.select('.vertLine.right.layer'+layer);
				y = Math.round($rightLine.node().getBoundingClientRect().height/2);
			} else {
				y = Math.round($leftLine.node().getBoundingClientRect().height/2);
			}

			y = y + Math.round((svgParams.circleL2.radius)/2);
			xLeft = $leftLine.attr('x1');

			var $detailGroup = $ballGroup.select('.detailGroup.layer'+layer);
			//console.log('addLayerMiddleLines', layer);
			if ($detailGroup.selectAll('.detailGroup').nodes().length > 0) {
				xLeft2 = Math.round(xLeft*1.2);
			} else {
				xLeft2 = Math.round(xLeft*1.1);
			}

			$detailGroup
				.append('line')
					.classed('leftLine', true)
					.classed('layer'+layer, true)
					.classed('simplyMiddle', true)
					.attr('x1', xLeft)
					.attr('x2', xLeft2)
					.attr('y1', y)
					.attr('y2', y)
					.style('stroke', params.blackColor)
					.attr("marker-end", "url(#markerCircleL1)");

			if (layer ===2) {
				xRight = $rightLine.attr('x1');
				$detailGroup
					.append('line')
						.classed('rightLine', true)
						.classed('layer'+layer, true)
						.classed('simplyMiddle', true)
						.attr('x1', xRight)
						.attr('x2', Math.round(xRight*1.1))
						.attr('y1', y)
						.attr('y2', y)
						.style('stroke', params.blackColor)
						.attr("marker-end", "url(#markerCircleL1)");
			}
		}

		function centerBigBallsInGroups(layer) {
			var $balls = $mainSVG.selectAll('.layer' + layer + '.ballGroup');

			$balls.each(function(item, i, arr){
				var $leftLine, $rightLine, x1, x2;
				var $ballGroupForAligning, currentAligningY, groupX, groupY, bigRadius ;

				var $allBallGroups;
				var $ballGroup = d3.select(this);


				if ($ballGroup.attr('class').indexOf('active') === -1) {
			
					$ballGroup.select('.innerBallGroup')
						.attr('transform', 'translate(0,0)');
					$ballGroup.selectAll('.centerAlign')
						.classed('centerAlign', false);

				} else {

					$allBallGroups = $ballGroup.select('.detailGroup').selectAll('.ballGroup.layer'+(layer+1));

					if ($allBallGroups.nodes().length % 2 !== 0) {
						console.log('nechetnoye', $allBallGroups.nodes().length);
						placeOddBalls($ballGroup, layer);
						makeMiddleLineLonger($ballGroup);
					} else {
						console.log('chetnoye', $allBallGroups.nodes().length);
						placeEvenBalls($ballGroup, layer);
						//$ballGroup.selectAll('.simplyMiddle').remove();
						addLayerMiddleLines($ballGroup, layer+1);
					}					

					centerDetailGroupFinal($ballGroup.select('.detailGroup.layer2'));
					
				}
			});	

			if (layer === 2) {
				correctVertLines( d3.select($balls.node().parentNode) , layer);
			}
		}

		function centerDetailGroups() {
			var maxY=0;

			$mainSVG.selectAll('.layer1.ballGroup').selectAll('.innerBallGroup.layer1').each(function(){
				var $ballGroup = d3.select(this);

				var thisY = getTranslateY($ballGroup);
				maxY = Math.max(maxY, thisY);
			});

			$mainSVG.selectAll('.layer1.ballGroup').selectAll('.innerBallGroup.layer1').each(function(){
				//debugger;
				var $ballGroup = d3.select(this);
				var $parentGroup = d3.select($ballGroup.node().parentNode);

				var thisY = getTranslateY($ballGroup);
				var diff = maxY - thisY;

				var groupX = getTranslateX($parentGroup);
				$parentGroup.attr('transform', 'translate(' + groupX + ',' + diff + ')');
				
			});

			$mainSVG.selectAll('.ball_line').each(function(){
				var $ball_line = d3.select(this);
				var groupX = getTranslateX($ball_line);

				var ballLineID = getItemIndex($ball_line);
				var groupY = getTranslateY($mainSVG.select('.layer1.ballGroup.item'+ballLineID));
				$ball_line.attr('transform', 'translate(' + groupX + ',' + groupY + ')');
			});
		}

		function executeBallClick(layer, d) {
			var evt=d3.event, indexes;

			evt.preventDefault();
			evt.stopPropagation();
			evt.stopImmediatePropagation();

			var $ballGroup = d3.select(evt.target);
			if ($ballGroup.attr('class').indexOf('.ballGroup') === -1) {
				$ballGroup = findParentWithClass(evt.target, 'ballGroup');
			}
			
			if (layer<3 && ($ballGroup.attr('class').indexOf('layer1')>1 || $ballGroup.attr('class').indexOf('layer2') > -1) ) {

				if ($ballGroup.attr('class').indexOf('active') > -1) {
					closeBallGroupDetails($ballGroup, layer);
				} else {
					openBallGroupDetails($ballGroup, layer, d.values);
				}

				centerBigBallsInGroups(layer);

				if (layer-1>0) {
					centerBigBallsInGroups(layer-1);
				}

				centerDetailGroups();
				checkSVGHeight(true);
				$chartDom.on('click')();
			}
		}

		function bigBallGroupClick(d){
			executeBallClick(1, d);
		}

		function ballGroupMouseOut() {
			var $element=d3.select(d3.event.target);

			var circleColor = $element.selectAll('circle').attr('data-color');

			$element.selectAll('.ball_value')
				.transition()
					.duration(100)
					.style('fill', circleColor)
					.attr('transform', 'translate(0, 0)');

			$element.selectAll('circle')
				.transition()
					.duration(100)
					.style('stroke', circleColor);
		}

		function ballGroupMouseOver(){
			var evt=d3.event;
			var circleColor, darkerColor;

			evt.preventDefault();
			evt.stopPropagation();
			evt.stopImmediatePropagation();

			var $element=d3.select(d3.event.target);
			//debugger;
			var indexes = getIndexesOfBallGroup(findParentWithClass($element.node(),'ballGroup'));
			var dataset;

			if (indexes.parent === undefined) {
				dataset = params.dataset[indexes.i].values;
			} else {
				dataset = params.dataset[indexes.parent].values[indexes.i].values;
			}

			if (dataset !== undefined) {

				circleColor = $element.selectAll('circle').attr('data-color');
				darkerColor = d3.color(circleColor).darker(1);

				$element
					.selectAll('circle')
					.transition()
					    .style("stroke", darkerColor);
				$element
					.selectAll('.ball_value')
					.attr('transform', 'translate(0, 0)')
					.transition()
						.style("fill", darkerColor)
						.attr('transform', 'translate(0, -10)')
					.transition()
						.attr('transform', 'translate(0, 0)')
					;
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
				.on("click", bigBallGroupClick)
				;
			$balls.selectAll('.innerBallGroup')
				.on("mouseenter", ballGroupMouseOver)
				.on("mouseleave", ballGroupMouseOut);

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

		function hideDetails() {

			$mainSVG.selectAll('.detailGroup').remove();
			$mainSVG.selectAll('.innerBallGroup').attr('transform', 'translate(0,0)');
			$mainSVG.selectAll('.ballGroup').each(function(){
				var $ballG = d3.select(this);
				var x = getTranslateX($ballG);

				$ballG.attr('transform', 'translate(' + x + ',' + 0 + ')');
			});

			$mainSVG.selectAll('.ball_line').each(function(){
				var $ballL = d3.select(this);
				var x = getTranslateX($ballL);

				$ballL.attr('transform', 'translate(' + x + ',' + 0 + ')');
			});

			$mainSVG.selectAll('.ballGroup').classed('active', false);
			$mainSVG.selectAll('.ball_line').classed('hidden', false);

			getAlertBox().classed('hidden', true);
			checkSVGHeight(true);

			return $chartDom;
		}

	     function init() {
			checkParams();			
		}

		/********** init point ****************/

		$chartDom = this;
		init();

		return {
			draw: draw,
			hideDetails: hideDetails
		};
	};

}());

