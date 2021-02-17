import React, {Component} from 'react';
import Radial from './Radial';
import {Analyze} from "../analyze/Analyze";
import {getJSONData} from "../../common/util";



class OntologyWrapper extends Component{
    state = {
        data: {},
        assignment: {},
        loading: true,
        width: 700,
        height: 500,
        text: '',
        tags: "",
    };

    async componentDidMount() {
        const api_url = this.props.api_url;
        const auth = {"Authorization": "bearer " + localStorage.getItem("access_token")};
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

        if (tree !== "acm" && tree !== "pdc")
            tree = "acm";

        const radialresponse = await fetch(radialapi);
        let radialdata       = await radialresponse.json();

        radialdata = radialdata.data[tree];

        let assignmentdata;
        let assignmentresponse;

        //@TODO FIXME ALL OF THIS
        if (compare) {
            // comparison view is broken
            assignmentdata = await getJSONData(api_url + "/data/ontology_data_old?ids=" + oneids.toString(), auth);
            let assignmentdata2 = await getJSONData(api_url + "/data/ontology_data_old?ids=" + twoids.toString(), auth);
            this.setState({data: [radialdata, assignmentdata, assignmentdata2], loading: false})
        } else {
            assignmentdata= await getJSONData(api_url + "/data/ontology_data_old?ids=" + ids, auth);
            this.setState({data: [radialdata, assignmentdata], loading: false, tags: tags})
        }
    }

    render() {
        return (
            <div>
            {(this.props.location.search.split("tree=")[1].split("&")[0] === "acm")?
            <Analyze info={[]} user_id={this.props.user_id} currentLoc="radial" from="radial"/>
            :
            <Analyze info={[]} user_id={this.props.user_id} currentLoc="radialpdc" from="radial"/>
            }
                {this.state.loading ? (
                    <div>loading...</div>
                    ) :
                    ( this.state.data[1].assignments.length === 0 ?
                            <div>No results for that query</div>
                            :
                            (
                                <div id={"RadialContainer"}>
                                    <Radial data={this.state.data} width={this.state.width} height={this.state.height} tags={this.state.tags}/>
                                </div>
                            )
                    )
                }
            </div>
        );
    }
}

export default OntologyWrapper;
