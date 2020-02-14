import React, {Component} from 'react';
import * as d3 from "d3";


class Radial extends Component {
    componentDidMount() {
        this.svg = d3.select("#RadialContainer").append("svg").append("g");
        this.drawRadial();
    }

    drawRadial(value){
        var erikdata;

        console.log(Object.keys(this.props.data[0]))
        console.log(Object.values(this.props.data[0]))

        let data = Object.values(this.props.data[0]);
        let assignments = this.props.data[1];
        let assignmentsArray = assignments.assignments
        let authorSet = []
        for(let i = 1;  i <= this.props.data.length - 1; i ++){
            authorSet.push(this.props.data[i].authors.toString())
        }

        function unflatten(arr) {
            var tree = [],
                mappedArr = {},
                arrElem,
                mappedElem;

            // First map the nodes of the array to an object -> create a hash table.
            for(var i = 0, len = arr.length; i < len; i++) {
                arrElem = JSON.parse(JSON.stringify(arr[i]));
                mappedArr[arrElem.id] = arrElem;
                mappedArr[arrElem.id]['children'] = [];
            }


            for (var id in mappedArr) {
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

        const vWidth = 4000;
        const vHeight = 4000;
        let maxHits = 0;

        function parseClassification(assignmentArray){
            let classificationSet = []
            for(let i = 0; i < assignmentArray.length; i++){
                let assignmentName = assignmentArray[i].fields.title;
                let classificationArray = assignmentArray[i].fields.classifications;
                let classificationAuthor = assignmentArray[i].fields.authors.toString();
                for (let j = 0; j < classificationArray.length; j++){
                    let classificationString = classificationArray[j];
                    parseTree(classificationString, classificationSet, classificationAuthor)
                }
            }
            return classificationSet
        }

        let treeRoot = null;
        //find classification in the tree
        function parseTree(tag, set, author){
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
                        data[i].assignmentNames.push(tag)
                    }else{
                        data[i].assignmentNames.push(tag)
                    }
                    set.push(tag);
                    data[i].hits += 1;
                    maxHits = (data[i].hits > maxHits) ? data[i].hits : maxHits;
                }
            }
            return set
        }


