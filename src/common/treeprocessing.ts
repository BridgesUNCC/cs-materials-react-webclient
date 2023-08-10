import {OntologyData} from './types';

//returns a flat array of the tags in an OntologyData tree
export function allTagsInTree(tree: OntologyData, sorted: boolean = false): Array<Number> {
   let ret : Array<Number> = [];
   ret.push(tree.id);
   tree.children.forEach(c => {
     ret = ret.concat(allTagsInTree(c, false)); //no need to sort in recursive calls
   });

   if (sorted) {
     ret.sort();
   }

   return ret;
}

// returns a new list of tags that only retains those that appear in that tree.
//
//
export function filterTagsInTree(tags: Array<Number>, tree: OntologyData): Array<Number> {
   let ret : Array<Number> = [];

   let inTree = allTagsInTree(tree, true);
   console.log(inTree);

   tags.forEach(t => {
     if (inTree.indexOf(t) != -1) { //this is a linear search!
     	ret.push(t);
     }
   });

   return ret;
}