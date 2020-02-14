//一次取出兩個物件
const { Person, myvar } = require('./person')

const p1 = new Person('Jane', 30)
console.log(p1.name)
console.log(p1.toJson())
console.log(myvar)
