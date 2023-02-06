const MyError = require("./myError")

function isAnyEmpty(arr){
    /*
        arr - arr is an array of variables of any type
        RETURNS true if any element is empty and false if all items are full
    */
   let isEmpty = false
   // Goes through all the items and returns if any is empty
   for (let i = 0; i < arr.length; i++){
        if (arr[i] === undefined || arr[i] === null){
            isEmpty = true
        }
   }
   return isEmpty
}

function checkIfBoolean(x, message) {
    if (typeof x !== "boolean"){
        throw new MyError(message);
    }
}

module.exports = {
    isAnyEmpty,
    checkIfBoolean
}