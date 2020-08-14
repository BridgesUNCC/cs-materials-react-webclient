import React, {FunctionComponent, useEffect, useRef} from "react";
import * as d3 from "d3";
import {HarmonizationData, MappingData} from "./HarmonizationView";
import {svg} from "d3";

interface Props {
    data: HarmonizationData
    handleClick: (clicked: MappingData, transform: string) => void;
    transform: string
}


export const Matrix: FunctionComponent<Props> = ({
    data,
    handleClick,
    transform,
}) => {
    const ref = useRef(null);
    d3.select("#tooltipMatrix").classed("hidden", true);
    function gridOver(d: any, i: any) {
        d3.selectAll("rect").style("stroke-width", function (p: any) {
            return p.tag_index === d.tag_index || p.mat_index === d.mat_index ? "3px" : "1px"
        });
        d3.select("#tooltipMatrix").select('#value').append('p').append('tspan').text("Tag: " + data.tag_axis[d.tag_index].title);
        d3.select("#tooltipMatrix").select('#value').append('p').append('tspan').text("Material: " + data.material_axis[d.mat_index].title)
        console.log(i)
        d3.select("#tooltipMatrix").classed("hidden", false);
        // d3.selectAll("text").style("font-size", function (p: any) {
        //       return p === data.material_axis[d.mat_index].title ? 30 : 10
        // });
        d3.selectAll("text").style("font-size", function (p: any) {
              return p === data.tag_axis[d.tag_index].new_title ? 30 : 10
        });
    }

    function handleMouseOut(d: any, i: any) {
      d3.select("#tooltipMatrix").classed("hidden", true);
      d3.select("#assignmenttooltip").classed("hidden", true);
      // Select text by id and then remove
      d3.selectAll("tspan").remove();
    }

    function zoomed() {
        d3.select("g").attr("transform", d3.event.transform);
    }

    useEffect(() => {
        const svgElement = d3.select(ref.current);

        // cleanup old d3 generated stuff
        svgElement.selectAll("g").remove();

        // make matrix
        svgElement.attr("width", 5000)
            .attr("height", 5000)
            .append("g")
            // @ts-ignore
            .attr("transform", transform)
            .attr("id", "adjacencyG")
            .selectAll("rect")
            .data(data.mapping)
            .enter()
            .append("svg:rect")
            .attr("width", 25)
            .attr("height", 25)
            .attr("x", function (d: MappingData) {return d.mat_index * 25})
            .attr("y", function (d: MappingData) {return d.tag_index * 25})
            .style("stroke", "black")
            .style("stroke-width", "1px")
            .style("fill", function (d: MappingData) {
                switch (d.weight) {
                    case -0.5:
                        return "grey";
                    case 0:
                        return "white";
                    case 0.5:
                        return "red";
                    case 1:
                        return "blue";

                    // not sure what toggling a bicluster should look like
                    case 0.6:
                        return "yellow";
                    case -0.4:
                        return "orange";
                }

                return "black";
            })
            .style("fill-opacity", function () {return 1})
            .on("mouseover", gridOver)
            .on("mouseout", handleMouseOut)
            .on("click", function (d: MappingData) {
                // @ts-ignore
                let transform = d3.select("g").attr("transform");
                handleClick(d, transform);
            });


        // @ts-ignore
        svgElement.call(d3.zoom()
            .scaleExtent([-1, 20])
            .on("zoom", zoomed));

        // draw axi
        let mat_range = data.material_axis.map((ele, index) => index * 25 + 12.5);
        let name_scale = d3.scaleOrdinal().domain(data.material_axis.map(e => e.id.toString() + " " + e.title)).range(mat_range);

        for(let i = 0; i < data.tag_axis.length; i++){
          // data.tag_axis[i].new_title = ""
          data.tag_axis[i].new_title = data.tag_axis[i].title.substring(data.tag_axis[i].title.lastIndexOf(">") + 1);
          console.log(data.tag_axis[i].new_title)
        }

        let tag_range = data.tag_axis.map((ele, index) => index * 25 + 12.5);
        console.log(data.tag_axis)
        let tag_scale = d3.scaleOrdinal().domain(data.tag_axis.map(e => e.id.toString() + "> " + e.new_title)).range(tag_range);

        //@ts-ignore
        let top_axis = d3.axisTop(name_scale);
        // @ts-ignore
        let left_axis = d3.axisLeft(tag_scale);

        d3.select("#adjacencyG").append("g").call(left_axis);
        d3.select("#adjacencyG").append("g")
            .call(top_axis)
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("transform", "translate(-10,-10) rotate(90)")



    });

    return (
        <svg ref={ref}/>
    )
};
