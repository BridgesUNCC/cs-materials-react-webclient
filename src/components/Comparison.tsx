import React, {FunctionComponent} from "react";
import {MaterialListOne} from "./comparison/MaterialListOne";
import {MaterialListTwo} from "./comparison/MaterialListTwo";
import {Grid} from "@material-ui/core";
import {RouteComponentProps} from "react-router";

interface MatchParams {
    id: string;
}

interface ListProps extends RouteComponentProps<MatchParams> {
    api_url: string;
    user_materials?: number[];
    user_id: any;
    user_data: any;
    //calback functions to modify the state of the two list of material ids for
    //radial comparison view
    listOneCallBack?(event: boolean, newElement:any):any;
    listTwoCallBack?(event: boolean, newElement:any):any;
    listOne: number[];
    listTwo: number[];
}

export const Comparison: FunctionComponent<ListProps> = ({   history,
                                                               location,
                                                               match,
                                                               api_url,
                                                               user_materials,
                                                               user_id,
                                                               user_data,
                                                               listOneCallBack,
                                                               listTwoCallBack,
                                                               listOne,
                                                               listTwo
                                                           }) => {



    // lol this actually works for call back values from child component
    // const getList = (list: any, from: string) => {
    //   if(from === "listOne"){
    //     listOne = list
    //     console.log(list, from);
    //   }
    //   if(from === "listTwo"){
    //     listTwo = list
    //     console.log(list, from);
    //   }
    // }

    const selectedListOne=(event: boolean, element: any) => {
      if(listOneCallBack !== undefined){
        listOneCallBack(event, element);
      }
    }

    const selectedListTwo = (event: boolean, element: any) => {
      if(listTwoCallBack !== undefined){
        listTwoCallBack(event, element)
      }
    }

    // let analyze = <Analyze listOne={listOne} listTwo={listTwo} user_id={user_id} user_data={user_data}
    //                          currentLoc="compare" from="listOne"/>;

    return (
      <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <MaterialListOne history={history} location={location} match={match} api_url={api_url} user_id={user_id} user_data={user_data} from={"listOne"} selectedListOne={selectedListOne} listOne={listOne}/>
      </Grid>
      <Grid item xs={12} md={6}>
        <MaterialListTwo history={history} location={location} match={match} api_url={api_url} user_id={user_id} user_data={user_data} from={"listTwo"} selectedListTwo={selectedListTwo} listTwo={listTwo}/>
      </Grid>
    </Grid>
    )
};
