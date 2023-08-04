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
                return Promise.reject(new Error('API SERVER FAIL'));
            } else {
                if (resp['status'] === "OK") {
                    return resp['data'];
                }
            }
        })
    return promise;
    }

//returns (the promise of) the meta data and tags of a set of materials
// as returned in the data field of by https://cs-materials-api.herokuapp.com/data/materials 
//
// params:
// materialsids: an array of material ir
// api_url: base url of the api server
export function getMaterials(materialids: Array<Number>, api_url: string) : Promise<any> {
    const url = api_url + "/data/materials?ids=" + materialids.toString();
        const auth = {"Authorization": "bearer " + localStorage.getItem("access_token")};

        let promise;
        promise = getJSONData(url, auth).then(resp => {
            if (resp === undefined) {
                console.log("API SERVER FAIL")
                return Promise.reject(new Error('API SERVER FAIL'));
            } else {
                if (resp['status'] === "OK") {
                    return resp['data'];
                }
            }
        })
    return promise;
    
}

// for a given set of materials, give the tags of each materials individually.
//
// returns (the promise of) a map of materialid to the tags of that material
// param:
//materialsids: an array of id of materials
// api_url: base url of the api server
export function getMaterialsTags(materialids: Array<Number>, api_url: string) : Promise<Record<number, Array<number>>> {
    return getMaterials(materialids, api_url).then (o => {
	let mapping : Record<number, Array<number>> = {};
	o.materials.forEach((m:any) => {
	    let matid: number = Number(m["id"]);
	    let tags: Array<number> = [];
	    m.tags.forEach((t: any) => {
		tags.push(Number(t.id));
	    });
	    mapping[matid] = tags;
	});
	return mapping;
    });
}


// returns (a promise of) a list of all the materials part of a collection recursively.
// That is to say, each collection is expanded into the materials that compose it.
// The collections themselves are not included in the list.
//
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


//returns similarity data for this particular set of materials
//
//params:
//materialsids: an array of material IDs
//searchapi_url: the base url of the search API
//
//returns a object from the respose of /similarity from https://github.com/BridgesUNCC/CSmaterial-smart-search
export function getSimilarityData(materialids:Array<number>, searchapi_url: string) {
    const url = searchapi_url+'/similarity?'+
          `matID=${materialids.toString()}`;
    return getJSONData(url, {}).then(resp => {
        if (resp === undefined) {
            console.log("API SERVER FAIL")
	    return Promise.reject(new Error('API SERVER FAIL'));
        }
	else {
	    if (resp['status'] === "OK") {
		return resp['data'];
	    }
	    else {
		return Promise.reject(new Error('API SERVER FAIL'));
	    }
	}
    });


}
