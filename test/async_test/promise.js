// With callbacks
function callback(callback1, callback2, number){
    let result = number + 1
    if (result % 2 == 0){
       callback1(result)
    }else{
       callback2(result)
    }
 }
 callback((num)=>{
     console.log(`${num} is odd`)
 }, (num)=>{
     console.log(`${num} is even`)
 }, 6)
 
 // With promises
 
 function returnPromise(number){
     return new Promise((resolve, reject)=>{
         let num = number + 1
         if (number % 2 == 0){
             resolve(num)
         }else{
             reject(`${num} is even`)
         }
     })
 }
 
 returnPromise(5).then((num)=> console.log(`${num} is odd`)).catch((error)=>console.log(error))
 
 
 // WITH ASYNC AND AWAIT
async function asyncFunction(number){
     try{
         const num = await returnPromise(5)
         console.log(`${num} is a number`)
     }
     catch (error){
         console.log(error)
     }		
 }
 
 asyncFunction(6)