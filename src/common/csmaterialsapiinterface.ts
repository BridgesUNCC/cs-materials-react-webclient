import {getJSONData} from "./util";

//returns a promise that will contain the metadata of a particular single material
//params:
//materialid: the id of the material to fetch
//api_url: base url of the api server
export function getMaterialMeta(materialid:Number, api_url: string){
        const url = api_url + "/data/material/meta?id=" + materialid;
        const auth = {"Authorization": "bearer " + localStorage.getItem("access_token")};

        let promise;
        let data;
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
	    console.log("unpacking: "+mid);
	    await getMaterialMeta(mid, api_url).then(
		(metain) => {
		    if (metain.materials.length == 0) { retvals.push(metain.id); }
		    else {
			let subt = [];
			meta.materials.forEach(
			    function (item:any, index:number){
				subt.push(lam(item.id));
			    }
			);
			subt.forEach(
			    function (item:any, index:number) {
				await item
			    }
			);
			
		    }
		}
	    );
	};
	    
	//lam(materialid);
	
	return retvals;
    });
}
