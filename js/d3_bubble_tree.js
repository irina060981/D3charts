/*global
	d3
*/
(function(){
    'use strict';

    d3.bubbleTree = function(params) {
    	var $chartDom, $mainSVG;

    	var circleDiametr, bigRadius, bigLineY, lastActiveDetail={};

    	var defaultParams={
    		blackColor: '#415559',
    		margin: 20,
    		minFontSize: 6,
    		labelDistanceKoef: 1.8,
    		animDur: 200,
    		betweenGroupsKoef: 1.2
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

		function getTranslateX() {
			var $object = this;
			var attr, checkSymbol;
			//debugger;
			if ($object.attr('transform') !== null ) {
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
			} else {
				return null;
			}
		}

		function getTranslateY() {
			var $object = this;
			var attr, checkSymbol;
			//debugger;
			if ($object.attr('transform') !== null ) {
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
			} else {
				return null;
			}
		}

		function getItemIndex($object) {
			var attr = $object.attr('class');	

			return parseInt(attr.replace(/^.*item(\d+).*$/,"$1"));
		}

		function adaptAllDetails() {
			var bigLineY = getTranslateY.call($mainSVG.select('.bubbleLine'));
			

			/*$mainSVG.selectAll('.detailGroup.layer1').each(function(){
				var groupX, groupY, heightBlock;

				var $currentDetailBlock = d3.select(this);
				groupX = getTranslateX.call($currentDetailBlock); 

				heightBlock = this.getBoundingClientRect().height;

				groupY = Math.max(0, bigLineY - heightBlock/2);

				$currentDetailBlock.attr('transform', 'translate(' + groupX + ',' + groupY+')');
				alignLittleHorLine();
			});*/
			$mainSVG.selectAll('.detailGroup.layer1').each(function(){
				var groupX, groupY;

				var $currentDetailBlock = d3.select(this);
				groupX = getTranslateX.call($currentDetailBlock); 

				var totalHeight=0;

				$currentDetailBlock.selectAll('.ballGroup.layer1').each(function(){
					var $curBlock = d3.select(this);
					var ID = getItemIndex($curBlock);
					var circleRadius = circleDiametr/4;

					if ($curBlock.attr('class').indexOf('active') > -1) {
						totalHeight = totalHeight + $currentDetailBlock.selectAll('.detailGroup.item'+ID).node().getBoundingClientRect().height;
					} else {
						totalHeight = totalHeight + circleRadius*params.labelDistanceKoef*2;
					}
				});

				totalHeight = Math.round(totalHeight/2);
				//debugger;
				groupY = Math.max(0, Math.round(bigLineY - totalHeight+bigRadius));
				//debugger;
				$currentDetailBlock.attr('transform', 'translate(' + groupX + ',' + groupY+')');

				correctDetailLines.apply($currentDetailBlock);
				alignLittleHorLine();
			});
		}

		function alignLittleHorLine() {
			d3.selectAll('.detailGroup.layer1').each(function(){
				var $curLittleLeftLine = d3.select(this).selectAll('.horLittleLeftLine.layer1');

				var $curLittleRightLine = d3.select(this).selectAll('.horLittleRightLine.layer1');
				var $curDetailGroup = d3.select(this);

				var currYLine = getTranslateY.apply($curLittleLeftLine);
				var currXLine = getTranslateX.apply($curLittleLeftLine);
				var currDetailGroupY = getTranslateY.apply($curDetailGroup);

				var diff= 10000;
				var newY = currYLine;

				$curDetailGroup.selectAll('.ballGroup.layer1').each(function(){
					var $curBallGroup = d3.select(this);
					var curArrowY =  getTranslateY.apply($curBallGroup);

					if (Math.abs(curArrowY-newY)<30 && diff>Math.abs(curArrowY-newY)) {
						diff = Math.abs(curArrowY-newY);
						newY = curArrowY;
					}
				});

				$curLittleLeftLine.attr('transform', 'translate(' + currXLine + ', ' + newY + ')');

				if ($curLittleRightLine.nodes().length > 0) {
					//console.log('***********',  $curDetailGroup.attr('class'), '***********');

					currYLine = getTranslateY.apply($curLittleRightLine);
					currXLine = getTranslateX.apply($curLittleRightLine);

					diff= 10000;
					newY = currYLine;

					$curDetailGroup.selectAll('.ballGroup').each(function(){
						var $curBallGroup = d3.select(this);
						var curArrowY =  getTranslateY.apply($curBallGroup);

						if ($curBallGroup.attr('class').indexOf('layer2') > -1) {
							curArrowY = curArrowY + getTranslateY.apply(d3.select($curBallGroup.node().parentNode));
						}

						if (Math.abs(curArrowY-newY)<30 && diff>Math.abs(curArrowY-newY)) {
							diff = Math.abs(curArrowY-newY);
							newY = curArrowY;
						}
					});
					$curLittleRightLine.attr('transform', 'translate(' + currXLine + ', ' + newY + ')');
				}

			});
		}

		function changeHeightSVG(newHeight, removeFlag) {
			var height = baseSVGHeight;
			bigLineY = Math.round(circleDiametr*0.7);
			var finalHeight = height, svgX;

			if (newHeight !== undefined) {
				finalHeight = Math.max(newHeight, finalHeight);	
			} 

			if (finalHeight > baseSVGHeight) {
				bigLineY = Math.round(finalHeight/2);
			}

			svgX = Math.round(circleDiametr/2 + params.margin);

			if (removeFlag !== true) {
				$mainSVG
					.attr('height', finalHeight)
					.attr('viewBox', '0 0 '+ baseSVGWidth + ' ' + finalHeight);

				$mainSVG.selectAll('.bubbleLine')
					.attr("transform", "translate(" + svgX + "," + bigLineY + ")");

				adaptAllDetails();				
			} else {
				$mainSVG
					.transition()
					.attr('height', finalHeight)
					.attr('viewBox', '0 0 '+ baseSVGWidth + ' ' + finalHeight)
					;

				$mainSVG.selectAll('.bubbleLine')
					.transition()
					.attr("transform", "translate(" + svgX + "," + bigLineY + ")");
			}

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
					.attr('data-color', function(d) { 
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
					.call(divideTextObjToLines, radius*1.5, fontSize/2);

			return $ballsGroup;
		}

		function defineDetailsHeight(){
			var element = $mainSVG.selectAll('.detailGroup').node();
			var maxHeight = 0;

			$mainSVG.selectAll('.detailGroup').each(function(){
				maxHeight = Math.max(this.getBoundingClientRect().height, maxHeight);
			});

			return Math.round(maxHeight + circleDiametr*params.betweenGroupsKoef);
		}

		function addDetailLinesHorizontal(radius, layer) {
			var $balls = this;
			var xRes = 0;
			var timer1, timer2, $objects1, $objects2, currentClass, markerSize, transformX;

			var d1, d2;

			if (layer==='layer1') {
				d1 = Math.round(-radius*1.4);
				d2 = Math.round(radius*0.6);
			} else {
				d1 = Math.round(-radius*1.2);
				d2 = Math.round(radius*0.4);
			}

			currentClass = defineCurrentDetail( d3.select($balls.node().parentNode) ) ;

			$objects1 = $balls
				.append('line')
					.classed('leftLine', true)
					.attr('transform', 'translate(' + d1 + ', ' + 0 + ')')
					.attr('x1', 0)
					.attr('x2', d2)
					.attr('y1', 0)
					.attr('y2', 0)
					.attr("marker-start", "url(#markerCircle)")
					.attr("marker-end", "url(#markerArrow)")

					.style('stroke', params.blackColor)
					.attr("stroke-dasharray", d2 + " " + d2)
					.attr("stroke-dashoffset", d2);

		$objects1
			.transition()
			    .attr("stroke-dashoffset", 0);
			if (currentClass.index === lastActiveDetail.index && currentClass.parentIndex === lastActiveDetail.parentIndex) {			
				timer1 = setTimeout(function(){
					$objects1
						.transition()
						    .attr("stroke-dashoffset", 0);
					clearTimeout(timer1);
				}, params.animDur);
			} else {
				$objects1.attr("stroke-dashoffset", 0);
			}

			xRes = 0;
			if (layer==='layer1') {
				//markerSize = radius/5 * 0.6;
				xRes=radius*1.4;//-markerSize;
				transformX = Math.floor(radius*0.8);
			} else {
				transformX = Math.floor(radius*0.7);
				xRes=radius*0.4;
			}


			$objects2 = $balls
				.append('line')
					.classed('rightLine', true)
					.classed(layer, true)
					.attr('transform', 'translate(' + transformX + ', ' + 0 + ')')
					.attr('x1', 0)
					.attr('x2', xRes)
					.attr('y1', 0)
					.attr('y2', 0)
					
					.style('stroke', params.blackColor)
					.attr("stroke-dasharray", xRes + " " + xRes)
				    .attr("stroke-dashoffset", xRes);
					;
			/*if (layer==='layer1') {
				$objects2
					.attr("marker-start", "url(#markerCircle)")
					.attr("marker-end", "url(#markerArrow)");
			} else if (layer === 'layer2') {*/
				$objects2
					.attr("marker-start", "url(#markerCircle)");
			//}

			if (currentClass.index === lastActiveDetail.index && currentClass.parentIndex === lastActiveDetail.parentIndex) {
				timer2 = setTimeout(function(){
					$objects2
						.transition()
			    			.attr("stroke-dashoffset", 0);
					clearTimeout(timer2);
				}, params.animDur);
			} else {
				$objects2.attr("stroke-dashoffset", 0);
			}

			return $balls;
		}

		function correctDetailLines() {
			var $detailGroup = this;

			$detailGroup.selectAll('.vertLeftLine.layer1').remove();
			$detailGroup.selectAll('.vertRightLine.layer1').remove();
			$detailGroup.selectAll('.horLittleLeftLine.layer1').remove();
			$detailGroup.selectAll('.horLittleRightLine.layer1').remove();
			
			addDetailLinesVertical.apply($detailGroup, [circleDiametr/2, 'layer1']);
		}

		function getMinMaxTranslateY(withParent) {
			var $group = this;

			var minY = 100000,
				maxY = 0;
			
			
			$group.each(function(){

				var $element = d3.select(this);
				var $parent = d3.select( $element.node().parentNode);
				var parentY=0;

				var curY = getTranslateY.apply($element);

				if (withParent === true) {
					if ($element.attr('class').indexOf('layer2') > -1) {
						parentY = getTranslateY.apply($parent);
						curY = curY + parentY;
					}
				}

				minY = Math.min(minY, curY);
				maxY = Math.max(maxY, curY);
			});


			return {min: minY, max: maxY};
		}

		function addLittleHorizontalToBubbleLine($leftVert, $rightVert, layer) {
			var $detailGroup = this;
			var xLeft, xRight, curIndex, yLeftCenter=0, length, startY, nodesCnt;

			xLeft = getTranslateX.apply($leftVert);

			if (layer === 'layer1') {
				yLeftCenter = getTranslateY.apply($mainSVG.selectAll('.bubbleLine'));
				yLeftCenter = Math.abs(yLeftCenter - getTranslateY.apply($detailGroup));

				length = -circleDiametr*0.1;
			} else {
				nodesCnt = $detailGroup.selectAll('.ballGroup').nodes().length;
				yLeftCenter = Math.round((nodesCnt-1) * circleDiametr/3 * params.labelDistanceKoef * 0.5);

				length = -circleDiametr/2*0.1;
			}

			$detailGroup.append('line')
					.classed('horLittleLeftLine', true)
					.classed(layer, true)
					.attr('transform', 'translate(' + xLeft + ', ' + yLeftCenter + ')')
					.attr('x1', 0)
					.attr('x2', length)
					.attr('y1', 0)
					.attr('y2',0)
					.style('stroke', params.blackColor);

			if ($rightVert !== undefined) {
				curIndex = getItemIndex($detailGroup);

				if (curIndex < params.dataset.length-1) {
					xRight = getTranslateX.apply($rightVert);
					$detailGroup.append('line')
							.classed('horLittleRightLine', true)
							.classed(layer, true)
							.attr('transform', 'translate(' + xRight + ', ' + yLeftCenter + ')')
							.attr('x1', 0)
							.attr('x2', circleDiametr*0.05)
							.attr('y1', 0)
							.attr('y2',0)
							.style('stroke', params.blackColor)
							.attr("marker-end", "url(#markerArrow)");
				}
			}
		}

		function defineCurrentDetail($detailGroup) {
			var classStr = $detailGroup.attr('class');

			var result = {};
			result.index = getItemIndex($detailGroup);
			if (classStr.indexOf('layer1') > -1) {
				result.parentIndex = -1;
			} else {
				result.parentIndex = getItemIndex(d3.select($detailGroup.node().parentNode));
			}

			return result;
		}


		function addDetailLinesVertical(radius, layer) {
			var minMax;
			var $detailGroup = this;
			var $leftVert, $rightVert;
			var d, len;
			var timer1, timer2, currentClass;
			//debugger;
			minMax = getMinMaxTranslateY.apply($detailGroup.selectAll('.ballGroup.'+layer));

			if (layer === 'layer1') {
				d = Math.round(-radius*1.4);
			} else {
				d = Math.round(-radius*1.2);
			}

			currentClass = defineCurrentDetail($detailGroup) ;

			len = minMax.max-minMax.min;
			$leftVert = $detailGroup.append('line')
							.classed('vertLeftLine', true)
							.classed(layer, true)
							.attr('transform', 'translate(' + d + ', ' + minMax.min + ')')
							.attr('x1', 0)
							.attr('x2', 0)
							.attr('y1', 0)
							.attr('y2', len)
							.style('stroke', params.blackColor)
							.attr("stroke-dasharray", len + " " + len)
						    .attr("stroke-dashoffset", len);

			if (currentClass.index === lastActiveDetail.index && currentClass.parentIndex === lastActiveDetail.parentIndex) {

				timer1 = setTimeout(function(){
					$leftVert
						.transition()
			    			.attr("stroke-dashoffset", 0);
					clearTimeout(timer1);
				}, params.animDur);
			} else {
				$leftVert.attr("stroke-dashoffset", 0);
			}

			if (layer === 'layer1') {

				minMax = getMinMaxTranslateY.apply($detailGroup.selectAll('.ballGroup'), [true]);

				len = minMax.max-minMax.min;
				$rightVert = $detailGroup.append('line')
								.classed('vertRightLine', true)
								.classed(layer, true)
								.attr('transform', 'translate(' + Math.floor(radius*2.2) + ', ' + (minMax.min) + ')')
								.attr('x1', 0)
								.attr('x2', 0)
								.attr('y1', 0)
								.attr('y2', len)
								.style('stroke', params.blackColor)
								.attr("stroke-dasharray", len + " " + len)
							    .attr("stroke-dashoffset", len);

				if (currentClass.index === lastActiveDetail.index && currentClass.parentIndex === lastActiveDetail.parentIndex) {

					timer2 = setTimeout(function(){
						$rightVert
							.transition()
			    				.attr("stroke-dashoffset", 0);
						clearTimeout(timer2);
					}, params.animDur);
				} else {
					$rightVert.attr("stroke-dashoffset", 0);
				}				

				addLittleHorizontalToBubbleLine.apply($detailGroup, [$leftVert, $rightVert, layer] );
			} else {
				addLittleHorizontalToBubbleLine.apply($detailGroup, [$leftVert, undefined, layer] );
			}


			return $detailGroup;
		}

		function drawDetailBlock(detailGroupX, detailGroupY, radius, parentIndex, values, layer){
			var $detailGroup, $balls;
			var $container = this;
			var beforeIndex = 10000;

			$container.selectAll('.detailGroup.'+layer).each(function(){
				var curIndex = getItemIndex(d3.select(this));
				if (curIndex>parentIndex) {
					beforeIndex=Math.min(curIndex,beforeIndex);
				}
			});

			if (beforeIndex === 10000) {
				$detailGroup = $container.append('g');
			} else {
				$detailGroup = $container.insert('g', '.detailGroup.item'+beforeIndex+'.'+layer );
			}

			//debugger;
			$detailGroup.attr('class', 'item' + parentIndex)
				.classed('detailGroup', true)
				.classed(layer, true)
				.attr('transform', function(d,i){

					return "translate(" +detailGroupX + ","  + detailGroupY + ")";
				});

			$balls=drawValueBall.apply($detailGroup, [radius/2, values])
						.classed(layer, true)
						.attr('transform', function(dat, ind){

									var newY = Math.round(ind * radius * params.labelDistanceKoef);
									var newX = 0;
									return "translate(" + newX + "," + newY + ")";
								});

			addDetailLinesHorizontal.apply($balls, [radius, layer]);

			addDetailLinesVertical.apply($detailGroup, [radius, layer, values]);

			return $balls;
		}

		function checkNextSiblings($currentBall, diff, checkClass) {
			var ballX, ballY;
			var $newCurrentBall;
			//debugger;
			if ($currentBall.node().nextSibling !== null) {
				$newCurrentBall = d3.select($currentBall.node().nextSibling);

				if ($newCurrentBall.attr('class').indexOf(checkClass) > -1 ) {

					ballX = getTranslateX.call($newCurrentBall);
					ballY = getTranslateY.call($newCurrentBall);

					ballY = ballY + diff;

					$newCurrentBall.attr('transform', 'translate(' + ballX + ', ' + ballY + ')');

					checkNextSiblings($newCurrentBall, diff, checkClass);
				}
			}
		}

		function alignActiveBlock(parentIndex, index) {
			var diff, diff2;

			var $activeBallInDetail = $mainSVG.selectAll('.detailGroup.layer1.item'+parentIndex).selectAll('.ballGroup.active.item'+index);
			
			var ballX = getTranslateX.call($activeBallInDetail);
			var ballY = getTranslateY.call($activeBallInDetail);

			var prevY = ballY;

			var $aligningDetailBlock = $mainSVG.selectAll('.detailGroup.layer1.item'+parentIndex).selectAll('.detailGroup.layer2.item'+index);
			var aligningBlockHeight = $aligningDetailBlock.node().getBoundingClientRect().height;

			var alignObjX = getTranslateX.call($aligningDetailBlock);

			var alignObjY = ballY;

			//debugger;
			$aligningDetailBlock.attr('transform', 'translate(' + alignObjX + ',' + alignObjY +')');

			var nodesCnt = $aligningDetailBlock.selectAll('.ballGroup').nodes().length;
			var radius = circleDiametr/3;

			diff = (nodesCnt-2) * circleDiametr/3 * params.labelDistanceKoef /2;
			diff = diff > 0 ? diff : 0;
			ballY = Math.round(ballY  + diff);

			$activeBallInDetail.attr('transform', 'translate(' + ballX + ',' + ballY +')');

			if (diff > 0) {
				diff2 = diff + aligningBlockHeight/2 - circleDiametr/3 * 2 + circleDiametr/3*params.betweenGroupsKoef;

				checkNextSiblings($activeBallInDetail, diff2, 'ballGroup');
				checkNextSiblings($aligningDetailBlock, diff2, 'detailGroup');				
			}

		}

		function alignDetailBlock(parentIndex, index, nodesCnt, removedHeight) {

			var $currentBallGroup = $mainSVG.selectAll('.detailGroup.layer1.item'+parentIndex).selectAll('.ballGroup.item'+index);
			var heightWithoutDetail, diff, ballX, ballY, diff2;

			if ($currentBallGroup.attr('class').indexOf('active') > -1) {
				alignActiveBlock(parentIndex, index);
			} else {
				heightWithoutDetail = 2*circleDiametr/3 * params.labelDistanceKoef;
				diff = (nodesCnt-2) * circleDiametr/3 * params.labelDistanceKoef * 0.55;

				console.log('narrowing', diff, removedHeight);
				if (diff > 0) {
					ballX = getTranslateX.call($currentBallGroup);
					ballY = getTranslateY.call($currentBallGroup);

					ballY = ballY - diff;
					$currentBallGroup.attr('transform', 'translate(' + ballX + ', ' + ballY + ')');

					diff2 = diff + removedHeight/2 - circleDiametr/3 * 2 + circleDiametr/3*params.betweenGroupsKoef;

					checkNextSiblings($currentBallGroup, -diff2, 'ballGroup');
					checkNextSiblings($currentBallGroup, -diff2, 'detailGroup');
				}
			}

		}

		function detailBallGroupMouseOut() {
			var $element=d3.select(d3.event.target);

			var t = d3.transition()
				    .duration(200)
				    .ease(d3.easeLinear);

			//$element.selectAll('circle').transition().remove();
			var circleColor = $element.selectAll('circle').attr('data-color');

			$element.selectAll('.ball_value')
				.transition(t)
					.style('fill', circleColor)
					.attr('transform', 'translate(0, 0)');

			$element.selectAll('circle').transition(t)
					.style('stroke', circleColor);
		}

		function detailBallGroupMouseOver() {
			var $element=d3.select(d3.event.target);

			var t = d3.transition()
				    .duration(900)
				    .ease(d3.easeLinear);

			var circleColor = $element.selectAll('circle').attr('data-color');
			var darkerColor = d3.color(circleColor).darker(1);

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

		function createDetailsBlock(layer,d,i, arr, radius, parentIndex, $targetObject) {
			var yPos, detailGroupX, detailGroupY, radiusF;
			var $groups;

			if (layer === 'layer1') {
				detailGroupX = Math.round(i*(circleDiametr*3) + circleDiametr*params.labelDistanceKoef + params.margin);
				detailGroupY = 0;//Math.round(radius * 0.75);

				radiusF = circleDiametr/2;

			} else if (layer === 'layer2') {
				detailGroupX = Math.round(circleDiametr/2 + circleDiametr/5+circleDiametr*0.2-circleDiametr/6);
				detailGroupY = 0;
				radiusF = Math.round(circleDiametr/3);
			} else {
				return null;
			}
			//debugger;
			$groups  = drawDetailBlock.apply($targetObject, [detailGroupX, detailGroupY , radiusF, i, d.values, layer]);
			//debugger;
			if (layer === 'layer1') {
				$groups
					.style('cursor', function(data) {
						if (data.values !== undefined) {
							return 'pointer';
						} else {
							return 'default';
						}
					})
					.on("click", detailBallGroupClick)
					.on("mouseenter", detailBallGroupMouseOver)
					.on("mouseleave", detailBallGroupMouseOut);

			} else if (layer === 'layer2') {
				$mainSVG.selectAll('.detailGroup.layer1.item'+parentIndex).selectAll('.ballGroup.item'+i).selectAll('.rightLine.layer1').classed('hidden', true);
				alignDetailBlock(parentIndex, i);
				
				correctDetailLines.apply(d3.selectAll('.detailGroup.layer1.item'+parentIndex));
			}

			changeHeightSVG(defineDetailsHeight());
		}

		function detailBallGroupClick(d, i, arr) {
			var targetItem, $targetObject, parentIndex, $parentObj, $detailGroup, removedHeight, nodesCnt, timer;
			var evt=d3.event;

			evt.preventDefault();
			evt.stopPropagation();
			evt.stopImmediatePropagation();

			if (d.values !== undefined) {
				$targetObject = defineCorrectTarget(evt.target);

				targetItem = getItemIndex($targetObject);
				$parentObj = d3.select($targetObject.node().parentNode);

				if ($parentObj.attr('class') !== undefined) {
					parentIndex = getItemIndex($parentObj);
				}

				if ( $targetObject.attr('class').indexOf('active')===-1 ) {
					
					if (parentIndex !== undefined) {

						$targetObject.classed('active', true);
						lastActiveDetail = {parentIndex: parentIndex, index: i};

						createDetailsBlock('layer2', d,i, arr, circleDiametr/4, parentIndex, d3.select($targetObject.node().parentNode) );
					}
				} else {
					$targetObject.classed('active', false);
					//debugger;
					$detailGroup = $mainSVG.selectAll('.detailGroup.layer1.item'+parentIndex).selectAll('.detailGroup.layer2.item'+i);
					removedHeight = $detailGroup.node().getBoundingClientRect().height;
					nodesCnt = $detailGroup.selectAll('.ballGroup').nodes().length;
					$detailGroup.remove();

					$mainSVG.selectAll('.detailGroup.layer1.item'+parentIndex).selectAll('.ballGroup.layer1.item'+i).selectAll('.rightLine').classed('hidden', false);
					alignDetailBlock(parentIndex, i, nodesCnt, removedHeight);
					changeHeightSVG(defineDetailsHeight());					
				}
			}
		}

		function defineCorrectTarget(target) {
			var $targetObject = d3.select(target);

			if ($targetObject.attr('class').indexOf('ball_label_span') > -1) {
				$targetObject = d3.select(target.parentNode);				
			}

			if ($targetObject.attr('class').indexOf('ballGroup') > -1) {
				return $targetObject;
			} else {
				return d3.select($targetObject.node().parentNode);
			}
		}

		function bigBallGroupClick(d, i, arr){
			var targetItem, $targetObject;
			var evt=d3.event;

			evt.preventDefault();
			evt.stopPropagation();
			evt.stopImmediatePropagation();
			
			$targetObject = defineCorrectTarget(evt.target);		

			lastActiveDetail = {parentIndex: -1, index: i};
			targetItem = getItemIndex($targetObject);

			$chartDom.on('click')();
			var $resOj = $mainSVG.selectAll('.bubbleLine.layer1').selectAll('.ballGroup.item'+targetItem);

			if ( $resOj!==null) {

				if ($resOj.attr('class').indexOf('active')===-1 ) {
				
					$resOj.classed('active', true);

					$mainSVG.selectAll('.bubbleLine.layer1').selectAll('.ball_lines').selectAll('.ball_line.item'+targetItem).classed('hidden', true);

					createDetailsBlock('layer1', d,i, arr, circleDiametr/2, null, $mainSVG);
				} else {
					$resOj.classed('active', false);
					$mainSVG.selectAll('.detailGroup.layer1.item'+i).remove();
					$mainSVG.selectAll('.bubbleLine.layer1').selectAll('.ball_line.item'+i).classed('hidden', false);
					changeHeightSVG(defineDetailsHeight());
				}
			}
		}

		function drawMiddleLine() {
			var $bigBallsGroup = this;

			var $blGroups = $bigBallsGroup
							.append('g')
							.classed('ball_lines', true);	

			var $ballLines = $blGroups.selectAll('.ball_line')
						.data(d3.ticks(0,1, params.dataset.length-1) ).enter()
						.append('line')
							.attr('class', function(d,i) { return 'item'+i; })
							.classed('ball_line', true)
							.attr('transform', function(d, index){
											var newY = 0;
											var newX = Math.round(index*(circleDiametr*3) + bigRadius);
											return "translate(" + newX + "," + newY + ")";
										})
							.attr('x1', circleDiametr*0.3)
							.attr('x2', circleDiametr*1.7)
							.attr('y1', 0)
							.attr('y2', 0)
							.style('stroke', params.blackColor)
							.attr("marker-start", "url(#markerCircle)")
							.attr("marker-end", "url(#markerArrow)")
							.attr("stroke-dasharray", circleDiametr*1.4 + " " + circleDiametr*1.4)
						    .attr("stroke-dashoffset", circleDiametr*1.4);
							;

		$ballLines
			.transition()
			    .attr("stroke-dashoffset", 0);
		}

		function addBigBallsInLine(radius) {
			var $bigBallsGroup = this;
			var $balls = $bigBallsGroup
								.append('g')
								.classed('balls', true);
								
			drawValueBall.apply($balls, [radius, params.dataset])
								.attr('transform', function(d, i){
											var newY = 0;
											var newX = i*(circleDiametr*3);

											return "translate(" + newX + "," + newY + ")";
										})
								.on("click", bigBallGroupClick)
								.on("mouseenter", detailBallGroupMouseOver)
								.on("mouseleave", detailBallGroupMouseOut);

			drawMiddleLine.apply($bigBallsGroup);
		}

		function calcCircleDiametr() {
			var result=0;

			var hasLastValues = (params.dataset[params.dataset.length-1].values !== undefined);
			circleDiametr = Math.round((baseSVGWidth-2*params.margin)/(params.dataset.length + params.dataset.length * 2));
		}

		function createSVG(){
			$chartDom.selectAll("*").remove();	

			baseSVGWidth = $chartDom.nodes()[0].offsetWidth;
			calcCircleDiametr();
			
			bigRadius = Math.min(circleDiametr/2, 64);

			baseSVGHeight = Math.round(bigRadius*2 + bigRadius + bigRadius);

			$mainSVG = $chartDom
						.append('svg')
							.attr('id', params.id)
							.attr('height', baseSVGHeight)
							.attr('width', baseSVGWidth)
							.attr('xmlns', "http://www.w3.org/2000/svg")
							.attr('xmlns:xlink', "http://www.w3.org/1999/xlink")
							.attr('x',"0")
							.attr('y',"0")
							.attr('viewBox', '0 0 '+ baseSVGWidth + ' ' + baseSVGHeight);

			addMarkersDefinition.apply($mainSVG, [circleDiametr/2]);		
		}

		function addChart(){
			var $bigBallsGroup = $mainSVG
					    	.append('g')
					    		.classed('bubbleLine', true)
					    		.classed('layer1', true)
					    		.attr("transform", "translate(" + Math.round(circleDiametr/2 + params.margin) + "," + Math.round(circleDiametr*0.7) + ")");
			
			addBigBallsInLine.apply($bigBallsGroup, [bigRadius]);
			//$mainSVG.on("click", clickOnClearSVG);
		}

		function draw() {
			createSVG();

			addChart();

			return $chartDom;
		}

		function hideDetails() {
			$mainSVG.selectAll('.detailGroup').remove();
			changeHeightSVG(undefined, true);

			$mainSVG.selectAll('.bubbleLine.layer1').selectAll('.ballGroup').classed('active', false);
			$mainSVG.selectAll('.bubbleLine.layer1').selectAll('.ball_lines').selectAll('.ball_line').classed('hidden', false);

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
