import React, {Component} from 'react';
import Radial from './Radial';

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }
const api = "https://cs-materials-api.herokuapp.com/data/joined";
const radialapi = "https://unfrozen-materials-cs.herokuapp.com/static/assignments/js/ACM.json"
const erik2214 = [139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151,
    152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164];
const jamie = [165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177];

class OntologyWrapper extends Component{
    state = {
        data: {},
        assignment: {},
        loading: true,
        width: 700,
        height: 500,
        text: ''
    }

    async componentDidMount(){
        const api_url = this.props.api_url;
        const ids = this.props.location.search.split("ids=")[1];

        const radialresponse = await fetch(radialapi);
        const radialdata = await radialresponse.json();

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
