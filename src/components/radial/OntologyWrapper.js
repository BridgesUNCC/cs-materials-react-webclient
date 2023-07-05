import React, {Component} from 'react';
import Radial from './Radial';
import RadialUpdate from './RadialUpdate'
import {Analyze} from "../analyze/Analyze";
import {getJSONData} from "../../common/util";



class OntologyWrapper extends Component {
    constructor() {
        super()
        this.state = {
            data: {},
            assignment: {},
            loading: true,
            width: 700,
            height: 500,
            text: '',
            tags: "",
            radialdata: {data: {acm: {}, pdc: {}}},
            visual: "",
            temptags: "",
            dirty: false,
        };
    }

    async componentDidMount() {
        const api_url = this.props.api_url;
        const auth = {"Authorization": "bearer " + localStorage.getItem("access_token")};
        const radialapi = this.props.api_url + "/data/ontology_trees";

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
        }else if (this.props.location.search.includes('ids')){
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

    // allows user to switch between acm and pdc views with same data
    componentDidUpdate(prevProps) {
        //checks to make sure that it only updates data if ids is present in the url
        if (prevProps && this.props.location.search !== prevProps.location.search && this.props.location.search.includes('ids')) {
            let data = this.state.data;
            data[0] = this.state.radialdata.data[this.props.history.location.search.split("tree=")[1].split("&")[0]]
            this.setState({...this.state, data});
        }
      }


    onTextFieldChange = (e)=> {
      console.log(e)
        let fields = this.state;
        fields.temptags = e.currentTarget.value;
        console.log(this.state)
    };

    // {(this.props.location.search.split("tree=")[1].split("&")[0] === "acm")?
    // <Analyze listOne={this.props.location.search.split("ids=")[1].split("&")[0]} user_id={this.props.user_id} currentLoc="radial" from="radial"/>
    // :
    // <Analyze listOne={this.props.location.search.split("ids=")[1].split("&")[0]} user_id={this.props.user_id} currentLoc="radialpdc" from="radial"/>
    // }
    render() {
        return (
            <div>

                {this.state.loading ? (
                    <div>loading...</div>
                    ) :
                    ( this.state.data[1].assignments.length === 0 ?
                            <div>No results for that query</div>
                            :
                            (
                                <div id={"RadialContainer"}>
                                    <RadialUpdate data={this.state.data} width={this.state.width} height={this.state.height} tags={this.state.tags}/>
                                </div>
                            )
                    )
                }
            </div>
        );
    }
}

export default OntologyWrapper;
