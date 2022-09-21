let date = '2022-05-21'
let date2 = '2022-06-15'

let date_1 = new Date(date)
let date_2 = new Date()
console.log(date_2)

let months = (date_2.getFullYear() - date_1.getFullYear()) * 12
months += date_2.getMonth() - date_1.getMonth()
console.log(months)