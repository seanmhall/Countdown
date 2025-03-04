//Syntactic sugar
window.$ID = function(x) { return document.getElementById(x); };

//These prototypes mimic JQuery functionality with VanillaJS - 4/19/2023
//The "css" method can be used to change a single declaration with two arguments such as Element.css("visibility", "hidden")
//To change multiple delcarations at once you can use a dictionary (object) as the only argument e.g. Element.css({"display": "block", "color": "#000"})
//Also accepts an array as the argument e.g. Element.css(["display: block", "background-color: #C96"])

//Style names need to be converted from hyphenated to camelCase 
//E.G. "border-bottom-color" should be "borderBottomColor"
function hyphen_to_camelCase(str) {
    if (str.indexOf("-") < 0) return str;

    let tokens = str.split("-");
    let camelCase = tokens[0];

    for (let token of tokens.slice(1)) {
        let first_letter_cap = token.substr(0,1).toUpperCase()+token.substr(1,token.length);
        camelCase += first_letter_cap;
    }

    return camelCase;
}
  
Element.prototype.css = function(style, value="") {
    //If style is an object (AKA dictionary)
    if (typeof(style) == "object" && !Array.isArray(style)) {
        for (let style_declaration in style) {
            eval("this.style."+hyphen_to_camelCase(style_declaration)+" = '"+style[style_declaration]+"';");
        }
    }  
    //If style is an array
    else if (Array.isArray(style)) {
        for (let style_declaration of style) {

            //Remove any whitespace or semi-colons
            let tmp = style_declaration.replace(/\s+|;+/g, "").split(":");
            eval("this.style."+hyphen_to_camelCase(tmp[0])+" = '"+tmp[1]+"';");
        }
    }
    //if style is a string
    else {
        eval("this.style."+hyphen_to_camelCase(style)+" = '"+value+"';");
    }
}

function occurences_of(char, str) {
    str = (typeof str == "object") ? str.join("") : str;
    let rgx = new RegExp(`${char}`, "g");
    return (str.match(rgx) || []).length;
}
// "x" can be either a String or an Array
function shuffle(x) {
    let arr = (typeof x == "string") ? x.split("") : x;
    let i = arr.length;
    let temp, random_element;

    while (i !== 0) {
        // Pick a remaining element...
        random_element = Math.floor(Math.random() * i);
        i -= 1;
        // And swap it with the current element.
        temp = arr[i];
        arr[i] = arr[random_element];
        arr[random_element] = temp;
    }
    
    return (typeof x == "string") ? arr.join("") : arr;
}

// Based on an answer from Stack Overflow
// I modified it to accept an additional argument and also removed some code that removed duplicates
// The original function would actually return Combinations and not Permutations, strictly speaking
function permute(string, charnum) {
    charnum = charnum || 1;
    //Break condition
    if (string.length === charnum) return string;

    let permutations = [];
    for (let i=0;i<string.length;i++) {
        let char = string[i];
        let remainingString = string.slice(0, i) + string.slice(i + 1, string.length);

        for (let subPermutation of permute(remainingString)) {
            permutations.push(char + subPermutation);
        } 
    }
    return permutations;
}

function sort_string(x) {
    let chars = x.split('');
    chars.sort();
    return chars.join(''); 
}
//String.prototype.sort = function(){ chars = this.split(''); chars.sort(); return chars.join(''); };