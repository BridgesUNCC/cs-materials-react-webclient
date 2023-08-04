/* eslint-disable */
import React, {FunctionComponent, useEffect, useRef} from "react";
import {Button, CircularProgress, createStyles, Paper, TextField, Theme} from "@material-ui/core";
import {RouteComponentProps} from "react-router";
import {getJSONData, parse_query_variable} from "../../common/util";
import {makeStyles} from "@material-ui/core/styles";


import * as d3 from "d3";
import { Opacity } from "@material-ui/icons";



interface Props {
    similarityData: any
    names: any
    ids: Array<Array<number>>
}

const useStyles = makeStyles((theme: Theme) =>
    createStyles ( {
        textField: {
            marginTop: '0%',
            height: 400,
            width: 400,
        },
        margin: {
            margin: theme.spacing(0, 0),
        },
        paper: {
          marginTop: '0%',
          marginBottom: '10%'
        },
    }));

/*
Displays a similarity graph. This is an inner component of SimilarityWrapper.

The component provides support to organize the materials in different sets that  are rendered with different visual attributes.

params:

similarityData: an object formated the way smartsearch returns similarity https://github.com/BridgesUNCC/CSmaterial-smart-search see /similarity route

ids: an Array<Array<number>> that indicates the different sets of materials to visualize. It is assumed that the material ids contained in that list are in similarityData

names: usable strings to use as display for each materials.
*/

export const SearchRelation: FunctionComponent<Props> = ({ similarityData, names, ids
                                                           }) => {

//    const ref = useRef(null);
      //var containerRef : any;
    const classes = useStyles();
    var start_x: any
    var start_y: any
    var max_opacity: any = 0;

    let containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
    //      const svgElement = d3.select(ref.current);
    //      let container = d3.select('#parent')
    
       
    let container = d3.select(containerRef.current);
      let svg = container.append('svg').append('g')
      let widthAmount = 1400; //I would really like for this to be taken from the width and height of the contained div
      let heightAmount = 2000;
      const g = container.select('svg').attr('width', widthAmount).attr('height', heightAmount)
          .select('g').attr('transform', 'translate(' + widthAmount / 2 + ',' + heightAmount / 3 + ')');

      let nodes: any[] = []
      let links: any[] = []

      if(similarityData != undefined){
            const queryID = null;
            g.selectAll("*").remove(); //This prevents multiple graphs from stacking on top of each other
                                       //It just removes the old data when new data is provided (I THINK?)


	    let all_similarities : number[] = [];
	    let category : Map<number, number> = new Map();
	    ids.forEach(function(item, index) {
	      item.forEach(function(mat, index2) {
	        category.set(mat, index);
	      });
	    });

	  let colors = ["red", "blue", "green", "yellow", "white", "black", "purple", "pink", "cyan" ];

      for(const key in similarityData['2dembedding']){
        let nodeJSON = {
          'id': key,
          // 'name': data['result'][i].title,
          'x': similarityData['2dembedding'][key][0],
          'y': similarityData['2dembedding'][key][1],
//          'color': "red",
          'color': colors[category.get(Number(key) ) || 0 ] || "red",
          'size': 20
        }
        nodes.push(nodeJSON)
      }
     // console.log(similarityData['similarity'])
      for(const key in similarityData['similarity']){
        for(const p in similarityData['similarity'][key]){
          let linkJSON = {
          'id': key + "X" + p,
          'x1': similarityData['2dembedding'][key][0]* 300,
          'y1': similarityData['2dembedding'][key][1]* 300,
          'x2': similarityData['2dembedding'][p][0]* 300,
          'y2': similarityData['2dembedding'][p][1]* 300,
          'opacity': similarityData['similarity'][key][p],
        }
        links.push(linkJSON)
        }

      }

        let link = g.append("g").attr("class", "links").selectAll("link").data(links)
                     .enter()
                     .append("line")
                     .attr("class", "link")
                     .attr("x1", function(l:any) {
                       return l.x1
                     })
                     .attr("x2", function(l:any) {
                       return l.x2
                     })
                     .attr("y1", function (d:any) {
                       return d.y1;
                     })
                     .attr("y2", function (d:any) {
                       return d.y2;
                     })
                     .attr("fill", "white")
                     .attr("stroke", function(d:any){
                         return "white"

                     })
                     .attr("opacity", function(d:any){
                       if(d.opacity < 0.2){
                         return 0.01
                       }else{
                         return d.opacity;
                       }

                     })
                     .style("stroke-width", 0.5);

        let node = g.append("g").attr("class", "nodes").selectAll("circle")
                    .data(nodes).enter()
                    .append('circle')
                    .attr('r', function(d:any){
                      return d.size
                    })
                    .attr("stroke", "black")
                    .attr("fill", function(d:any){
                      return d.color
                    })
                    .attr("transform", function (d:any) {
                      return "translate(" + ((d.x * 300)) + "," + ((d.y * 300)) + ")";
                    })
                    .on("mouseover", (d:any) => {
			//console.log();
                      d3.select("#tooltip")
                      .style('opacity', 1)
                      .select("#value")
                      .style("color", "black")
                      .style('opacity', 1)
                      .text(names[d.id]);
                      d3.select("#tooltips")

                    })
                    .on("mouseout", (d:any) => {
                      d3.select("#tooltip")
                      .style('opacity', 0)
                    })

	let textlabels =  g.append("g").attr("class", "nodes").selectAll("circle")
                    .data(nodes).enter()
                    .append('text')
		    .text((d:any)=> names[d.id])
                    .attr("fill", "orange")
                    .attr("transform", function (d:any) {
                      return "translate(" + ((d.x * 300+15)) + "," + ((d.y * 300+15)) + ")";
                    })


        }

        //uhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh | this part right here is so stupid and still dont understand it
        //                                      V took 3000 hours to find solution
        container.select('svg').call(d3.zoom<any, any>()
            .scaleExtent([-1, 20])
            .on("zoom", zoomed));

        function zoomed() {
          d3.select("g").attr("transform", d3.event.transform.translate(widthAmount / 2, heightAmount / 2).scale(1));
        }
    });



    return (
      <div id="parent" className={classes.textField} ref={containerRef}>
        <div>
            <div id="tooltips">
              {/* For some reason sometimes its about 50 pixels off from the top even if I'm not messing with the size of the window */}
              <div id="tooltip"  style={{'opacity': 0}}>
                <p><strong>Material: </strong></p>
                <p><span id="value"></span></p>
              </div>
            </div>
          </div>
      </div>

    )
};
