
class Conundrum {
	constructor(word_lists) {
		this.word_lists = word_lists;
		this.points = 0;
		this.clue;
		this.answer = this.choose_random_word(); //this.clue is defined by this function too
		// These lines will prevent the clue from being too similar to the answer
		// You can define how similar "too similar" is with the variable below
		// In this case, if first or last 5 characters of the clue are the same as the answer
		let similarity_threshold = 5;
		while (this.answer.slice(0, similarity_threshold) == this.clue.slice(0, similarity_threshold) 
				|| this.answer.slice(similarity_threshold*-1) == this.clue.slice(similarity_threshold*-1)) {
			// Repeat the answer and clue selection process until they are no longer too similar
			this.answer = this.choose_random_word();
		}
		// User input validation
		this.user_input_valid = false;
		//this.validate_user_input = this.validate_user_input.bind(this);
		//$ID("user_input_field").addEventListener("keyup", this.validate_user_input);
		//$ID("user_input_field").addEventListener("keyup", window.current_game.new_validate_user_input);
		// Clear the previous answer
		let answer_row = $ID("answer_row");
		if (answer_row != null) {
			answer_row.remove();
		}
	}

	find_anagrams = function(chars, fourfiveanagrams, SHOW_HYPHEN=false) {
		// First argument must be 9 letters, E.g. "bewitched"
		// Second arg determines whether it returns 4/5 or 3/6 subword anagrams
		// Set fourfive_letter_words to false to get 3/6 anagrams
		// Optional final arg is for DEBUG ONLY! Shows hyphen betweens subwords for readability

		if (chars.length !== 9) { 
			console.log('LENGTH ERROR! String is '+String(chars.length)+' chars long.');
			return; 
		}
		let firstwordlength = (fourfiveanagrams) ? 4 : 3;
		let secondwordlength = (fourfiveanagrams) ? 5 : 6;
		let hyphen = (SHOW_HYPHEN) ? '-' : '';
		let all_permutations = permute(chars);
		// All the 3 or 4 letter permutations you can make with the input
		let first_perm_group = new Set(all_permutations.map(v => v.slice(0, firstwordlength-9)));
		// /All of of the 5/6 letter permutations
		let second_perm_group = new Set(all_permutations.map(v => v.slice(0, secondwordlength-9)));
		// Determine which set of words we'll be working with
		let first_word_list = (fourfiveanagrams) ? this.word_lists.four_letter_words : this.word_lists.three_letter_words;
		let second_word_list = (fourfiveanagrams) ? this.word_lists.five_letter_words : this.word_lists.six_letter_words;
		let first_set = first_word_list;
		let second_set = second_word_list;
		// Find the intersections of two groups of sets: the dictionary words and the n-letter permutations
		let found_firstgroup = new Set([...first_set].filter(x => first_perm_group.has(x)));
		let found_secondgroup = new Set([...second_set].filter(x => second_perm_group.has(x)));
		let sorted_chars = sort_string(chars);
		let word_pairs = []; // The array we'll be returning
		// Loop through the sub-words we've found we can make with the input word's letters
		// Some if statements are necessary to remove unwanted word combos related to compound words
		// For example, we don't want "lifeblood" being turned into "bloodlife"--way too easy!!
		for (let found_first of found_firstgroup) {
			if (chars.slice(0, firstwordlength) === found_first || chars.slice(secondwordlength, 9) == found_first) {
				continue;
			}
			for (let found_second of found_secondgroup) {
				if (chars.slice(firstwordlength, 9) === found_second) {
					continue;
				}
				let combined = found_first+found_second;
				if (sorted_chars != sort_string(combined) || combined === chars) {
					continue;
				}     
				word_pairs.push(found_first+hyphen+found_second);
			}
		}
		for (let fsecond of found_secondgroup) {
			if (fsecond == chars.slice(firstwordlength, 9)) continue;
			for (let ffirst of found_firstgroup) {
				let combined = fsecond+ffirst;
				if (sorted_chars !== sort_string(combined) || combined === chars) {
					 continue;
				}
				word_pairs.push(fsecond+hyphen+ffirst);
			}
		}
		// Turn the array into a Set to remove duplicates, then turn it back into an array
		return Array.from(new Set(word_pairs));
	}

	choose_random_word = function() {
		let random_word;
		let conundrum_found = false;
		let grams;

		while (!conundrum_found) {
			let nine_words = Array.from(this.word_lists.nine_letter_words); // Need to turn it into an array to select a random element, can't index a Set
			random_word = nine_words[Math.floor(Math.random() * nine_words.length)];
			let fourfive_subwords = (Math.random() < 0.5); // Boolean that determines 4-5 vs 3/6 anagrams
			let tmp = this.find_anagrams(random_word, fourfive_subwords);
			grams = (tmp == []) ? this.find_anagrams(random_word, !fourfive_subwords) : tmp;
			// Once we've found a word that can be anagramified we break the loop
			if (grams.length > 1) { 
				conundrum_found = true;
			}
		}
		this.clue = grams[Math.floor(Math.random() * grams.length)];
		return random_word;
	}

	check_answer = function () {
		let message = "";
		let users_word = $ID("user_input_field").value.toLowerCase();
		window.game_stats['conundrum_user_word'] = users_word;

		if (users_word == this.answer) {
			//message = "Correct! You scored 10 points.";
			this.points = 10;
		}
		// An example of the condition below is if the answer is "ESTIMATES" but the user guesses "STEAMIEST"
		// They would be awared 10 points despite not having the correct answer
		// Provided their word uses all of the same letters as the clue and is in the dictionary
		else if (users_word != this.answer && this.user_input_valid && this.word_lists.nine_letter_words.has(users_word)) {
			message = `Although the answer was <strong>${this.answer}</strong>, your word &ldquo;<strong>${users_word}</strong>&rdquo; was accepted on a technicality.`;
			this.points = 10;
		}
		else {
			message = `The answer was <strong>${this.answer}</strong>.`;
			this.points = 0;
		}
		let answer_letters = "<tr id=\"answer_row\">";

		for (let letter of this.answer.split("")) {
			answer_letters += `<td>${letter}</td>`;
		}

		$ID("letters_or_numbers_box").parentNode.innerHTML += answer_letters+"</tr>";
		$ID("results_box").innerHTML += message;
	}
}