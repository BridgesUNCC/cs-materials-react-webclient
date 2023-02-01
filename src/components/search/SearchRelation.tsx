/* eslint-disable */
import React, {FunctionComponent, useEffect, useRef} from "react";
import {Button, CircularProgress, createStyles, Paper, TextField, Theme} from "@material-ui/core";
import {RouteComponentProps} from "react-router";
import {getJSONData, parse_query_variable} from "../../common/util";
import {makeStyles} from "@material-ui/core/styles";


import * as d3 from "d3";



interface Props {
    data: any
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

export const SearchRelation: FunctionComponent<Props> = ({ data,
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
      let widthAmount = 940; //I would really like for this to be taken from the width and height of the contained div
      let heightAmount = 970;
      const g = container.select('svg').attr('width', widthAmount).attr('height', heightAmount)
          .select('g').attr('transform', 'translate(' + widthAmount / 2 + ',' + heightAmount / 3 + ')');

      console.log(data)
      let nodes: any[] = []
      let links: any[] = []

      if(data != undefined){
            const queryID = null;
            g.selectAll("*").remove(); //This prevents multiple graphs from stacking on top of each other
                                       //It just removes the old data when new data is provided (I THINK?)

	    console.log("something"+queryID);
 
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
                       console.log(l)
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
                       return d.opacity;
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
                      console.log(d)
                      return "translate(" + ((d.x * 300)) + "," + ((d.y * 300)) + ")";
                    })

        }

        //uhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh | this part right here is so stupid and still dont understand it
        //                                      V took 3000 hours to find solution
        container.select('svg').call(d3.zoom<any, any>()
            .scaleExtent([-1, 20])
            .on("zoom", zoomed));

        function zoomed() {
          d3.select("g").attr("transform", d3.event.transform.translate(2000 / 2, 1000 / 2).scale(1));
        }
    });



    return (
      <div id="parent" className={classes.textField}>
      </div>
    )
};
