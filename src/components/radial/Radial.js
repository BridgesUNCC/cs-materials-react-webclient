// @TODO cleanup file to not require this disable
/* eslint-disable */

import React, {Component} from 'react';
import * as d3 from "d3";

class Radial extends Component {
  componentDidMount() {
    this.container = d3.select("#RadialContainer");
    this.svg = this.container.append("svg").append("g");
    this.drawRadial();
  }

  drawRadial(){

    let secondClassificationTree;
    let secondClassificationSet;
    console.log(Object.keys(this.props.data[0]));
    console.log(Object.values(this.props.data[0]));

    let data = Object.values(this.props.data[0]);
    let data2 = Object.values(this.props.data[0]);
    let assignments = this.props.data[1];
    let assignmentsArray = assignments.assignments;
    let view = this.props.view || this.props.data.length === 3 ? "compare" : "first";
    console.log(view);
    console.log(this.props.data.length);

    function unflatten(arr) {
      const tree = [],
          mappedArr = {};
      let arrElem,
          mappedElem;

      // First map the nodes of the array to an object -> create a hash table.
      let i = 0;
      const len = arr.length;
      for(; i < len; i++) {
        arrElem = JSON.parse(JSON.stringify(arr[i]));
        mappedArr[arrElem.id] = arrElem;
        mappedArr[arrElem.id]['children'] = [];
      }


      for (let id in mappedArr) {
        if (mappedArr.hasOwnProperty(id)) {
          mappedElem = mappedArr[id];
          // If the element is not at the root level, add it to its parent array of children.
          if (mappedElem.parent) {
            mappedArr[mappedElem['parent']]['children'].push(mappedElem);
            mappedElem = mappedArr[mappedElem.parent]
          }
          // If the element is at the root level, add it to first level elements array.
          else {
            tree.push(mappedElem);
          }
        }
      }
      return tree;
    }

    const vWidth = 2000;
    const vHeight = 1000;
    let maxHits = 15;

    function parseClassification(assignmentArray, whichTree){
      let classificationSet = [];
      for(let i = 0; i < assignmentArray.length; i++){
        let assignmentName = assignmentArray[i].fields.title;
        let classificationArray = assignmentArray[i].fields.classifications;
        let classificationAuthor = assignmentArray[i].fields.authors.toString();
        for (let j = 0; j < classificationArray.length; j++){
          let classificationString = classificationArray[j];
          parseTree(classificationString, classificationSet, classificationAuthor, assignmentName, whichTree)
        }
      }
      return classificationSet
    }

    let treeRoot = null;
    //find classification in the tree
    function parseTree(tag, set, author, name, whichTree){
      for(let i = 0; i < data.length; i++){
        if(!data[i].parent){
          treeRoot = i;
        }
        if(data[i].id === tag){
          if(!data[i].hasOwnProperty("authors")){
            data[i].authors = [];
            data[i].authors.push(author)
          }else{
            if(!data[i].authors.includes(author)){
              data[i].authors.push(author)
            }
          }
          if(!data[i].hasOwnProperty("assignmentNames")){
            data[i].assignmentNames = [];
            data[i].assignmentNames.push(name)
          }else{
            data[i].assignmentNames.push(name)
          }
          set.push(tag);
          data[i].hits += 1;
          maxHits = (data[i].hits > maxHits) ? data[i].hits : maxHits;
          if(whichTree === "1"){
            if(!data[i].hasOwnProperty("firstTreeHits")){
              data[i].firstTreeHits = 0;
            }
            data[i].firstTreeHits += 1;
          }else{
            if(!data[i].hasOwnProperty("secondTreeHits")){
              data[i].secondTreeHits = 0;
            }
            data[i].secondTreeHits += 1;
          }
        }
      }
      return set
    }

    function clearDataHits(){
      for(let i = 0; i < data.length; i++){
        data[i].hits = 0;
      }
    }


    function scaleIntermediary(tree, root){
      console.log(root)
      if(root.children <= 0){
        return root.hits
      }else{
        for(let i = 0; i < root.children.length; i++){
          if(!root.hasOwnProperty('childhits')){
            root.childhits = 0;
          }
          root.childhits += scaleIntermediary(tree, root.children[i])
        }
      }
      root.size = (root.childhits/50)*10+10
      if(root.id === tree[0].id){
        root.size = 30;
      }
      return root.childhits
    }


    let mark = [];
    function buildClassificationTree(classSet){
      let classificationTree = [];
      for(let i = 0; i < classSet.length; i++){
        let tempProp = {};
        tempProp["id"] = classSet[i];
        tempProp["visited"] = false;
        mark.push(tempProp)
      }
      classificationTree.push(data[treeRoot]);
      classificationTree[0].color = "red"; //root color
      classificationTree[0].size = 30; //root size
      let tempProp = {};
      tempProp["id"] = data[treeRoot].id;
      tempProp["visited"] = true;
      mark.push(tempProp);

      for(let i = 0; i < classSet.length; i++){
        let node = classSet[i];
        let vd_node = findInTree(node);
        classificationTree.push(vd_node);
        //mark the nodes from here to the root, to indicate the
        //path of the selected node to the root
        while(!mark[findMarked(node)].visited){
          mark[findMarked(node)].visited = true;
          vd_node = findInTree(node);
          classificationTree[findInClassTree(node, classificationTree)].color = (vd_node.hits) ? "orange" : "blue";
          classificationTree[findInClassTree(node, classificationTree)].size = (vd_node.hits/maxHits) * 10 + 10;
          (classificationTree[findInClassTree(node, classificationTree)].childhits) ? classificationTree[findInClassTree(node, classificationTree)].size = (vd_node.childhits/maxHits) * 10 + 10 : classificationTree[findInClassTree(node, classificationTree)].size = (vd_node.hits/maxHits) * 10 + 10
          if(findMarked(vd_node.parent) === -1){
            let tempProp = {};
            let foundnode = findInTree(vd_node.parent);
            tempProp["id"] = foundnode.id;
            tempProp["visited"] = false;
            mark.push(tempProp)
          }
          //change label here
          //change label here
          if(!mark[findMarked(vd_node.parent)].visited){
            let vd_parent = findInTree(vd_node.parent);
            classificationTree.push(vd_parent);
            node = vd_node.parent
          }
        }
      }
      return classificationTree
    }

    function findMarked(node){
      for(let i = 0; i < mark.length; i++){
        if(mark[i].id === node){
          return i
        }
      }
      return -1;
    }

    function findInClassTree(node, classTree){
      for(let i = 0; i < classTree.length; i++){
        if(classTree[i].id === node){
          return i;
        }
      }
    }

    function findInTree(node){
      for(let i = 0; i < data.length; i++){
        if(data[i].id === node){
          return data[i];
        }
      }
    }

    function findInTreeChildren(node){
      let childList = [];
      for(let i = 0; i < data.length; i++){
        if(data[i].parent === node){
          childList.push(data[i])
        }
      }
      return childList
    }

    function addChildren(classTree){
      let childVerts = [];
      for(let i = 0; i < classTree.length; i++){
        let edges = findInTreeChildren(classTree[i].id);
        for(let j = 0; j < edges.length; j++){
          if(findMarked(edges[j].id) === -1){
            childVerts.push(edges[j])
          }
        }
      }
      for(let i = 0; i < childVerts.length; i++){
        classTree.push(childVerts[i]);
        classTree[findInClassTree(childVerts[i].id, classTree)].size = 10.0;
        classTree[findInClassTree(childVerts[i].id, classTree)].color = "grey"
      }
      return classTree
    }

    function countVertices(tree, root){
      let count = 1;
      for(let i = 0; i < root.children.length; i++){
        let to = root.children[i];
        count += countVertices(tree,to)
      }
      return count;
    }

    function findNodeInClassTree(tree, node){
      let currNode = node;
      if(currNode.id === node.id){
        return currNode;
      }else{
        for(let i = 0; i < currNode.children.length; i++){
          findNodeInClassTree(tree, currNode)
        }
      }
    }

    function layoutRadialLayer(tree){
      let layers = 3;
      let layerDepth = 15;
      let root = tree[0];

      let howManyNodes = countVertices(tree,root);
      let anglePerVertex = 2*Math.PI/howManyNodes;
      let neededLength = howManyNodes * 15;
	neededLength /= layers;

	//depthOffset is the radius of the circle where all the nodes at a particular level are going to sit.
	//in other words, all node at depth D should sit between D*depthOffset and (D+1)*depthOffset
	let depthOffset = neededLength / Math.PI / 2 / layers;
	if (depthOffset < 1.01*layers*layerDepth)
	    depthOffset = 1.01*layers*layerDepth;

      function findNodeInClassTree(tree, node){
        let currNode = node;
        if(currNode.id === node.id){
          return currNode;
        }else{
          for(let i = 0; i < currNode.children.length; i++){
            findNodeInClassTree(tree, currNode)
          }
        }
      }

      function helper(tree, root, angleBegin, angleEnd, depth, layer){
        let angleCenter = (angleEnd - angleBegin)/ 2+angleBegin;
        let localRadius = depthOffset*depth + layer*layerDepth;
        let editNode = findNodeInClassTree(tree, root);
        editNode.locationX = localRadius * Math.cos(angleCenter);
        editNode.locationY = localRadius * Math.sin(angleCenter);

        let localCount = countVertices(tree, root) - 1;

        let neighboors = [];
        for(let i = 0; i < root.children.length; i++){
          let to = root.children[i];
          neighboors.push(to);
        }

        neighboors.sort();

        let baseAngle = angleBegin;
        let whichLayer = 0;
        for(let i = 0; i < neighboors.length; i++){
          let subCount = countVertices(tree, neighboors[i]);

          let fraction = subCount/localCount;
          let allocatedAngle = fraction * (angleEnd-angleBegin);

          helper(tree, neighboors[i], baseAngle, baseAngle+allocatedAngle, depth+1, whichLayer);

          baseAngle += allocatedAngle;
          whichLayer = (whichLayer + 1) % layers;
        }
      }
      helper(tree, root, 0, 2*Math.PI, 0, 0)
    }

    function compareClassificationsHelper(mark, node, comTree){
      while(!mark[findMarked(node)].visited){
        mark[findMarked(node)].visited = true;
        let vd_node = findInTree(node);
        if(!vd_node.hits){
          vd_node.color = "white"
        }
        comTree.push(vd_node);
        if(!mark[findMarked(vd_node.parent)].visited){
          let vd_parent = findInTree(vd_node.parent);
          comTree.push(vd_parent);
          node = vd_node.parent
        }
      }
    }


    function compareClassifications(tree1, tree2, data){
      let maxHits1 = 0;
      let maxHist2 = 0;
      let treeRoot = "";
      mark = [];
      console.log(tree1)
      for(let i = 0; i < tree1.length; i++){
        if(tree1[i].hits > 0){
          findInTree(tree1[i].id).cnt1 = tree1[i].hits;
        }
      }

      for(let i = 0; i < tree2.length; i++){
        if(tree2[i].hits > 0){
          findInTree(tree2[i].id).cnt2 = tree2[i].hits;
        }
      }

      let completeTree = [];
      for(let i = 0; i < data.length; i++){
        let tempProp = {};
        tempProp["id"] = data[i].id;
        tempProp["visited"] = false;
        mark.push(tempProp);
        if(!data[i].parent){
          treeRoot = data[i];
        }
      }

      mark[findMarked(treeRoot.id)].visited = true;
      completeTree.push(treeRoot);
      for (let i = 0; i < data.length; i++){
        if(data[i].hits > 0 && !mark[findMarked(data[i].id)].visited){
          compareClassificationsHelper(mark, data[i].id, completeTree);
        }
        if(data[i].firstTreeHits || data[i].secondTreeHits){
          if(data[i].firstTreeHits && data[i].secondTreeHits){
            // console.log(data[i])
            let total = data[i].firstTreeHits + data[i].secondTreeHits
            let redColor = data[i].firstTreeHits/total;
            let blueColor = data[i].secondTreeHits/total;
            console.log(blueColor, redColor)
            // if(redColor > blueColor){
            //   completeTree[findInClassTree(data[i].id, completeTree)].color = redColor
            // }else{
            //   completeTree[findInClassTree(data[i].id, completeTree)].color = blueColor
            //   console.log("here")
            // }
            completeTree[findInClassTree(data[i].id, completeTree)].color = blueColor
          }
          if(data[i].firstTreeHits && !data[i].secondTreeHits){
            completeTree[findInClassTree(data[i].id, completeTree)].color = [200, 0, 0]
          }
          if(!data[i].firstTreeHits && data[i].secondTreeHits){
            completeTree[findInClassTree(data[i].id, completeTree)].color = [0, 0, 200]
          }
        }
      }

      return completeTree;
    }

    if (view === "compare"){
      let firstClassificationSet = parseClassification(assignmentsArray, "1");
      let firstClassificationTree = buildClassificationTree(firstClassificationSet);
      mark = [];
      if (this.props.data[2]){
        maxHits = 0;
        treeRoot = null;
        data = Object.values(this.props.data[0]);
        let secondAssignments = this.props.data[2];
        let secondAssignmentsArray = secondAssignments.assignments;
        secondClassificationSet = parseClassification(secondAssignmentsArray, "2");
        secondClassificationTree = buildClassificationTree(secondClassificationSet);
      }
      // let compareACMTree = Object.values(this.props.data[0]);
      let comparedTree = compareClassifications(firstClassificationTree, secondClassificationTree, data);
      comparedTree = unflatten(comparedTree);
      layoutRadialLayer(comparedTree);
      var tree = comparedTree;
    } else if (view === "first"){
      let firstClassificationSet = parseClassification(assignmentsArray, "1");
      let firstClassificationTree = buildClassificationTree(firstClassificationSet);
      let firstFlatClassificationTree = addChildren(firstClassificationTree);
      let firstUnflattenedClassificationTree = unflatten(firstFlatClassificationTree);
      scaleIntermediary(firstUnflattenedClassificationTree, firstUnflattenedClassificationTree[0])
      layoutRadialLayer(firstUnflattenedClassificationTree);
      var tree = firstUnflattenedClassificationTree
    } else if (view === "second"){
      mark = [];
      if(this.props.data[2]){
        maxHits = 0;
        treeRoot = null;
        data = Object.values(this.props.data[0]);
        let secondAssignments = this.props.data[2];
        let secondAssignmentsArray = secondAssignments.assignments;
        secondClassificationSet = parseClassification(secondAssignmentsArray, "2");
        secondClassificationTree = buildClassificationTree(secondClassificationSet);
      }
      let secondFlatClassificationTree = addChildren(secondClassificationTree);
      const secondUnflattenedClassificationTree = unflatten(secondFlatClassificationTree);
      layoutRadialLayer(secondUnflattenedClassificationTree);
      var tree = secondUnflattenedClassificationTree
    }

    const g = this.container.select('svg').attr('width', vWidth).attr('height', vHeight)
        .select('g').attr('transform', 'translate(' + vWidth / 2 + ',' + vHeight / 2 + ')');

    const vLayout = d3.tree().size([2 * Math.PI, Math.min(vWidth * 2, vHeight * 2)]); // margin!

    // Layout + Data
    const vRoot = d3.hierarchy(tree[0]);
    const vNodes = vRoot.descendants();
    const vLinks = vLayout(vRoot).links();

    // Draw on screen curved links
    // g.selectAll('path').data(vLinks).enter().append('path')
    //     .attr('d', d3.linkRadial()
    //         .angle(function (d) { return d.x; })
    //         .radius(function (d) { return d.y; }));

    // straight links
    const link = g.selectAll(".link")
        .data(vLinks)
        .enter().append("line")
        .attr("class", "link")
        .attr("stroke", "#ccc")
        .attr('stroke-width', "1px")
        .attr("x1", function (d) {
          return d.source.data.locationX;
        })
        .attr("y1", function (d) {
          return d.source.data.locationY;
        })
        .attr("x2", function (d) {
          return d.target.data.locationX;
        })
        .attr("y2", function (d) {
          return d.target.data.locationY;
        });

    g.selectAll('circle').data(vNodes).enter().append('circle')
        .attr('r', function (d) {return d.data.size - 5})
        .attr("transform", function (d) {return "translate(" + d.data.locationX + "," + d.data.locationY + ")"; })
        .style("fill-opacity", .75) // set the fill opacity
        .style("stroke", "black")
        .style("fill", function (d) {
          if(!d.data.firstTreeHits && !d.data.secondTreeHits || view === "first"){
            return d.data.color
          }else if(!d.data.firstTreeHits || !d.data.secondTreeHits){
            return d3.rgb(d.data.color[0], d.data.color[1], d.data.color[2])
          }else{
            let inter = d3.interpolate("red", "blue")
            return d3.rgb(inter(d.data.color))
          }
        })
        .on("mouseover", function(d){
          let currentNode = d.data;
          let breadcrumbs = [d.data.id];

          while(currentNode.parent){
            breadcrumbs.push(currentNode.parent);
            currentNode = findInTree(currentNode.parent)
          }

          let finalLabelString = "";
          for(let i = breadcrumbs.length - 1; i >= 0; i--){
            if(i === 0){
              finalLabelString += breadcrumbs[i].substring(breadcrumbs[i].lastIndexOf(":") + 1);
            }else{
              finalLabelString += breadcrumbs[i].substring(breadcrumbs[i].lastIndexOf(":") + 1) + " :: "
            }
          }

          d3.select("#tooltip")
              .attr("transform", "translate(" + d.data.locationX + "," + d.data.locationY + ")")
              .select("#value")
              .style("color", "black")
              .text(finalLabelString);

          if(d.data.assignmentNames){
            for (let i = 0; i < d.data.assignmentNames.length; i++){
              let text = "";
              (i === d.data.assignmentNames.length - 1) ? text = d.data.assignmentNames[i] : text = d.data.assignmentNames[i];
              d3.select("#assignmenttooltip")
                  .select("#value")
                  .append('p')
                  .append("tspan")
                  .attr("dy", 25)
                  .attr('x', 0)
                  .style("color", "black")
                  .text(text)

            }
          }


          d3.select("#tooltip").classed("hidden", false);
          d3.select("#assignmenttooltip").classed("hidden", false);

        })
        .on("mouseout", handleMouseOut);

    this.container.select("svg").call(d3.zoom()
        .scaleExtent([-1, 20])
        .on("zoom", zoomed));

    function zoomed() {
      d3.select("g").attr("transform", d3.event.transform.translate(vWidth / 2, vHeight / 2).scale(1));
    }

    function radialPoint(x, y) {
      return [(y = +y) * Math.cos(x -= Math.PI / 2), y * Math.sin(x)];
    }

    function handleMouseOut(d, i) {
      d3.select("#tooltip").classed("hidden", true);
      d3.select("#assignmenttooltip").classed("hidden", true);
      // Select text by id and then remove
      d3.select("text").remove();  // Remove text location
      d3.selectAll("tspan").remove();
    }

  }

  render(){
    return (
        <div id="parent">
          <div id={"App" + this.props.id}>
            <div id="tooltips">
              <div id="tooltip" class="hidden">
                <p><strong>Breadcrumbs: </strong></p>
                <p><span id="value">100</span></p>
              </div>
              <div id="assignmenttooltip" class="hidden">
                <p><b>Materials: </b></p>
                <p id="value"></p>
              </div>
            </div>
          </div>
        </div>
    );
  }
}

export default Radial;
