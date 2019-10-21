import React, {FunctionComponent} from "react";
import {createStyles, makeStyles, Theme} from "@material-ui/core";
import {getJSONData} from "../util/util";


const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        container: {
            display: 'flex',
            flexWrap: 'wrap',
        },
        textField: {
            margin: theme.spacing(2),
            width: 200,
        },
        dense: {
            marginTop: 19,
        },
        menu: {
            width: 200,
        },
    }),
);


interface MaterialEntry {
    title: string;
    id: number;
}


interface ListEntity {
    materials: MaterialEntry[] | null;
    fetched: boolean;
}

const createEmptyEntity = (): ListEntity => {
    return {
        materials: null,
        fetched: false,
    }
};

interface ListProps {
    apiURL: string;
}

export const MaterialList: FunctionComponent<ListProps> = ({apiURL}) => {

    const classes = useStyles();
    const [listInfo, setListInfo] = React.useState<ListEntity>(
        createEmptyEntity()
    );

    if (!listInfo.fetched) {
        setListInfo({...listInfo, fetched: true});

        const url = apiURL + "/data/list/materials";

        getJSONData(url).then(resp => {
            console.log(resp);
            if (resp === undefined) {
                console.log("API SERVER FAIL")
            }

            if (resp['status'] === "OK") {

            }
        })
    }


    return (
        <div>
            Foo Bar





            Fizz




            Buzz

        </div>
    )
};
