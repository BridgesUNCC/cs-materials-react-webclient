import React, {FunctionComponent} from "react";
import {getJSONData, parse_query_variable} from "../common/util";
import CircularProgress from "@material-ui/core/CircularProgress";
import List from "@material-ui/core/List";
import {ListItemLink} from "./ListItemLink";
import {Checkbox, createStyles, Grid, Paper, Theme} from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Typography from "@material-ui/core/Typography";
import {RouteComponentProps} from "react-router";
import Button from "@material-ui/core/Button";
import {MaterialListEntry, TagData, MaterialListData} from "../common/types";
import {Analyze} from "./analyze/Analyze";
import CardMedia from '@material-ui/core/CardMedia';
import Pagination from '@material-ui/lab/Pagination';
import { Search } from "./search/Search";
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';




const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            padding: theme.spacing(3, 0, 0, 0),
            margin: theme.spacing(2, 0, 0, 0),
            align: 'center',
            marginLeft: 100,
            flexGrow:1,
        },
        paper: {
          padding: theme.spacing(0),
          margin: 'auto',
          maxWidth: 800,
        },
        image: {
          width: 128,
          height: 128,
        },
        img: {
          margin: 'auto',
          display: 'block',
          maxWidth: '100%',
          maxHeight: '100%',
        },
        titles:{
          align: 'center',
          marginLeft: 100,
        },
        description:{
          textAlign: 'left',
        },
        margin: {
            margin: theme.spacing(5),
        },
        paginator: {
          align: 'center',
          padding: "10px"
        }
    }),
);



interface ListEntity {
    materials: MaterialListEntry[] | null;
    selected_materials: number[]
    fetched: boolean;
    search: string;
    path: string;
    keyword?: string;
    tags?: string;
}

const createEmptyEntity = (path: string, selected_materials: number[] | undefined): ListEntity => {
    return {
        materials: null,
        selected_materials: selected_materials || (localStorage.getItem("checked_materials")?.split(",").map(e => Number(e)) || []),
        fetched: false,
        search: "N/A",
        path
    }
};

interface MatchParams {
    id: string;
}

interface ListProps extends RouteComponentProps<MatchParams> {
    api_url: string;
    user_materials?: number[];
    user_id: any;
    selected_materials?: number[];
    store_tags?: boolean;
    material_update?: (material_list: MaterialListData[]) => void;
    listOneCallBack?(event: boolean, newElement: any) : any;//calback function to main app for navbar element list state
}

