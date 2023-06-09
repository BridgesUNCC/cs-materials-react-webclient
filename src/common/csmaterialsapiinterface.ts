import {getJSONData} from "./util";

//returns a promise that will contain the metadata of a particular single material
//params:
//materialid: the id of the material to fetch
//api_url: base url of the api server
export function getMaterialMeta(materialid:Number, api_url: string){
        const url = api_url + "/data/material/meta?id=" + materialid;
        const auth = {"Authorization": "bearer " + localStorage.getItem("access_token")};

        let promise;
        promise = getJSONData(url, auth).then(resp => {
            if (resp === undefined) {
                console.log("API SERVER FAIL")
                return null;
            } else {
                if (resp['status'] === "OK") {
                    return resp['data'];
                }
            }
        })
    return promise;
    }


//returns a promise that will contain a list of material ids.
//params:
//materialid: the id of the material to fetch
//api_url: base url of the api server
export function getMaterialLeaves(materialid:number, api_url: string) : Promise<Array<number>>{
    return getMaterialMeta(materialid, api_url).then( (meta) => {
	let retvals : Array<number> = [];
	if (meta.materials.length == 0) {
	    retvals.push(meta.id);
	    return retvals;
	}
	
	const lam = async(mid:number) => {
//	    console.log("unpacking: "+mid);
	    return getMaterialMeta(mid, api_url).then(
		(metain) => {
		    if (metain.materials.length == 0) {
			retvals.push(metain.id);
			return retvals;
		    }
		    else {
			//TODO: we really should batch the queries rather than do them one at a time.
			let subt : any = [];
			metain.materials.forEach(
			    function (item:any, index:number){
				subt.push(lam(item.id));
			    }
			);
			return Promise.all(subt).then( (item)=> {
			    return retvals;
			});
		    }
		}
	    );
	};
	    
	return lam(materialid);

    });
}


//Given a collection, expand the leaves of materials into sublist.
//
// For instance a collection with 3 sub collection that recursively contain many materials will look like: [[1,2,3],[4,5,6,7,8],[10,11,12]]. There are three sublists of materials becasue there are 3 subcollections. Even though there may be more nested collections, they are flattened.
//
//params:
//collectionid: the id of the material to fetch
//api_url: base url of the api server
export function expandCollectionToListLeave(collectionid:number, api_url: string) : Promise<Array<Array<number>>>{
    return getMaterialMeta(collectionid, api_url).then( (meta) => {
	let retvals : Array<Array<number>> = [];
	if (meta.materials.length == 0) {
	    //TODO really should throw an exception of some sort
	    return [];
	}

	let subt:any = [];
	
	meta.materials.forEach(
	    function (item:any, index:number){
		let locallist : Array<number> = [];
		retvals.push(locallist);
		let a = getMaterialLeaves(item.id, api_url).then((vals) => {
		    vals.forEach (i=>locallist.push(i));
		});
		subt.push(a);
	    }
	);

	return Promise.all(subt).then( (item)=> {
	    //console.log(retvals.length);
	    return retvals;
	});
	    
	//return retvals

    });
}
