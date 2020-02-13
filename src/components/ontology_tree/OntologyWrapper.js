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
const radialapi = "http://unfrozen-materials-cs.herokuapp.com/static/assignments/js/ACM.json"
const assginmentapi = "http://unfrozen-materials-cs.herokuapp.com/data/?assignments="
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
    // const response = await fetch(api);
    // const data = await response.json();
    // this.setState({data: data, loading: false})

    const radialresponse = await fetch(radialapi)
    const radialdata = await radialresponse.json();

    const assignmentresponse = await fetch("http://unfrozen-materials-cs.herokuapp.com/data/?assignments=" + erik2214.toString());
    const assignmentdata = await assignmentresponse.json();

    const jamieresponse = await fetch("http://unfrozen-materials-cs.herokuapp.com/data/?assignments=" + jamie.toString());
    const jamiedata = await jamieresponse.json();
    this.setState({data: [radialdata, assignmentdata, jamiedata], loading: false})
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
