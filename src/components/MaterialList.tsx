import React, {FunctionComponent} from "react";
import {createStyles, makeStyles, Theme} from "@material-ui/core";
import {getJSONData} from "../util/util";
import LinearProgress from "@material-ui/core/LinearProgress";
import CircularProgress from "@material-ui/core/CircularProgress";


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
            else {
                if (resp['status'] === "OK") {
                    const data = resp['data'];
                    setListInfo({...listInfo, fetched: true, materials: data})
                }
            }
        })
    }

    // @TODO clean up visual style and add links/routes to material page
    let output;
    if (listInfo.materials !== null) {
        output = listInfo.materials.map((value) => {
            return (
                <li key={value.id}>
                    {value.title}
                </li>
            )
        });
    }


    return (
        <div>
            {
                listInfo.materials === null &&
                    <CircularProgress/>
            }
            <ul>
                {output}
            </ul>
        </div>
    )
};
