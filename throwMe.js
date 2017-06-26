let idMaker = {
    [Symbol.iterator]() {
        let nextId = 1;
        return {
            next() {
                return {
                    value: nextId++,
                    done: false
                };
            }
        };
    }
};

function *idMaker2() {
    let nextId = 1;
    while(true){
        yield nextId++;
    };
}

let contactArr = [];
let newId = idMaker[Symbol.iterator]();
let newId2 = idMaker2();

class Contact {
    constructor(name){
        // this.id = contactArr.length > 0 ? Math.max(...contactArr.map(c => c.id)) + 1 : 1;
        // this.id = newId2.next().value;
        this.id = newId.next().value;
        this.name = name;
        contactArr.push(this);
    }
}

let a = new Contact('Jonas');
let b = new Contact('Alexander');
let c = new Contact('Alexander');
let d = new Contact('Alexander');
let e = new Contact('Alexander');
let f = new Contact('Alexander');
let g = new Contact('Alexander');

console.log(contactArr);