export const MaterialList: FunctionComponent<ListProps> = ({   history,
                                                               location,
                                                               match,
                                                               api_url,
                                                               user_materials,
                                                               user_id,
                                                               selected_materials,
                                                               store_tags,
                                                               material_update,
                                                               listOneCallBack
                                                           }) => {
    const classes = useStyles();
    let path = location.pathname;
    let search = location.search;
    const itemsPerPage = 10;
    let noOfPages = 1 //default value

    const [listInfo, setListInfo] = React.useState<ListEntity>(
        createEmptyEntity(path, selected_materials)
    );

    const [page, setPage] = React.useState(1);
    const handleChange = (event: any, value: any) => {
      setPage(value);
    };

    //states and functions for handling number of items per page
    const [anchorEl, setAnchorEl] = React.useState(null);
    const handleClick = (event:any) => {
      setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
      setAnchorEl(null);
    };
    function handleSelect(value: number){
      // @ts-ignore
      noOfPages = Math.ceil(listInfo.materials.length / value)
    }

    let reload = path !== listInfo.path || search !== listInfo.search;
    let keyword = listInfo.keyword || parse_query_variable(location, "keyword");
    let tags = listInfo.tags || parse_query_variable(location, "tags");
    let init_tags = undefined;
    if (tags.length > 0) {
      init_tags = tags.split(",").map((s) => Number(s));
    }


    if (!listInfo.fetched || reload) {
      let ids = user_materials?.toString() || ""; //listInfo.selected_materials.toString();
      ids += parse_query_variable(location, "ids");
      let sim_mats = parse_query_variable(location, "sim_mats");
      let material_types = parse_query_variable(location, "material_types");

      const url =
        api_url +
        "/data/materials?ids=" +
        ids +
        "&tags=" +
        tags +
        "&sim_mats=" +
        sim_mats +
        "&keyword=" +
        keyword +
        "&material_types=" +
        material_types;

      // const url = api_url + "/data/materials?ids=" + ids + "&tags=" + tags
      // console.log(location)

      const auth = {
        Authorization: "bearer " + localStorage.getItem("access_token"),
      };

      // @TODO pass in auth token
      getJSONData(url, auth).then((resp) => {
        if (resp === undefined) {
          console.log("API SERVER FAIL");
        } else {
          if (resp["status"] === "OK") {
            if (listInfo.selected_materials.length > 0) {
              ids = listInfo.selected_materials.toString();
              // force fetch selected materials to always show
              const url = api_url + "/data/materials?ids=" + ids;
              getJSONData(url, auth).then((selected_mats_resp) => {
                let data: MaterialListEntry[] = resp["data"].materials;
                let selected_materials: MaterialListEntry[] =
                  selected_mats_resp["data"].materials;
                let selected_map: { [index: number]: boolean } = {};
                selected_materials.forEach((mat) => {
                  selected_map[mat.id] = true;
                });
                let other_materials = data.filter(
                  (mat) => !selected_map[mat.id]
                );

                let materials = [...selected_materials, ...other_materials];
                setPage(1);
                setListInfo({
                  ...listInfo,
                  fetched: true,
                  materials: materials,
                  search: search,
                  path,
                });
              });
            } else {
              let materials = resp["data"].materials;
              setPage(1);
              setListInfo({
                ...listInfo,
                fetched: true,
                materials: materials,
                search: search,
                path,
              });
            }
          }
        }
      });
    }

    // @Speed @TODO, smart cull entries so rendering doesn't take too long, maybe have a callback that renders more as
    // user scrolls down?
    let output;
    let count = 0;

    if (listInfo.materials !== null && !reload) {
        noOfPages = Math.ceil(listInfo.materials.length / itemsPerPage)
        output = listInfo.materials.slice((page - 1) * itemsPerPage, page * itemsPerPage).map((value, index) => {
            // @Hack @FIXME cull entries for speed
            // let image = require("../common/images/" + String(value.instance_of) + ".png")
            let image;
            if(value.hasOwnProperty('material_type')){
              image = require("../common/images/" + String(value.material_type) + ".png")
            } else{
              image = require("../common/images/assignment.png")
            }
            // let image = (value.hasOwnProperty('material_type')) ? require("../common/images/" + String(value.material_type) + ".png") : require("../common/images/assignment.png")
            if (count++ > 250)
                return null;
            return (
              <div className={classes.root} key={`${value.id}`}>
                <Paper className={classes.paper}>
                  <Grid container spacing={2}>
                    <Grid item>
                      <ListItemLink
                              history={history}
                              location={location}
                              match={match}
                              primary={""} to={"/material/" + value.id} key={value.id}
                              icon={<CardMedia
                                    className={classes.image}
                                    image={image}
                                    title="Image title"
                                />}

                      />
                    </Grid>
                    <Grid item xs={12} sm container>
                      <Grid item xs container direction="column" spacing={2}>
                        <Grid item xs>
                          <Typography gutterBottom variant="subtitle1">
                            {value.title}
                          </Typography>
                          <Typography variant="body2" color="textSecondary" className={classes.description} gutterBottom>
                            {(value.description)?value.description.split(" ").splice(0,50).join(" ") + "...":""}
                          </Typography>
                        </Grid>
                      </Grid>
                      <Grid item>
                      <Checkbox id={`checkbox-${value.id}`}
                                            checked={listInfo.selected_materials.includes(value.id)}
                                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                                event.stopPropagation();
                                                handleCheck(event, value.id);
                                                if(listOneCallBack !== undefined){
                                                  listOneCallBack(event.target.checked, value.id);
                                                }                         
                                            }}
                                            onClick={e => (e.stopPropagation())}
                                  />
                      </Grid>
                    </Grid>
                  </Grid>
                </Paper>
              </div>

                // <div key={`${value.id}`}>
                //
                //     <Divider/>
                //     <ListItemLink
                //         history={history}
                //         location={location}
                //         match={match}
                //         primary={value.title} to={"/material/" + value.id} key={value.id}
                //         input={
                //             <Checkbox id={`checkbox-${value.id}`}
                //                       checked={listInfo.selected_materials.includes(value.id)}
                //                       onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                //                           event.stopPropagation();
                //                           handleCheck(event, value.id);
                //                       }}
                //                       onClick={e => (e.stopPropagation())}
                //             />
                //         }
                //     />
                // </div>
            )
        });
    }

    const handleCheck = (event: React.ChangeEvent<HTMLInputElement>, id: number) => {
        let selected = listInfo.selected_materials;
        if (event.target.checked) {
            selected.push(id);
        } else {
            selected = selected.filter(e => e !== id);
        }

        if (store_tags) {
          localStorage.setItem("checked_materials", selected.toString());
        }

        setListInfo({...listInfo, selected_materials: selected});
    };

    //function to handle the action of selecting all the materials in the list
    const handleSelectAll = () => {
        let selected_materials = [...new Set(listInfo.selected_materials.concat(listInfo.materials?.map(e => e.id)
            || []))]
        if(listOneCallBack !== undefined){
          listOneCallBack(true, selected_materials);
        }        
        if (store_tags) {
          localStorage.setItem("checked_materials", selected_materials.toString());
        }

        setListInfo({...listInfo, selected_materials});
    };

    const handleSelectNone = () => {
        let selected_materials: number[] = []

        if(listOneCallBack !== undefined){
          listOneCallBack(false, selected_materials);
        }
        if (store_tags) {
          localStorage.setItem("checked_materials", selected_materials.toString());
        }

        setListInfo({...listInfo, selected_materials});
    };


    const handle_submit = (keyword: string, tags: TagData[]) => {
      let tag_str = tags.map(tag => tag.id).join(',');
      setListInfo({...listInfo, keyword, tags: tag_str, fetched: false, materials: null})
    }

    const build_material_list_data = (): MaterialListData[] => {
      let populate_map: {[index: number]: boolean} = {};
      listInfo.selected_materials.forEach(index => {populate_map[index] = true});
      let to_return: MaterialListData[] = [];

      listInfo.materials?.filter(mat => populate_map[mat.id]).forEach(mat => {
        to_return.push({
          id: mat.id,
          title: mat.title
        });
      })

      return to_return;
    };


    return (
        <div>
        {/*load selected material to analyze comp for visualze*/}
        {//(listInfo.search !== "?material_types=collection")?
          //<Analyze listOne={listInfo.selected_materials} listTwo={[]} user_id={user_id} user_data={{}} currentLoc="materials" from="materials"/>
          //:
          //<Analyze listOne={listInfo.selected_materials} listTwo={[]} user_id={user_id} user_data={{}} currentLoc="collection" from="collection"/>
        }
        {/*uses the listinfor search variable to determine if on collections or not, could prob be done a better way*/}
          {(listInfo.search !== "?material_types=collection") ?
            <Typography component="h1" variant="h3" align="center" color="textPrimary" gutterBottom className={classes.titles}>
                Select Materials
            </Typography>
            :
            <Typography component="h1" variant="h3" align="center" color="textPrimary" gutterBottom className={classes.titles}>
                Select Collections
            </Typography>
          }
          {
            material_update !== undefined &&
            <Button className={classes.margin} variant="contained" color="primary"
                                onClick={() => {material_update(build_material_list_data());}}
                        >
                            Back to Material Form
                        </Button>
          }
          <Search
                history={history} location={location} match={match} api_url={api_url} init_keyword={keyword} init_tags={init_tags} on_submit={handle_submit}
          />
            <div className={classes.root}>
                <Grid container direction="column">
                    <Grid item>
                        <Button className={classes.margin} variant="contained" color="primary"
                                onClick={() => {
                                    if (listInfo.materials !== null)
                                        handleSelectAll();
                                }}
                        >
                            Select All
                        </Button>
                        <Button className={classes.margin} variant="contained" color="primary"
                                onClick={() => {handleSelectNone();}}
                        >
                            Select None
                        </Button>
                    </Grid>
                </Grid>
                {(listInfo.materials === null || reload || !listInfo.fetched) &&
                <CircularProgress/>
                }
                </div>


                <List>
                    {output}
                </List>
                {
                // <Button aria-controls="simple-menu" aria-haspopup="true" onClick={handleClick}>
                //   Open Menu
                // </Button>

                // <Menu
                //   id="simple-menu"
                //   anchorEl={anchorEl}
                //   keepMounted
                //   open={Boolean(anchorEl)}
                //   onClose={handleClose}
                // >
                //   <MenuItem onClick={() => handleSelect(50)}>50</MenuItem>
                //   <MenuItem onClick={handleClose}>My account</MenuItem>
                //   <MenuItem onClick={handleClose}>Logout</MenuItem>
                // </Menu>
                }
                <Pagination
                  count={noOfPages}
                  page={page}
                  onChange={handleChange}
                  defaultPage={1}
                  color="primary"
                  size="large"
                  showFirstButton
                  showLastButton
                  className={classes.root}
                />
        </div>

    )
};
