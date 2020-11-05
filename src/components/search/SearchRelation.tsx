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
            margin: theme.spacing(1, 0),
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
      console.log("hello")
      const svgElement = d3.select(ref.current);
      let container = d3.select('#parent')
      let svg = container.append('svg').append('g')

      const g = container.select('svg').attr('width', 2000).attr('height', 1000)
          .select('g').attr('transform', 'translate(' + 2000 / 2 + ',' + 1000 / 2 + ')');

      if(data != undefined){
        let nodes: any[] = []
        let links: any[] = []
        let nodeJSON = {'id': 20,
                        'name': data['query'].query_matID.toString(),
                        'x': data['query'].mds_x,
                        'y': data['query'].mds_y,
                        'color': "blue",
                        'size': 20}
        nodes.push(nodeJSON)
        for(let i = 0; i < data['result'].length - 1; i++){
          //add this node to the list with its location data
          let nodeJSON = {'id': i,
                          'name': data['result'][i].title,
                          'x': data['result'][i].mds_x,
                          'y': data['result'][i].mds_y,
                          'color': "red",
                          'size': 10}
          let linkJSON = {"source": i,
                          "targert": 20,
                          "value": data['result'][i].query_similarity,
                          "x1": (data['result'][i].mds_x * 500),
                          "y1": (data['result'][i].mds_y * 500),
                          "x2": (data['query'].mds_x * 500),
                          "y2": (data['query'].mds_y * 500)}
          if(data['result'][i].query_similarity > max_opacity){
            max_opacity = data['result'][i].query_similarity
          }
          links.push(linkJSON)
          nodes.push(nodeJSON)
          for( let j = i+1; j < data['result'].length; j++){
            //add link for this node to the i node with their result_similarity
            let linkJSON = {"source": j,
                            "targert": i,
                            "value": data['result'][j].result_similarity[i],
                            "x1": (data['result'][j].mds_x * 500),
                            "y1": (data['result'][j].mds_y * 500),
                            "x2": (data['result'][i].mds_x * 500),
                            "y2": (data['result'][i].mds_y * 500)}
            if(data['result'][j].result_similarity[i] > max_opacity && data['result'][j].result_similarity[i] != 1){
              max_opacity = data['result'][j].result_similarity[i]
            }
            links.push(linkJSON)
          }
        }
        nodeJSON = {'id': data['result'].length - 1,
                    'name': data['result'][data['result'].length - 1].title,
                    'x': data['result'][data['result'].length - 1].mds_x,
                    'y': data['result'][data['result'].length - 1].mds_y,
                    'color': "red",
                    'size': 10}
        let linkJSON = {"source": data['result'].length - 1,
                        "targert": 20,
                        "value": data['result'][data['result'].length - 1].query_similarity,
                        "x1": (data['result'][data['result'].length - 1].mds_x * 500),
                        "y1": (data['result'][data['result'].length - 1].mds_y * 500),
                        "x2": (data['query'].mds_x * 500),
                        "y2": (data['query'].mds_y * 500)}
        if(data['result'][data['result'].length - 1].query_similarity > max_opacity){
          max_opacity = data['result'][data['result'].length - 1].query_similarity
        }
        nodes.push(nodeJSON)
        links.push(linkJSON)

        console.log(max_opacity)

        let link = g.append("g").selectAll("link").data(links)
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
                     .attr("fill", "none")
                     .attr("stroke", function(d){
                       if(d.value / max_opacity > 0.75){
                         return "white"
                       }else if(d.value / max_opacity < 0.75 || d.value / max_opacity > 0.5){
                         return "red"
                       }else{
                         return "black"
                       }
                     })
                     .style("opacity", function(d){
                       if(d.value / max_opacity > 0.75){
                         return d.value / max_opacity
                       }else if(d.value / max_opacity < 0.75 || d.value / max_opacity > 0.5){
                         return (d.value / max_opacity) - 0.25
                       }else{
                         return (d.value / max_opacity)
                       }
                       // return d.value / max_opacity
                       // return d.value
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
                      return "translate(" + ((d.x * 500)) + "," + ((d.y * 500)) + ")";
                    })
        let background = g.append('g').selectAll("rect")
          .data(nodes)
          .enter().append("rect")
          .attr("x", function(d){
            return d.x * 500 - 5
          })
          .attr("y", function(d){
            return d.y * 500 - 12
          })
          .attr("width", function(d){
            if(d.name.length <= 3){
              return 40
            } else{
              return d.name.length*8.5
            }
          })
          .attr("height", 15)
          .attr("fill", "white")
          .attr('opacity', 0.2)
          .attr('stroke', 'black');

        let text = g.append("g")
            .attr("class", "labels")
            .selectAll("text")
            .data(nodes)
            .enter().append("text")
            .attr("x", function(d){
              return d.x * 500
            })
            .attr("y", function(d){
              return d.y * 500
            })
            .attr('background-color', "white")
            .text(function(d) { return d.name })

          // let label = node.append('g').append("text")
          //                 .text(function(d) {
          //                   return d.name
          //                 })
          //                 .attr('x', 600)
          //                 .attr('y', 300);
          //
          //     node.append("title")
          //     .text(function(d){ return d.name;});

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
