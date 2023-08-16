import {getJSONData} from "./util";
import {OntologyData} from "./types";

//returns a promise that will contain the metadata of a particular single material
//
//this includes entries in a collection.
//
//params:
//materialid: the id of the material to fetch
//api_url: base url of the api server
export function getMaterialMeta(materialid:Number, api_url: string){
        const url = api_url + "/data/material/meta?id=" + materialid;
        const auth = {"Authorization": "bearer " + localStorage.getItem("access_token")};

        let promise;
        promise = getJSONData(url, auth).then(resp => {
            if (resp === undefined) {
                console.log("API SERVER FAIL: "+url);
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
//this does not include entries in a collection.
//
// params:
// materialsids: an array of material id
// api_url: base url of the api server
export function getMaterials(materialids: Array<Number>, api_url: string) : Promise<any> {
    const url = api_url + "/data/materials?ids=" + materialids.toString();
        const auth = {"Authorization": "bearer " + localStorage.getItem("access_token")};

        let promise;
        promise = getJSONData(url, auth).then(resp => {
            if (resp === undefined) {
                console.log("API SERVER FAIL:" + url)
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
	let seen : Array<number> = [];
	
	const lam = async(mid:number) => {
//	    console.log("unpacking: "+mid);
	    return getMaterialMeta(mid, api_url).then(
		(metain) => {
		    if (metain.materials.length == 0) {
			if (retvals.includes(metain.id) == false) {
			    retvals.push(metain.id);
			}
			else {
			    console.log("recursively nested collection? detected on :"+metain.id);
			}

			return retvals;
		    }
		    else {
			//TODO: we really should batch the queries rather than do them one at a time.
			let subt : any = [];
			metain.materials.forEach(
			    function (item:any, index:number){
				if (seen.includes(item.id) == false) {
				    subt.push(lam(item.id));
				}
				else {
				    console.log("recursively nested collection? detected on :"+item.id);
				}

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

//Returns an ontology tree as (a promise of) an OntologyData by name.
//
// TODO: Should this function cache the ontology tree?
//
//params:
//tree_name: the name of the tree as encoded in the database. Typically "pdc", and "acm"
//api_url: base URL of the api server
export function getOntologyTree(tree_name: string, api_url: string) : Promise<OntologyData> {
    const url = api_url + "/data/ontology_trees";

    const auth = {"Authorization": "bearer " + localStorage.getItem("access_token")};
    return getJSONData(url, auth).then(resp => {
//        console.log(resp);
        if (resp === undefined) {
            console.log("API SERVER FAIL: "+url)
	    return Promise.reject(new Error('API SERVER FAIL'));
        } else {
            if (resp['status'] === "OK") {
                const ontology = resp["data"][tree_name];
		return ontology;
            }
	    else {
		return Promise.reject(new Error('API SERVER FAIL:' + url));
	    }
        }
    });    
}

//return an array of all core1 ACM13 tag numbers.
//TODO: this is not portable to standard cs-materials-api. This assumes live database
export function acmCS13Core1(): Array<number> {
    return [199,200,201,202,203,204,205,211,212,213,214,215,216,223,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,241,242,243,244,245,246,251,252,253,254,255,260,261,262,263,264,265,266,267,268,276,277,278,279,280,282,284,285,288,289,290,291,292,296,297,457,458,459,460,461,462,463,464,465,466,467,575,576,577,578,579,580,581,582,583,584,585,586,587,588,589,590,592,593,594,595,596,597,598,599,600,601,602,603,605,606,608,609,610,611,612,613,615,616,617,618,619,620,621,622,623,626,627,628,629,630,631,632,633,634,635,636,637,638,639,640,641,642,643,644,645,646,648,649,650,651,654,655,656,657,658,659,663,664,665,666,667,670,671,672,673,674,675,680,681,682,683,684,689,690,691,692,812,813,814,815,816,817,818,819,820,821,822,823,824,825,826,978,979,980,981,982,983,984,985,986,987,990,991,992,993,994,995,996,1003,1004,1005,1006,1007,1008,1009,1016,1017,1018,1019,1020,1029,1030,1031,1032,1033,1034,1035,1036,1037,1225,1226,1227,1228,1229,1230,1238,1239,1240,1241,1682,1683,1684,1685,1686,1687,1688,1689,1690,1692,1693,1694,1695,1696,1697,1698,1699,1755,1756,1757,1758,1759,1760,1761,1762,1763,1764,1766,1767,1768,1769,1770,1771,1772,1773,1774,1775,1776,1777,1778,1779,1937,1938,1939,1940,1941,1943,1944,1946,1947,1948,1950,1951,1958,1959,1965,1966,1977,1978,2018,2026,2027,2142,2143,2144,2145,2149,2150,2151,2152,2153,2154,2165,2166,2167,2171,2172,2173,2174,2175,2176,2177,2178,2197,2198,2199,2200,2201,2202,2209,2210,2211,2212,2213,2214,2215,2216,2356,2357,2358,2359,2360,2361,2362,2363,2364,2365,2366,2367,2368,2369,2370,2371,2372,2373,2374,2375,2376,2377,2378,2380,2381,2382,2383,2384,2385,2386,2387,2388,2389,2390,2391,2392,2393,2394,2395,2397,2398,2399,2400,2401,2402,2403,2404,2405,2406,2407,2408,2409,2410,2411,2412,2413,2414,2415,2417,2418,2419,2420,2421,2422,2423,2424,2425,2426,2427,2428,2429,2430,2431,2432,2433,2434,2435,2436,2437,2438,2439,2440,2441,2442,2443,2446,2447,2448,2449,2450,2460,2461,2462,2463,2534,2535,2536,2548,2549,2561,2562,2563,2564,2584,2585,2586,2587,2712,2713,2714,2715,2716,2717,2718,2719,2720,2721,2722,2723,2724,2725,2727,2728,2729,2730,2731,2732,2733,2734,2735,2737,2738,2739,2740,2741,2742,2743,2744,2745,2746,2747,2749,2750,2751,2752,2753,2754,2755,2756,2757,2758,2759,2761,2762,2763,2764,2765,2766,2767,2768,2817,2818,2819,2820,2821,2826,2827,2833,2834,2835,2836,2837,2838,2839,2840,2842,2843,2844,2845,2846,2847,2857,2858,2859,2860,2861,2872,2873,2874,2875,2876,2877,2878,2879,2880,2881,2884,2885,2886,2887,2888,2889,2890,2891,2895,2896,2897,2898,2899,2902,2903,2904,2905,2906,2911,2912,2913,2914,2915,2916,2917,2921,2922,2923,2924,2925,2929,2930,2937,2938];
}

//return an array of all core2 ACM13 tag numbers.
//that does not include core1, just core2
//TODO: this is not portable to standard cs-materials-api. This assumes live database
export function acmCS13Core2(): Array<number> {
    return [206,207,208,209,210,217,218,219,220,221,247,248,249,250,256,257,258,269,270,271,272,273,274,275,286,293,294,295,298,299,300,341,342,343,344,345,346,347,348,349,350,351,352,353,355,356,357,358,359,360,361,362,363,364,365,366,367,369,370,371,372,373,374,375,376,377,378,379,380,381,382,383,384,385,386,387,388,389,391,392,393,394,395,396,397,398,399,400,401,402,403,404,405,407,408,409,410,411,412,413,414,415,416,417,418,419,614,624,652,653,660,661,668,669,676,677,685,686,693,694,695,828,829,830,831,832,833,834,835,836,837,838,839,989,997,998,999,1000,1001,1002,1010,1011,1012,1013,1014,1021,1022,1038,1039,1066,1067,1068,1069,1072,1073,1074,1075,1079,1080,1081,1082,1088,1089,1090,1091,1097,1098,1099,1100,1111,1112,1113,1224,1231,1232,1233,1234,1235,1236,1237,1242,1243,1244,1246,1247,1248,1249,1250,1251,1252,1253,1255,1256,1257,1258,1259,1260,1263,1264,1265,1266,1267,1268,1269,1270,1271,1272,1273,1274,1275,1276,1487,1488,1489,1490,1491,1492,1493,1494,1495,1496,1497,1498,1499,1500,1501,1502,1503,1506,1507,1508,1509,1510,1511,1512,1513,1514,1515,1516,1517,1518,1519,1520,1522,1523,1524,1525,1526,1527,1528,1529,1531,1532,1533,1534,1535,1536,1537,1538,1539,1540,1701,1702,1703,1704,1705,1706,1707,1709,1710,1711,1712,1713,1714,1715,1717,1718,1719,1720,1721,1722,1723,1724,1725,1727,1728,1729,1730,1731,1732,1733,1734,1735,1736,1738,1739,1740,1741,1742,1781,1782,1783,1784,1785,1786,1787,1788,1789,1790,1791,1792,1793,1794,1796,1797,1798,1799,1800,1801,1802,1803,1804,1805,1806,1808,1809,1810,1811,1812,1813,1814,1815,1816,1818,1819,1820,1821,1822,1823,1824,1825,1826,1952,1953,1954,1955,1956,1957,1960,1961,1962,1963,1967,1968,1969,1970,1971,1972,1973,1974,1975,1979,1980,1981,1982,1983,1984,1985,1986,1987,1988,1989,1990,1996,1997,1998,1999,2000,2001,2002,2007,2008,2009,2010,2011,2019,2020,2028,2029,2146,2147,2148,2155,2156,2157,2158,2159,2160,2161,2162,2163,2168,2169,2170,2179,2180,2181,2182,2183,2184,2186,2187,2188,2189,2190,2191,2192,2193,2194,2195,2203,2204,2205,2206,2207,2208,2217,2218,2219,2220,2221,2222,2223,2224,2225,2227,2228,2229,2230,2231,2232,2233,2235,2236,2237,2238,2239,2240,2241,2242,2243,2244,2245,2246,2247,2248,2249,2250,2451,2452,2464,2471,2472,2473,2474,2475,2476,2477,2478,2479,2495,2496,2497,2498,2499,2500,2501,2502,2520,2521,2522,2523,2524,2525,2526,2527,2528,2529,2530,2531,2532,2537,2538,2539,2540,2547,2550,2551,2552,2565,2566,2567,2568,2569,2570,2571,2572,2573,2574,2575,2588,2589,2590,2591,2604,2605,2606,2607,2608,2609,2610,2613,2614,2615,2616,2617,2618,2619,2620,2621,2622,2623,2624,2625,2626,2627,2628,2630,2631,2632,2633,2634,2635,2636,2637,2638,2647,2648,2649,2650,2651,2652,2653,2654,2655,2656,2665,2666,2667,2668,2669,2670,2671,2672,2673,2674,2675,2676,2677,2678,2679,2680,2681,2682,2684,2685,2686,2691,2692,2693,2770,2771,2772,2773,2774,2775,2776,2778,2779,2780,2781,2782,2783,2784,2785,2787,2788,2789,2790,2791,2792,2794,2795,2796,2797,2798,2799,2800,2801,2802,2803,2822,2823,2824,2825,2828,2829,2830,2831,2848,2849,2850,2851,2852,2853,2854,2855,2856,2862,2863,2864,2865,2866,2867,2868,2869,2870,2931,2932,2939];
}
