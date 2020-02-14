const ff = () => {
    return [1, 2, 3];
};

//掛一個obj
ff.myObj = { name: 'Bill', age: 20 };

//掛一個func
ff.myFunc = () => {
    return [4, 5, 6]
};

console.log(ff());
console.log(ff.myObj);
console.log(ff.myFunc());

let myObj = {

    id: 123,
    func: () => {
        return 10
    }

};
console.log(myObj.func());



