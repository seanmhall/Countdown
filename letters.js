window.vowel_stack = "";
window.consonant_stack = "";

// Controls where found word URLs point to
const URL_LOOKUP_PREFIX = 'https://duckduckgo.com/?t=ffsb&q=define:';

class Letters_Game {

    constructor() {
        //super();
        //this.word_lists = word_lists;
        this.word_lists = window.letters_round_word_lists;
        this.points = 0;
        this.chosen_letters = [];
        this.solutions;
        this.vowel_count = 0;
        this.consonant_count = 0;
        this.user_word = $ID("user_input_field").value;
        $ID("user_input_field").setAttribute("size", "25");
        $ID("user_input_field").setAttribute("maxlength", "9");
        this.user_input_valid = false;
        //this.validate_user_input = this.validate_user_input.bind(this);
        this.letter_frequencies = {
            "vowels": {
            "A": 6.98,
            "E": 9.14,
            "I": 6.71,
            "O": 5.21,
            "U": 3.02
            },
            "consonants": {
            "B": 1.67,
            "C": 3.18,
            "D": 3.01,
            "F": 1.07,
            "G": 2.09,
            "H": 2.05,
            "J": 0.16,
            "K": 0.93,
            "L": 4.5,
            "M": 2.43,
            "N": 5.22,
            "P": 2.33,
            "Q": 0.15,
            "R": 5.74,
            "S": 6.14,
            "T": 0.49,
            "V": 0.73,
            "W": 0.8,
            "X": 0.24,
            "Y": 1.39,
            "Z": 0.33,
            }
        }

        if (window.vowel_stack.length < 1) {
            this.create_letter_pool();
        }
        $ID("vowel").disabled = false;
        $ID("consonant").disabled = false;
        $ID("letters_or_numbers_box").innerHTML = "";
    }

    create_letter_pool = function() {
        let vowels = this.letter_frequencies["vowels"];
        let consonants = this.letter_frequencies["consonants"];

        function repeat_character(char, howmany) {
            let output = '';
            let i = 0;
            while (i < howmany) {
                output += char;
                i++;
            }
            return output;
        }

        for (let vowel in vowels) {
            window.vowel_stack = window.vowel_stack + repeat_character(vowel, vowels[vowel] * 100);
        }
        for (let c in consonants) {
            window.consonant_stack = window.consonant_stack + repeat_character(c, consonants[c] * 100);
        }
        window.vowel_stack = shuffle(window.vowel_stack);
        window.consonant_stack = shuffle(window.consonant_stack);
    }


    random_letter = function(isVowel = false) {

        if (this.chosen_letters.length >= 9) return;

        let letter;
        if (isVowel) {
            letter = window.vowel_stack[Math.floor(Math.random() * window.vowel_stack.length)];
            this.vowel_count++;
        }
        
        else {
            letter = window.consonant_stack[Math.floor(Math.random() * window.consonant_stack.length)];
            this.consonant_count++;
        }

        this.chosen_letters.push(letter);
        let current_cell = $ID("letters_or_numbers_box").getElementsByTagName("td")[this.chosen_letters.length-1];
        current_cell.innerHTML = letter;
        
        if (this.vowel_count == 5) { $ID("vowel").disabled = true; }

        if (this.consonant_count == 6) { $ID("consonant").disabled = true; } 

        if (this.chosen_letters.length == 9) {
            // Start the clock ticking and log the chosen letters
            // Logging them here instead in countdown.js will preserve the original order of the letters, before the input validation function sorts them alphabetically
            window.game_stats['letters_selected'] = this.chosen_letters.join("");
            window.current_game.start_countdown();
        }
    }

    check_for_solutions = function(letters=this.chosen_letters.join("")) {
        // Input MUST be 9 letters and no other characters
        if (letters.length != 9 || letters.match(/[^A-Z]/gi)) { return {}; }
        
        letters = letters.toLowerCase();
        let foundwords = {};
        // First, get all the possible permutations of our input string
        let perms = permute(letters);
        let nineperms = new Set(perms);
        let eightperms = new Set(perms.map(v => v.slice(0, -1)));
        let sevenperms = new Set(perms.map(v => v.slice(0, -2)));

        foundwords["nine"] = new Set([...this.word_lists.nine_letter_words].filter(x => nineperms.has(x)));
        foundwords["eight"] = new Set([...this.word_lists.eight_letter_words].filter(x => eightperms.has(x)));
        foundwords["seven"] = new Set([...this.word_lists.seven_letter_words].filter(x => sevenperms.has(x)));

        // return foundwords;
        this.solutions = foundwords;
    }
    
    display_solutions = function (solutions=this.solutions) {
        $ID("user_input_field").disabled = true;
        $ID("show_letters_solutions").css("display", "none");
        let outhtml = "<ul id='letters_round_solutions'>";

        const WORD_DISPLAY_LIMIT = 15;

        for (let wordlength in solutions) {
            let current = solutions[wordlength];
            if (current.size < 1) { 
                continue;
            }
            outhtml += '<li><strong class="found_words">' + wordlength + ': </strong>';
            let word_count = 0;
            current.forEach(the_word => {
                word_count = word_count+1;
                let comma = (word_count == current.size) ? '' : ', ';
                let bolded = ($ID("user_input_field").value.toLowerCase() == the_word) ? ' style="font-weight: bold;"' : '';
                outhtml += '<a href="' + URL_LOOKUP_PREFIX + the_word + '"'+bolded+'  target="_blank">' + the_word + '</a>'+comma;
            });
            outhtml += '</li>';
        }
        if (outhtml == "<ul id='letters_round_solutions'>") { 
            outhtml = "<span id='no_solutions_found'>No 7+ letter words found!</span>";
            $ID("letters_solutions_box").innerHTML += outhtml;
        }
        else {
            $ID("letters_solutions_box").innerHTML += outhtml+"</ul>";
        }
    }

    check_answer() {
        this.user_word = $ID("user_input_field").value.toLowerCase();

        if (this.user_word.length < 3 || !this.user_input_valid) {
                return;
        }

        let word_is_in_dictionary;

        switch (this.user_word.length) {
            case 3:
                word_is_in_dictionary = (this.word_lists.three_letter_words.has(this.user_word));
                this.points = word_is_in_dictionary ? 3 : 0;
                break;

            case 4:
                word_is_in_dictionary = (this.word_lists.four_letter_words.has(this.user_word));
                this.points = word_is_in_dictionary ? 4 : 0;
                break;

            case 5:
                word_is_in_dictionary = (this.word_lists.five_letter_words.has(this.user_word));
                this.points = word_is_in_dictionary ? 5 : 0;
                break;

            case 6:
                word_is_in_dictionary = (this.word_lists.six_letter_words.has(this.user_word));
                this.points = word_is_in_dictionary ? 6 : 0;
                break;

            case 7:
                word_is_in_dictionary = (this.word_lists.seven_letter_words.has(this.user_word));
                this.points = word_is_in_dictionary ? 7 : 0;
                break;

            case 8:
                word_is_in_dictionary = (this.word_lists.eight_letter_words.has(this.user_word));
                this.points = word_is_in_dictionary ? 8 : 0;
                break;

            case 9:
                word_is_in_dictionary = (this.word_lists.nine_letter_words.has(this.user_word));
                this.points = word_is_in_dictionary ? 18 : 0;
                break;

            default:
                break;
        }
        // If the user's word is not in the dictionary
        if (!word_is_in_dictionary) {
            $ID("results_box").innerHTML = `Your word &ldquo;<strong>${this.user_word}</strong>&rdquo; is not in the dictionary.`;
        }
    }
}