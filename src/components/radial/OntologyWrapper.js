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
        text: ''
    };

    async componentDidMount() {
        const api_url = this.props.api_url;
        const radialapi = this.props.api_url + "/data/ontology_trees_old";
        let ids = "";
        let tree = "";
        if (this.props.location.search.split("ids=")[1])
            ids = this.props.location.search.split("ids=")[1].split("&")[0];
        if (this.props.location.search.split("tree=")[1])
            tree = this.props.location.search.split("tree=")[1].split("&")[0];

        if (tree !== "acm" && tree !== "pdc") {
            tree = "acm";
        }

        const radialresponse = await fetch(radialapi);
        let radialdata = await radialresponse.json();

        radialdata = radialdata.data[tree];

        let assignmentdata;
        let assignmentresponse;

        //@TODO FIXME ALL OF THIS
        if (false) {
            // comparison view is broken
            let assignmentresponse2;
            let assignmentdata2;
            assignmentresponse = await fetch(api_url + "/data/ontology_data_old?ids=" + ids[0]);
            assignmentdata = await assignmentresponse.json();
            assignmentresponse2 =  await fetch(api_url + "/data/ontology_data_old?ids=" + ids[1]);
            assignmentdata2 = await assignmentresponse2.json();
            this.setState({data: [radialdata, assignmentdata, assignmentdata2], loading: false})
        } else {
            assignmentresponse = await fetch(api_url + "/data/ontology_data_old?ids=" + ids);
            assignmentdata = await assignmentresponse.json();
            this.setState({data: [radialdata, assignmentdata], loading: false})
        }
    }

    render() {
        return (
            <div>
            <Analyze info={[]}/>
                {this.state.loading ? (
                    <div>loading...</div>
                ) : (
                    <div id={"RadialContainer"}>
                        <Radial data={this.state.data} width={this.state.width} height={this.state.height} />
                    </div>
                )}
            </div>
        );
    }
}

export default OntologyWrapper;
