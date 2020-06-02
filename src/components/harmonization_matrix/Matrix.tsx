import React, {FunctionComponent, useEffect, useRef} from "react";
import * as d3 from "d3";
import {HarmonizationData, MappingData} from "./HarmonizationView";
import {svg} from "d3";


interface Props {
    data: HarmonizationData
    handleClick: (clicked: MappingData) => void;
}

export const Matrix: FunctionComponent<Props> = ({
    data,
    handleClick,
}) => {

    const ref = useRef(null);
    
    function gridOver(d: any, i: any) {
        d3.selectAll("rect").style("stroke-width", function (p: any) {
            return p.tag_index === d.tag_index || p.mat_index === d.mat_index ? "3px" : "1px"
        })
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
            .attr("transform", "translate(150,150)")
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
            .style("fill", function (d) {
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
            .style("fill-opacity", function (d) {return 1})
            .on("mouseover", gridOver)
            .on("click", function (d: MappingData) {
                handleClick(d);
            });

        // @ts-ignore
        svgElement.call(d3.zoom()
            .scaleExtent([-1, 20])
            .on("zoom", zoomed));

        // draw axi
        let mat_range = data.material_axis.map((ele, index) => index * 25 + 12.5);
        let name_scale = d3.scaleOrdinal().domain(data.material_axis.map(e => e.title)).range(mat_range);

        let tag_range = data.tag_axis.map((ele, index) => index * 25 + 12.5);
        let tag_scale = d3.scaleOrdinal().domain(data.tag_axis.map(e => e.title)).range(tag_range);

        //@ts-ignore
        let top_axis = d3.axisTop(name_scale);
        // @ts-ignore
        let left_axis = d3.axisLeft(tag_scale);

        d3.select("#adjacencyG").append("g").call(left_axis);
        d3.select("#adjacencyG").append("g")
            .call(top_axis)
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("transform", "translate(-10,-10) rotate(90)");
    });

    return (
        <svg ref={ref}/>
    )
};