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
        const user_id = this.props.user_id
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

        const erik2214 = [121,123,124,131,132,135,136,137,139,140,141,142,143,144,145,146,148,157,158,159,160,161,162,163,164,165];
        const erik2214_lecture = [123, 124,131,132,135,136,137,139,140,141,142,143,145,146,148]
        const erik2214_assessment = [121, 144, 157, 158, 162, 163, 165]

        const kr2214 = [21,118,119,120,122,125,126,127,128,129,130,133,154,155,156,171,172,173,174]

        const erik3145 = [66,67,87,99, 100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116]
        const erik3145_lecture = [66,67,100,101,102,103,104,105,112,113,114,115]
        const erik3145_assignment = [99, 106, 107, 108, 109, 110, 111, 116]

        const jamie = [134, 138, 147,149,150,151,152,153,166,167,168,169,170];

        //@TODO FIXME ALL OF THIS
        if (false) {
            // comparison view is broken
            let assignmentresponse2;
            let assignmentdata2;
            assignmentresponse = await fetch(api_url + "/data/ontology_data_old?ids=" + erik2214.toString());
            assignmentdata = await assignmentresponse.json();
            assignmentresponse2 =  await fetch(api_url + "/data/ontology_data_old?ids=" + jamie.toString());
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
            <Analyze info={[]} user_id={this.props.user_id} currentLoc="radial"/>
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
