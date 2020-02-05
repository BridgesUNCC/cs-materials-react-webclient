import React, {Component} from 'react';
import * as d3 from "d3";

class Matrix extends Component {
  state = {
    text:'hello'
  };

  componentDidMount() {
    this.svg = d3.select("body");
    this.drawMatrix();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    this.svg.selectAll("svg").remove();


    this.drawMatrix();
  }


  handleSubmit(){
    this.drawMatrix()
  }

  updateInputValue(evt){
    this.setState({
      text: evt.target.value
    })
  }

  drawMatrix(value){
    const data = this.props.data;
    var edgeHash = {}
    var materialList = []
    var materials = this.props.data.materials; //materials returned
    var tags = this.props.data.tags; // tags returned
    var matrix = [];
    var xAxisLabels = [];
    var yAxisLabels = [];
    var globalTagIDs = [];

    // iterate over each material and generate an edgehash with id of material and id of tag
    // to compare later for match and fill
    // the i iterator is the material number in the list, needs to change when getting certian materials
    for(let i =0; i < materials.length; i++){
      let mat = {title: materials[i].title};
      let tagsArray = [];
      xAxisLabels.push(materials[i].title)
      for(let j = 0; j < materials[i].tags.length; j++){
        tagsArray.push(materials[i].tags[j].id)
        var id = materials[i].title + "-" + materials[i].tags[j].id;
        edgeHash[id] = materials[i].title;
        if(!globalTagIDs.includes(materials[i].tags[j].id)){
          globalTagIDs.push(materials[i].tags[j].id)
          for(let k = 0; k < tags.length; k++){
            if(materials[i].tags[j].id === tags[k].id){
              yAxisLabels.push(tags[k].title)
            }
          }
        }
      }
      mat["tags"] = tagsArray;
      materialList.push(mat)
    }

    console.log(edgeHash)

    //iterate over each of the materials and topics to check if covered based on matching
    //ids from the edgeHash
    for(let i = 0; i < xAxisLabels.length; i++){
      for(let j = 0; j < globalTagIDs.length; j++){
        let grid = {id: xAxisLabels[i] + "-" + globalTagIDs[j], x: j, y: i, weight: 0, material: xAxisLabels[i], cellTag: globalTagIDs[j]}
        if(edgeHash[grid.id]){
          grid.weight = 1;
        }
        matrix.push(grid)
      }
    }

    console.log("matrix: ", matrix)

    this.svg = d3.select("body")
        .append("svg")
        .attr("width", 7000)
        .attr("height", 8000)
        .append("g")
        .attr("transform", "translate(150,150)")
        .attr("id", "adjacencyG")
        .selectAll("rect")
        .data(matrix)
        .enter()
        .append("rect")
        .attr("width", 25)
        .attr("height", 25)
        .attr("x", function (d) {return d.x * 25})
        .attr("y", function (d) {return d.y * 25})
        .style("stroke", "black")
        .style("stroke-width", "1px")
        .style("fill", function (d) {return (d.weight) === 1 ? "red" : "white"})
        .style("fill-opacity", function (d) {return 1})
        .on("mouseover", gridOver)

    var scaleSize = materials.length * 25;
    var xrangeArray = []
    for(let i = 0; i < xAxisLabels.length; i++){
      xrangeArray.push(i*25 + 12.5);
    }
    var nameScale = d3.scaleOrdinal().domain(xAxisLabels).range(xrangeArray);
    var yrangeArray = []
    for(let i = 0; i < yAxisLabels.length; i++){
      yrangeArray.push(i*25 + 12.5);
    }
    var tagScale = d3.scaleOrdinal().domain(yAxisLabels).range(yrangeArray);
    var xAxis = d3.axisTop().scale(tagScale)
    var yAxis = d3.axisLeft().scale(nameScale).ticks(25);
    d3.select("#adjacencyG").append("g").call(yAxis);
    d3.select("#adjacencyG").append("g").call(xAxis).selectAll("text").style("text-anchor", "end").attr("transform", "translate(-10,-10) rotate(90)");

    function gridOver(d,i) {
      d3.selectAll("rect").style("stroke-width", function (p) {return p.x === d.x || p.y === d.y ? "3px" : "1px"})
    }

    //do some actions when clicking on a cell
    this.svg.on("click", function(d, i) {
      var coords = d3.mouse(this)
      //checking if it is a already existing material tag in the matrix
      if(d3.select(this).style("fill") === "red" || d3.select(this).style("fill") === "blue"){
        d3.select(this).style("fill", "grey"); //make grey if exists
        //iterate through the material list, find material, iterate through tags, remove tag
        for(let i = 0; i < materials.length; i++){
          if(d.material === materials[i].title){
            for(let j = 0; j < materials[i].tags.length; j++){
              if(d.cellTag === materials[i].tags[j].id){
                materials[i].tags.splice(j,1);
              }
            }
          }
        }
      }else{ // if it doesnt exist in matrix
        d3.select(this).style("fill-opacity", 1)
        d3.select(this).style("fill","blue");
        //iterate through materials, if matches material cell, add material tag to tags
        for(let i = 0; i < materials.length; i++){
          if(d.material === materials[i].title){
            materials[i].tags.push({bloom: "none", id: d.cellTag})
          }
        }
      }
    })
  }



  render(){
    return (
        <div id="parent">
        </div>
    );
  }
}

export default Matrix;
