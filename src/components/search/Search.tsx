import React, {FunctionComponent, useEffect} from "react";
import {RouteComponentProps} from "react-router";
import {createStyles, Paper, Theme, Grid, Button, TextField, Select, MenuItem, InputLabel} from "@material-ui/core";
import {TreeDialog} from "../forms/TreeDialog";
import {makeStyles} from "@material-ui/core/styles";
import {OntologyData, TagData} from "../../common/types"
import {Link} from "react-router-dom";
import {getJSONData} from "../../common/util";
import Autocomplete, {AutocompleteChangeReason} from "@material-ui/lab/Autocomplete";
import { ToggleButton, ToggleButtonGroup } from "@material-ui/lab";


const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            padding: theme.spacing(1, 1),
            margin: theme.spacing(1, 1),
        },
        margin: {
            margin: theme.spacing(1),
        },
        textField: {
            margin: theme.spacing(1),
            width: '70%',
        },
        textArea: {
            margin: theme.spacing(1),
            width: '80%',
        },
        select: {
          margin: theme.spacing(1),
          width: '30%',
      }
    }),
);

interface MatchParams {
    id: string;
}

interface Props extends RouteComponentProps<MatchParams> {
    api_url: string;
    redirect?: (new_location: string) => void;
    on_submit?: (keyword: string, tags: TagData[]) => void;
    init_keyword?: string;
    init_tags?: number[];
    currentSelected?: any[];
}


interface SearchEntity {
    keyword: string;
    selected_tags: TagData[];
    all_tags: TagData[];
    init_tags: number[];
    tags_fetched: boolean;
    show_acm: boolean;
    show_pdc: boolean;
    
}

const createInitialEntity = (keyword: string | undefined, init_tags: number[] | undefined ): SearchEntity => {
    return {
        keyword: keyword || '',
        selected_tags: [],
        all_tags: [],
        tags_fetched: false,
        show_acm: false,
        show_pdc: false,
        init_tags: init_tags || [],
    }
};

