/* eslint-disable */
import React, {FunctionComponent, useEffect, useRef} from "react";
import {Button, CircularProgress, createStyles, Paper, TextField, Theme} from "@material-ui/core";
import {RouteComponentProps} from "react-router";
import {getJSONData, parse_query_variable} from "../../common/util";
import {makeStyles} from "@material-ui/core/styles";


import * as d3 from "d3";
import { Opacity } from "@material-ui/icons";



interface Props {
    data: any
    names: any
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

export const SearchRelation: FunctionComponent<Props> = ({ data, names
                                                           }) => {

    const ref = useRef(null);
    const classes = useStyles();
    var start_x: any
    var start_y: any
    var max_opacity: any = 0;

    useEffect(() => {
      const svgElement = d3.select(ref.current);
      let container = d3.select('#parent')
      let svg = container.append('svg').append('g')
      let widthAmount = 1400; //I would really like for this to be taken from the width and height of the contained div
      let heightAmount = 2000;
      const g = container.select('svg').attr('width', widthAmount).attr('height', heightAmount)
          .select('g').attr('transform', 'translate(' + widthAmount / 2 + ',' + heightAmount / 3 + ')');

      let nodes: any[] = []
      let links: any[] = []

      if(data != undefined){
            const queryID = null;
            g.selectAll("*").remove(); //This prevents multiple graphs from stacking on top of each other
                                       //It just removes the old data when new data is provided (I THINK?)


	    let all_similarities : number[] = [];

      for(const key in data['2dembedding']){
        let nodeJSON = {
          'id': key,
          // 'name': data['result'][i].title,
          'x': data['2dembedding'][key][0],
          'y': data['2dembedding'][key][1],
          'color': "red",
          'size': 20
        }
        nodes.push(nodeJSON)
      }
      console.log(data['similarity'])
      for(const key in data['similarity']){
        for(const p in data['similarity'][key]){
          let linkJSON = {
          'id': key + "X" + p,
          'x1': data['2dembedding'][key][0]* 300,
          'y1': data['2dembedding'][key][1]* 300,
          'x2': data['2dembedding'][p][0]* 300,
          'y2': data['2dembedding'][p][1]* 300,
          'opacity': data['similarity'][key][p],
        }
        links.push(linkJSON)
        }

      }

        let link = g.append("g").attr("class", "links").selectAll("link").data(links)
                     .enter()
                     .append("line")
                     .attr("class", "link")
                     .attr("x1", function(l) {
                       return l.x1
                     })
                     .attr("x2", function(l) {
                       return l.x2
                     })
                     .attr("y1", function (d) {
                       return d.y1;
                     })
                     .attr("y2", function (d) {
                       return d.y2;
                     })
                     .attr("fill", "white")
                     .attr("stroke", function(d){
                         return "white"

                     })
                     .attr("opacity", function(d){
                       if(d.opacity < 0.2){
                         return 0.01
                       }else{
                         return d.opacity;
                       }

                     })
                     .style("stroke-width", 3);

        let node = g.append("g").attr("class", "nodes").selectAll("circle")
                    .data(nodes).enter()
                    .append('circle')
                    .attr('r', function(d){
                      return d.size
                    })
                    .attr("stroke", "black")
                    .attr("fill", function(d){
                      return d.color
                    })
                    .attr("transform", function (d) {
                      return "translate(" + ((d.x * 300)) + "," + ((d.y * 300)) + ")";
                    })
                    .on("mouseover", d => {
                      console.log();
                      d3.select("#tooltip")
                      .style('opacity', 1)
                      .select("#value")
                      .style("color", "black")
                      .style('opacity', 1)
                      .text(names[d.id]);
                      d3.select("#tooltips")

                    })
                    .on("mouseout", d => {
                      d3.select("#tooltip")
                      .style('opacity', 0)
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
      <div id="parent" className={classes.textField}>
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
