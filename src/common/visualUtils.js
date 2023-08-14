import * as d3 from "d3";

let maxHits                   = 15;

function styleTreeNode(node, hitThresh){
      node.hits += 1;
      node.color = "orange";
      node.size = (node.hits/maxHits) * 100 + 10;
      if(node.assignments.length > 0) node.label = node.label.concat(node.assignments[node.assignments.length-1].fields.title, ' \n')
      if(node.hits < hitThresh[0] || node.hits > hitThresh[1]){
      	console.log(hitThresh)
      	node.color = "grey";
      }else{
      	node.color = "orange";
      }
    }

function styleParentNodePath(parent){
  while(parent !== null && parent !== undefined){
    parent.childhits += 1;
    parent.size = (parent.childhits/50)*5+10
    if(parent.color === "grey"){
      parent.color = "blue"
    }
    parent.hide = false
    for(let i = 0; i < parent.children.length; i++){
      parent.children[i].hide = false
    }
    parent = parent.parent;
  }
}

//given a tree, splice nodes from children that are marked as hidden
export function trimTree(tree){
  if(tree === null || tree === undefined){
    return
  }
  if(tree.children){
  	
    let spliced_children = [];
    for(let i = 0; i < tree.children.length; i++){
      if(tree.children[i].hide === true){
        spliced_children.push(tree.children[i].id)
      }
    }
    for(let i = 0; i < spliced_children.length; i++){
      tree.children.splice(tree.children.filter(x => x.id === spliced_children[i].id), 1);
    }
    if(tree.children){
      for(let i = 0; i < tree.children.length; i++){
        trimTree(tree.children[i])
      }
    }
  }else{
  	
    return
  }
}

//given a tree of ontology data, and assignments, build tree.
//root shape can be:
/*
  symbolCircle,
  symbolCross,
  symbolDiamond,
  symbolSquare,
  symbolStar,
  symbolTriangle,
  symbolWye 
*/
export function buildClassificationTree(root, parent, assignmentsArray, ontologyType, hitThresh){
      //init values of current node to defaults. If we have been to this node be
      if(root == undefined){return;}
      if(!root.hits) root.hits = 0;
      if(!root.color) root.color = "grey"
      if(!root.childhits) root.childhits = 0;
      if(!root.size) root.size = 10;
      if(!root.assignments) root.assignments = [];
      if(!root.shapeType) root.shapeType = d3.symbolWye;
      if(!root.label) root.label = "";
      root.parent = parent;
      if(!root.breadCrumbLabel){
        root.breadCrumbLabel = "";
        let current = root;
        while(current != null){
          root.breadCrumbLabel = root.breadCrumbLabel.concat(current.title, " \n")
          current = current.parent;
        }
      }
      if(root.hide === false){
        root.hide = false
      }else{
        root.hide = true
      }
      //if(!root.hide) root.hide = true;
      
      if(ontologyType == "acm"){
      	for(let j = 0; j < assignmentsArray.length; j++){
	        if(assignmentsArray[j].fields.classifications.includes("ACM-CS2013: " + root.title)){
	        	root.assignments.push(assignmentsArray[j])
	          styleTreeNode(root, hitThresh)
	        }
	      }
      }else{
      	for(let j = 0; j < assignmentsArray.length; j++){
	        if(assignmentsArray[j].fields.classifications.includes("PDC-2012: " + root.title)){
	          styleTreeNode(root, hitThresh)
	        }
	      }
      }
      
      if(root.hits > 0){
        styleParentNodePath(parent)
      }
      if(!root.children.length){
        return;
      }else{
        for(let i = 0; i < root.children.length; i++){
          buildClassificationTree(root.children[i], root, assignmentsArray, ontologyType, hitThresh)
        }
      }
}

function countVertices(tree){
  let count = 1;
  count = 1;
  for(let i = 0; i < tree.children.length; i++){
    let to = tree.children[i];
    count += countVertices(to)
  }
  return count;
}

//given a tree calculate radial positions and store in the locationX and locationY attributes
export function layoutRadialLayer(tree){
  let layers = 3;
  let layerDepth = 15;

  let howManyNodes = countVertices(tree);
  let anglePerVertex = 2*Math.PI/howManyNodes;
  let neededLength = howManyNodes * 15;
     neededLength /= layers;

	//depthOffset is the radius of the circle where all the nodes at a particular level are going to sit.
	//in other words, all node at depth D should sit between D*depthOffset and (D+1)*depthOffset
	let depthOffset = neededLength / Math.PI / 2 / layers;
	if (depthOffset < 1.01*layers*layerDepth)
	    depthOffset = 1.01*layers*layerDepth;


  function helper(tree, angleBegin, angleEnd, depth, layer){
    let angleCenter = (angleEnd - angleBegin)/ 2+angleBegin;
    let localRadius = depthOffset*depth + layer*layerDepth;
    let editNode = tree;
    editNode.locationX = localRadius * Math.cos(angleCenter);
    editNode.locationY = localRadius * Math.sin(angleCenter);

    let localCount = countVertices(tree) - 1;

    let neighboors = [];
    for(let i = 0; i < tree.children.length; i++){
      let to = tree.children[i];
      neighboors.push(to);
    }

    neighboors.sort();

    let baseAngle = angleBegin;
    let whichLayer = 0;
    for(let i = 0; i < neighboors.length; i++){
      let subCount = countVertices(neighboors[i]);

      let fraction = subCount/localCount;
      let allocatedAngle = fraction * (angleEnd-angleBegin);

      helper(neighboors[i], baseAngle, baseAngle+allocatedAngle, depth+1, whichLayer);

      baseAngle += allocatedAngle;
      whichLayer = (whichLayer + 1) % layers;
    }
  }
  helper(tree, 0, 2*Math.PI, 0, 0)
}

