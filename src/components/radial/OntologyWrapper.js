import React, {Component} from 'react';
import Radial from './Radial';
import {Analyze} from "../analyze/Analyze";



class OntologyWrapper extends Component{
    state = {
        data: {},
        assignment: {},
        loading: true,
        width: 700,
        height: 500,
        text: '',
        tags: "",
        radialdata: {data: {acm: {}, pdc: {}}},
        visual: "",
    };

    async componentDidMount() {
        const api_url = this.props.api_url;
        const radialapi = this.props.api_url + "/data/ontology_trees_old";

        let ids    = "";
        let tags   = "";
        var tree   = "";
        let oneids = "";
        let twoids = "";
        let compare = false;

        if(this.props.location.search.includes('listoneids')){
          compare = true;
          if (this.props.location.search.split("listoneids=")[1])
            oneids = this.props.location.search.split("listoneids=")[1].split("&")[0];
          if (this.props.location.search.split("listtwoids=")[1])
            twoids = this.props.location.search.split("listtwoids=")[1].split("&")[0];
        }else{
          if (this.props.location.search.split("ids=")[1])
              ids = this.props.location.search.split("ids=")[1].split("&")[0];
          if (this.props.location.search.split("tags=")[1])
              tags = this.props.location.search.split("tags=")[1].split("&")[0]
        }



        if (this.props.location.search.split("tree=")[1])
            tree = this.props.location.search.split("tree=")[1].split("&")[0];
            this.state.visual = tree

        if (tree !== "acm" && tree !== "pdc")
            tree = "acm";

        const radialresponse = await fetch(radialapi);
        let radialdata       = await radialresponse.json();
        this.state.radialdata = radialdata

        radialdata = radialdata.data[tree];

        let assignmentdata;
        let assignmentresponse;

        //@TODO FIXME ALL OF THIS
        if (compare) {
            // comparison view is broken
            let assignmentresponse2;
            let assignmentdata2;
            assignmentresponse = await fetch(api_url + "/data/ontology_data_old?ids=" + oneids.toString());
            assignmentdata = await assignmentresponse.json();
            assignmentresponse2 =  await fetch(api_url + "/data/ontology_data_old?ids=" + twoids.toString());
            assignmentdata2 = await assignmentresponse2.json();
            this.setState({data: [radialdata, assignmentdata, assignmentdata2], loading: false})
        } else {
            assignmentresponse = await fetch(api_url + "/data/ontology_data_old?ids=" + ids);
            assignmentdata = await assignmentresponse.json();
            this.setState({data: [radialdata, assignmentdata], loading: false, tags: tags})
        }
    }

    //oh my finally got this to work lol this looks funky but allows the user to switch back and forth from
    //acm and pdc radial views without re-selecting the materials or collections.
    //probably a better way of doing this because I had to go through the props.history.location to determine which page i am searching for.
    //also this calls render again because it doenst recall Radial automatically.
    shouldComponentUpdate(){
      console.log(this.props.history.location.search.split("tree=")[1].split("&")[0])
      this.state.data[0] = this.state.radialdata.data[this.props.history.location.search.split("tree=")[1].split("&")[0]]
      this.render()
      return true
    }

    render() {
        return (
            <div>
            {(this.props.location.search.split("tree=")[1].split("&")[0] === "acm")?
            <Analyze listOne={this.props.location.search.split("ids=")[1].split("&")[0]} user_id={this.props.user_id} currentLoc="radial" from="radial"/>
            :
            <Analyze listOne={this.props.location.search.split("ids=")[1].split("&")[0]} user_id={this.props.user_id} currentLoc="radialpdc" from="radial"/>
            }
                {this.state.loading ? (
                    <div>loading...</div>
                ) : (
                    <div id={"RadialContainer"}>
                        <Radial data={this.state.data} width={this.state.width} height={this.state.height} tags={this.state.tags}/>
                    </div>
                )}
            </div>
        );
    }
}

export default OntologyWrapper;
