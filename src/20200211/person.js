//建立類別
class Person {
    constructor(name = 'noname', age = 20) {
        this.name = name;
        this.age = age;
    }

    toJson() {
        const obj = {
            name: this.name,
            age: this.age
        }
        return JSON.stringify(obj)
    }
}

let myvar = 30

//轉出
//要轉出一個以上的東西 就要包成物件
//{ Person, myvar } => { Person:Person, myvar:myvar }
module.exports = { Person, myvar };