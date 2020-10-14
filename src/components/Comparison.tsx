import React, {FunctionComponent} from "react";
import {MaterialListOne} from "./comparison/MaterialListOne";
import {MaterialListTwo} from "./comparison/MaterialListTwo";
import {Grid} from "@material-ui/core";
import {RouteComponentProps} from "react-router";
import {Analyze} from "./analyze/Analyze";

interface MatchParams {
    id: string;
}

interface ListProps extends RouteComponentProps<MatchParams> {
    api_url: string;
    user_materials?: number[];
    user_id: any;
    user_data: any;
}

export const Comparison: FunctionComponent<ListProps> = ({   history,
                                                               location,
                                                               match,
                                                               api_url,
                                                               user_materials,
                                                               user_id,
                                                               user_data,
                                                           }) => {

    let listOne: number[] = [];
    let listTwo: number[] = [];

    // lol this actually works for call back values from child component
    const getList = (list: any, from: string) => {
      if(from === "listOne"){
        listOne = list
        console.log(list, from);
      }
      if(from === "listTwo"){
        listTwo = list
        console.log(list, from);
      }
    }

    // let analyze = <Analyze listOne={listOne} listTwo={listTwo} user_id={user_id} user_data={user_data}
    //                          currentLoc="compare" from="listOne"/>;

    return (
      <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <MaterialListOne history={history} location={location} match={match} api_url={api_url} user_id={user_id} user_data={user_data} from={"listOne"} onGetList={getList} listTwo={listTwo}/>
      </Grid>
      <Grid item xs={12} md={6}>
        <MaterialListTwo history={history} location={location} match={match} api_url={api_url} user_id={user_id} user_data={user_data} from={"listTwo"} onGetList={getList} listOne={listOne}/>
      </Grid>
    </Grid>
    )
};