export const Search: FunctionComponent<Props> = (
    {
        history,
        location,
        match,
        api_url,
        redirect,
        currentSelected,
        on_submit,
        init_keyword,
        init_tags,

    }
) => {
    const classes = useStyles();

    const [searchInfo, setSearchInfo] = React.useState(
        createInitialEntity(init_keyword, init_tags)
    );

    

    if (!searchInfo.tags_fetched) {
        let url = api_url + "/data/meta_tags/compressed";

        const auth = {"Authorization": "bearer " + localStorage.getItem("access_token")};

        getJSONData(url, auth).then(resp => {
            if (resp === undefined) {
                console.log("API SERVER FAIL")
            } else {
                if (resp['status'] === "OK") {
                    const all_tags: TagData[] = resp['data'];
                    let selected_tags: TagData[] = [];
                    if (searchInfo.init_tags.length > 0) {
                        let tag_map: {[index: number]: TagData} = {};
                        all_tags.forEach(tag => {
                            tag_map[tag.id] = tag;
                        })
                        selected_tags = searchInfo.init_tags.map(index => tag_map[index]);
                    }

                    setSearchInfo({...searchInfo, tags_fetched: true, all_tags, selected_tags})
                }
            }
        });
    }
    const treeOpen = (tree: string) => {
        let info = searchInfo;
        if (tree === "acm_2013")
            info.show_acm = true;
        else if (tree === "pdc_2012")
            info.show_pdc = true;

        setSearchInfo({...searchInfo});
    };

    const treeClose = () => {
        setSearchInfo({...searchInfo, show_acm: false, show_pdc: false});
    };

    const onTreeCheckBoxClick = (event: React.ChangeEvent<HTMLInputElement>, node: OntologyData) => {
        let selected = searchInfo.selected_tags;
        if (event.target.checked)
            selected.push({id: node.id, title: node.title, type: "", bloom: ""});
        else {
            selected = selected.filter(e => e.id !== node.id);
        }

        let tags = selected;
        setSearchInfo({...searchInfo, selected_tags: tags});
    };

    const submit = (): void => {
        if (on_submit !== undefined) {
            on_submit(searchInfo.keyword, searchInfo.selected_tags);
        } else if (redirect !== undefined) {
          redirect(
            "/materials?keyword=" +
              searchInfo.keyword +
              "&selected_tags=" +
              searchInfo.selected_tags.map((e) => e.id)
          );
        }
    };


    
    

    const onTextFieldChange = (field_id: string) => (e: React.ChangeEvent<HTMLInputElement>): void => {
        let fields = searchInfo;
        fields = {...fields, [field_id]: e.currentTarget.value};
        setSearchInfo(fields)
    };

    const onTagFieldChange = (e: React.ChangeEvent<{}>, v: TagData[], reason: AutocompleteChangeReason): void => {
        //let union = [...new Set([...searchInfo.selected_tags, ...v])]
        setSearchInfo({...searchInfo, selected_tags: v})
    };

    let tags_fields;
    if (searchInfo.tags_fetched) {
       tags_fields =(
           <Grid item>
            <Autocomplete
                multiple
                disableClearable={false}
                options={searchInfo.all_tags}
                value={searchInfo.selected_tags}
                onChange={onTagFieldChange}
                getOptionLabel={option => {
                    if (option === undefined)
                        return "";

                    if (typeof option === "string")
                        return option;

                    if (option.title !== undefined)
                        return option.title;

                    return String(option);
                }}
                renderInput={params => (
                    <TextField
                        {...params}
                        variant="standard"
                        label={
                            "Tags"
                        }
                        margin="normal"
                        className={classes.textArea}
                        fullWidth
                    />
                )}
            />
        </Grid> );
    }


    return (
      <div className={classes.root}>
        
          <Grid container direction="column">
            <Grid item>
              <TextField
                label={"Keyword"}
                value={searchInfo.keyword}
                className={classes.textField}
                onChange={onTextFieldChange("keyword")}
                onKeyPress={(ev: React.KeyboardEvent<HTMLDivElement>) => {
                  if (ev.key === "Enter") {
                    ev.preventDefault();
                    ev.stopPropagation();
                    submit();
                  }
                }}
              />
            </Grid>

            {tags_fields}
            

            <Grid item>
              <Button
                className={classes.margin}
                variant="contained"
                color="primary"
                onClick={() => {
                  treeOpen("acm_2013");
                }}
              >
                ACM CSC 2013
              </Button>
              <Button
                className={classes.margin}
                variant="contained"
                color="primary"
                onClick={() => {
                  treeOpen("pdc_2012");
                }}
              >
                PDC 2012
              </Button>
            </Grid>
            <Grid item>
            
              {on_submit !== undefined ? (
                <Button
                  className={classes.margin}
                  variant="contained"
                  color="primary"
                  onClick={() => submit()}
                >
                  Search
                </Button>
              ) : (
                <Link
                  to={
                    "/materials?keyword=" +
                    searchInfo.keyword +
                    "&tags=" +
                    searchInfo.selected_tags.map((e) => e.id)
                  }
                >
                  <Button
                    className={classes.margin}
                    variant="contained"
                    color="primary"
                  >
                    Search
                  </Button>
                  
                </Link>
              )}
            </Grid>
            <Grid item>
             
          {/* <ToggleButtonGroup
          exclusive
          value = {similaritySelected}
          onChange={(
            event: React.MouseEvent<HTMLElement>,
            newSearchType: string
          ) => {
              setSimilaritySelected(newSearchType);
          }}

          >
          <ToggleButton value="search">
            Search
          </ToggleButton>
          <ToggleButton value="similarity">
            Similarity
          </ToggleButton>
         </ToggleButtonGroup>    */}
          
          
            </Grid>
          </Grid>
        
        <TreeDialog
          open={searchInfo.show_acm}
          title={"ACM CSC 2013"}
          onClose={treeClose}
          api_url={api_url}
          tree_name={"acm"}
          selected_tags={searchInfo.selected_tags}
          onCheck={onTreeCheckBoxClick}
        />
        <TreeDialog
          open={searchInfo.show_pdc}
          title={"PDC 2012"}
          onClose={treeClose}
          api_url={api_url}
          tree_name={"pdc"}
          selected_tags={searchInfo.selected_tags}
          onCheck={onTreeCheckBoxClick}
        />
        
      </div>
    );
};
