import React, {Component} from 'react';
import Radial from './Radial';
import RadialUpdate from './RadialUpdate'
import {Analyze} from "../analyze/Analyze";
import {getJSONData} from "../../common/util";
import {getOntologyTree} from "../../common/csmaterialsapiinterface";



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
            visual: "",
            temptags: "",
            dirty: false,

        };
    }

    async componentDidMount() {
        const api_url = this.props.api_url;
        const auth = {"Authorization": "bearer " + localStorage.getItem("access_token")};

        let ontologyTree = await getOntologyTree(this.props.tree, api_url);
        //radialdata = radialdata.data[tree];

        //@TODO FIXME ALL OF THIS
        // if (compare) {
        //     // comparison view is broken
        //     assignmentdata = await getJSONData(api_url + "/data/ontology_data_old?ids=" + oneids.toString(), auth);
        //     let assignmentdata2 = await getJSONData(api_url + "/data/ontology_data_old?ids=" + twoids.toString(), auth);
        //     this.setState({data: [radialdata, assignmentdata, assignmentdata2], loading: false})
        // } else {
        let assignmentdata = await getJSONData(api_url + "/data/ontology_data_old?ids=" + this.props.ids[0], auth);
        if(assignmentdata){
            this.setState({data: [ontologyTree, assignmentdata], loading: false, tags: this.props.tags, visual: this.props.tree})
        }
        // }
    }

    // allows user to switch between acm and pdc views with same data
    async componentDidUpdate(prevProps) {
        //checks to make sure that it only updates data if ids is present in the url
        if (prevProps && this.props.location.search !== prevProps.location.search && this.props.location.search.includes('ids')) {
            let data = this.state.data;
            data[0] = await getOntologyTree(this.props.tree, this.props.api_url);
            let vis = this.props.tree
            this.setState({...this.state, data, visual: this.props.tree});
        }
    }


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
                                    <RadialUpdate data={this.state.data} width={this.state.width} height={this.state.height} tags={this.state.tags} ontology_type={this.state.visual}/>
                                </div>
                            )
                    )
                }
            </div>
        );
    }
}

export default OntologyWrapper;