        let mark = [];
        function buildClassificationTree(classSet){
            let classificationTree = []
            for(let i = 0; i < classSet.length; i++){
                let tempProp = {}
                tempProp["id"] = classSet[i];
                tempProp["visited"] = false;
                mark.push(tempProp)
            }
            classificationTree.push(JSON.parse(JSON.stringify(data[treeRoot])))
            classificationTree[0].color = "red";
            classificationTree[0].size = 50;
            let tempProp = {};
            tempProp["id"] = data[treeRoot].id;
            tempProp["visited"] = true;
            mark.push(tempProp)

            for(let i = 0; i < classSet.length; i++){
                let node = classSet[i];
                let vd_node = findInTree(node);
                classificationTree.push(vd_node)
                //mark the nodes from here to the root, to indicate the
                //path of the selected node to the root
                while(!mark[findMarked(node)].visited){
                    mark[findMarked(node)].visited = true;
                    vd_node = findInTree(node);
                    classificationTree[findInClassTree(node, classificationTree)].color = (vd_node.hits) ? "orange" : "blue"
                    classificationTree[findInClassTree(node, classificationTree)].size = vd_node.hits/maxHits * 40 + 10;
                    if(findMarked(vd_node.parent) == -1){
                        let tempProp = {};
                        let foundnode = findInTree(vd_node.parent)
                        tempProp["id"] = foundnode.id;
                        tempProp["visited"] = false;
                        mark.push(tempProp)
                    }
                    //change label here
                    if(!mark[findMarked(vd_node.parent)].visited){
                        let vd_parent = findInTree(vd_node.parent)
                        classificationTree.push(vd_parent);
                        node = vd_node.parent
                    }
                }
            }
            return JSON.parse(JSON.stringify(classificationTree))
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
            let childList = []
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
                let edges = findInTreeChildren(classTree[i].id)
                for(let j = 0; j < edges.length; j++){
                    if(findMarked(edges[j].id) == -1){
                        childVerts.push(edges[j])
                    }
                }
            }
            for(let i = 0; i < childVerts.length; i++){
                // console.log(childVerts)
                classTree.push(childVerts[i])
                classTree[findInClassTree(childVerts[i].id, classTree)].size = 10.0
                classTree[findInClassTree(childVerts[i].id, classTree)].color = "grey"
            }
            return classTree
        }

        // function compareClassifications(tree1, tree2){
        //   let maxHits1 = 0;
        //   let maxHits2 = 0;

        //   completeTree = [];
        //   completeTree.push(JSON.parse(JSON.stringify(data[treeRoot])))
        // }


        function scaleIntermediary(classTree){
            // hitmap = countHitPerLevelRec(classTree)
        }


        let erikClassificationSet = parseClassification(assignmentsArray)
        let erikClassificationTree = buildClassificationTree(erikClassificationSet)
        let newerikClassificationTree = addChildren(erikClassificationTree)
        console.log(newerikClassificationTree)
        let erikAddChildren = unflatten(newerikClassificationTree)
        console.log(erikAddChildren)

        // clearTree();
        mark = []
        if(this.props.data[2]){
            maxHits = 0;
            treeRoot = null;
            data = Object.values(this.props.data[0]);
            let jamieAssignments = this.props.data[2];
            let jamieAssignmentsArray = jamieAssignments.assignments
            let jamieClassificationSet = parseClassification(jamieAssignmentsArray)
            let jamieClassificationTree = buildClassificationTree(jamieClassificationSet)
            let newjamieClassificationTree = addChildren(jamieClassificationTree)
            var jamieAddChildren = unflatten(newjamieClassificationTree)
        }

        var tree = erikAddChildren;

        var g = d3.select("#RadialContainer").select('svg').attr('width', vWidth).attr('height', vHeight)
            .select('g').attr('transform', 'translate(' + vWidth/2 + ',' + vHeight/2 +')');

        var vLayout = d3.tree().size([2 * Math.PI, Math.min(vWidth*2, vHeight*2)]); // margin!

        // Layout + Data
        var vRoot = d3.hierarchy(tree[0]);
        var vNodes = vRoot.descendants();
        var vLinks = vLayout(vRoot).links();

        // Draw on screen curved links
        // g.selectAll('path').data(vLinks).enter().append('path')
        //     .attr('d', d3.linkRadial()
        //         .angle(function (d) { return d.x; })
        //         .radius(function (d) { return d.y; }));

        // straight links
        var link = g.selectAll(".link")
            .data(vLinks)
            .enter().append("line")
            .attr("class", "link")
            .attr("stroke","#ccc")
            .attr('stroke-width', "10px")
            .attr("x1", function(d) { return radialPoint(d.source.x,d.source.y)[0]; })
            .attr("y1", function(d) { return radialPoint(d.source.x,d.source.y)[1]; })
            .attr("x2", function(d) { return radialPoint(d.target.x,d.target.y)[0]; })
            .attr("y2", function(d) { return radialPoint(d.target.x,d.target.y)[1]; });

        g.selectAll('circle').data(vNodes).enter().append('circle')
            .attr('r', function (d) {return d.data.hits * 10 + 20})
            .attr("transform", function (d) { return "translate(" + d3.pointRadial(d.x, d.y) + ")"; })
            .style("fill", function (d) {return d.data.color})

        g.selectAll('text').data(vNodes).enter().append('text')
            .attr("dy", ".31em")
            .attr("x", 0)
            .style("text-anchor", function(d) { return d.x < 180 * (Math.PI/180) ? "start" : "end"; })
            .attr("transform", function (d) { return "translate(" + d3.pointRadial(d.x, d.y + 50) + ")"; })
            .text(function(d) { return d.data.id });

        d3.select("#RadialContainer").select("svg").call(d3.zoom()
            .scaleExtent([-1, 20])
            .on("zoom", zoomed));

        function zoomed() {
            console.log("zoom zoom");
            d3.select("g").attr("transform", d3.event.transform);
        }

        function radialPoint(x, y) {
            return [(y = +y) * Math.cos(x -= Math.PI / 2), y * Math.sin(x)];
        }

    }

    render(){
        return (
            <div id="parent">
                <div id={"App" + this.props.id}></div>
            </div>
        );
    }
}

export default Radial;
