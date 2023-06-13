import React, {FunctionComponent} from "react";
import {MaterialListComparison} from "./comparison/MaterialListComparison";
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

    return (
      <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <MaterialListComparison history={history} location={location} match={match} api_url={api_url} user_id={user_id} user_data={user_data} from={"listOne"} selectedListCallback={selectedListOne} idlist={listOne} currentSelected={listOne}/>
      </Grid>
      <Grid item xs={12} md={6}>
        <MaterialListComparison history={history} location={location} match={match} api_url={api_url} user_id={user_id} user_data={user_data} from={"listTwo"} selectedListCallback={selectedListTwo} idlist={listTwo} currentSelected={listTwo}/>
      </Grid>
    </Grid>
    )
};
