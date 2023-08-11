import {OntologyData} from './types';

//returns a flat array of the tags in an OntologyData tree
export function allTagsInTree(tree: OntologyData, sorted: boolean = false): Array<Number> {
   let ret : Array<Number> = [];
   ret.push(tree.id);
   tree.children.forEach(c => {
     ret = ret.concat(allTagsInTree(c, false)); //no need to sort in recursive calls
   });

   if (sorted) {
     ret.sort((a:Number, b:Number) =>  (Number(a) - Number(b))); //in javascript sort works on strings
   }

   return ret;
}

// returns a new list of tags that only retains those that appear in that tree.
//
//
export function filterTagsInTree(tags: Array<number>, tree: OntologyData): Array<number> {
   let ret : Array<number> = [];

   let inTree = allTagsInTree(tree, true);

   tags.forEach(t => {
     if (inTree.indexOf(t) != -1) { //this is a linear search! TODO: sub with binsearch
     	ret.push(t);
     }
   });

   return ret;
}


// returns all the unique tags in a mapping of materials to tags.
// in otherwords, it transforms {12: [1,2], 13: [1,3]} into a set that contains 1,2,3
//
// This is meant to work on the objects returned by getMaterialsTags
//
export function uniqueTags(mapping : Record<number, Array<number>>) : Set<number> {
  let s = new Set<number>();

  for (let k in mapping) {
      mapping[k].forEach(t => s.add(t));
  }

  return s;
}


// count the tags in a mapping of materials to tags.
// in otherwords, it transforms {12: [1,2], 13: [1,3]} into {1:2, 2:1, 3:1}
//
// This is meant to work on the objects returned by getMaterialsTags
//
export function countTags(mapping : Record<number, Array<number>>) : Record<number,number> {
  let s : Record<number,number> = {};

  for (let k in mapping) {
      mapping[k].forEach(t => {
        if (!(t in s)) {
	  s[t] = 1;
	}
	else {
	  s[t] += 1;
	}
      });
  }



  return s;
}

//filters an ontology tree based on a prediate on individual nodes.
//If any node is retained, then all its parents up to the root are also kept.
//If no nodes are retained, returns undefined.
//the nodes returned are copies of the original tree. The passed tree is left untouched.
export function filterTree (tree: OntologyData,
                            predicate: (a: OntologyData) => boolean)
			      : OntologyData | undefined {
       let a: OntologyData|undefined = undefined;
       let child : Array<OntologyData> = [];
       a = Object.assign({}, tree);

       tree.children.forEach(o => {
         let local = filterTree(o, predicate);
	 if (local != undefined) {
	   child.push(local);
	 }
       });
       a.children = child;
       if (child.length == 0) {
         if (predicate(a) == false)
	   a = undefined;
       }
       return a;
}