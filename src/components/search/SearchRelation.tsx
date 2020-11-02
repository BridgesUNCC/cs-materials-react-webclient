import React, {FunctionComponent} from "react";
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
}

export const SearchRelation: FunctionComponent<ListProps> = ({   history,
                                                               location,
                                                               match,
                                                               api_url,
                                                               user_materials,
                                                               user_id,
                                                               user_data,
                                                           }) => {



    return (

    )
};
