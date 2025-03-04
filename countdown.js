
const SECONDS_PER_ROUND = 45;
const CONUNDRUM_WORD_LIST_FILE = "wordlists/conundrum_word_pool.txt";
const LETTERS_ROUND_WORD_LIST_FILE = "wordlists/letters_round_words.txt"
// L = Letters round, N = Numbers Round
// The Long Round order is the same as Countdown was from 1982-2001
const LONG_ROUND_ORDER = ["L", "L", "N", "L", "L", "N", "L", "L", "N", "C"];

class Countdown {

    constructor() {
        this.round_order = ["L", "N", "C"];
        this.round_number = Number(0);
        this.current_round_type = this.round_order[this.round_number];
        window.game_time = SECONDS_PER_ROUND;
        this.tick = this.tick.bind(this);
        this.new_validate_user_input = this.new_validate_user_input.bind(this);
        $ID("new_game").css("display", "none");
        this.total_points = Number(0);
        $ID("total_points").innerHTML = String(this.total_points);

        this.next_round();
    }

    next_round = function() {
        if (this.round_number > this.round_order.length-1) { return; }
        $ID("next_round_button").css("display", "none");
        // Reset the game clock
        window.game_time = SECONDS_PER_ROUND;
        $ID("timer_seconds").innerHTML = window.game_time;
        // Clear the previous round's answer and results
        $ID("results_box").innerHTML = "";
        $ID("user_input_field").value = "";
        $ID("input_form").css("display", "none");
        $ID("gameplay_buttons").css("display", "block");

        for (let tn of document.getElementsByClassName("tn_cell")) tn.style.display='none';

        this.current_round_type = this.round_order[this.round_number];
        let current_round_name;

        switch(this.current_round_type) {

            case "L":
                window.letters_round = new Letters_Game();
                $ID("button_container").innerHTML = $ID("letters_round_buttons").innerHTML;
                current_round_name = "letters";
                break;

            case "N":
                window.numbers_round = new Numbers_Game();
                $ID("button_container").innerHTML = $ID("numbers_round_buttons").innerHTML;
                current_round_name = "numbers";
                break;

            case "C":
                $ID("button_container").innerHTML = $ID("conundrum_button").innerHTML;
                $ID("start_conundrum").disabled = false;
                $ID("start_conundrum").innerHTML = "Start";
                current_round_name = "conundrum";
                break;
            default:
                break;
        }

        this.round_number = this.round_number+1;

        // Remove the second row of the table that contained the Conundrum answer
        if ($ID("answer_row") != null) {
            $ID("answer_row").remove();
        }
        // Reset the letters/numbers table to blank cells
        $ID("letters_or_numbers_box").innerHTML = create_empty_cells((this.current_round_type == "N") ? 6 : 9);
        $ID("user_input_field").setAttribute("size", (this.current_round_type == "N") ? "20" : "9");
		$ID("user_input_field").setAttribute("maxlength", (this.current_round_type == "N") ? "30" : "9");
        let round_title_text = current_round_name.slice(0,1).toUpperCase()+current_round_name.slice(1);
        round_title_text = `<strong id="round_name">${round_title_text} round:</strong>&nbsp;`;
        $ID("rules_box").innerHTML = round_title_text+$ID(current_round_name+"_rules").innerHTML;
        $ID("round_number").innerHTML = String(this.round_number)+"/"+String(this.round_order.length);
    }

    start_countdown = function() {
        $ID("input_form").css("display", "block");
        $ID("gameplay_buttons").css("display", "none");
        $ID("user_input_field").disabled = false;
        $ID("user_input_field").value = "";
        $ID("input_validation").innerHTML = "0";
		$ID("input_validation").className = "invalid_input";
        $ID("end_timer").disabled = false;

        if (this.current_round_type == "L") {
            $ID("input_validation").css("display", "inline");
            $ID("user_input_field").addEventListener("keyup", window.current_game.new_validate_user_input);
        }
        else if (this.current_round_type == "N") {
            // Display this number on the page
            for (let tn of document.getElementsByClassName("tn_cell")) tn.style.display='block';
            $ID("target_number").innerHTML = String(window.numbers_round.target_number);
        }
        // Conundrum
        else {
            let scram = window.conundrum_round.clue.split("");
            let to_write = "";
            for (let scramletter of scram) {
                to_write += "<td>"+scramletter+"</td>";
            }
            $ID("letters_or_numbers_box").innerHTML = to_write;
            $ID("input_validation").css("display", "inline");
            $ID("user_input_field").addEventListener("keyup", window.current_game.new_validate_user_input);

        }
        let rt = this.current_round_type
        window.timer = window.setInterval(function(){window.current_game.tick(rt)}, 1000);
        $ID("user_input_field").focus();
    }

    tick = function(round_type) {
        if ($ID("input_form").style.display != "block") {
            $ID("input_form").css("display", "block");
            $ID("user_input_field").focus();
        }
        window.game_time = window.game_time - 1;
        let padding_space = "";
        if (window.game_time < 10) {
            $ID("timer_seconds").className = "time_running_out";
            //padding_space = "<span style=\"visibility:hidden;\">1</span>";
        }
        $ID("timer_seconds").innerHTML = padding_space+String(window.game_time);

        // When time has run out
        if (window.game_time < 1) {
            window.clearInterval(window.timer);
            $ID("end_timer").disabled = true;
            $ID("user_input_field").disabled = true;
            $ID("timer_seconds").className = "";
            $ID("rules_box").innerHTML = "";
            let points_scored;
            let results_msg = "";

            switch(round_type) {
                case "L":
                    window.letters_round.check_answer();
                    points_scored = window.letters_round.points;
                    window.game_stats['letters_score'] = points_scored;
                    window.game_stats['letters_user_word'] = window.letters_round.user_word;
                    $ID("user_input_field").removeEventListener("keyup", this.new_validate_user_input);
                    break;

                case "N":
                    window.numbers_round.check_answer();
                    points_scored = window.numbers_round.points;
                    window.game_stats['numbers_score'] = points_scored;
                    window.game_stats['numbers_target'] = window.numbers_round.target_number;
                    results_msg = window.numbers_round.results_message;
                    break;

                case "C":
                    window.conundrum_round.check_answer();
                    points_scored = window.conundrum_round.points;
                    window.game_stats['conundrum_score'] = points_scored;
                    window.game_stats['conundrum_clue'] = window.conundrum_round.clue;
                    window.game_stats['conundrum_answer'] = window.conundrum_round.answer.toUpperCase();
                    $ID("user_input_field").removeEventListener("keyup", this.new_validate_user_input);
                    break;

                default:
                    break;
            }
            
            $ID("input_form").css("display", "none");
            this.total_points = this.total_points+points_scored;
            $ID("total_points").innerHTML = this.total_points;
            $ID("results_box").innerHTML = "<p>You scored <strong>"+String(points_scored)+"</strong> points.</p>"+results_msg+$ID("results_box").innerHTML;
            
            if (round_type == "L") {
                $ID("results_box").innerHTML +=
                '<div id="letters_solutions_box"><button id="show_letters_solutions" onclick="this.innerHTML=\'Loading...\';this.disabled=true;window.letters_round.check_for_solutions();window.letters_round.display_solutions();this.style.display=\'none\';">Show Possible Solutions (7+ Letters)</button></div>';
            }

            $ID("next_round_button").css("display", "inline");

            // If the game is over
            if (this.round_number == this.round_order.length) {
                window.game_stats['game_completed'] = true;
                let time_game_ended = Math.round(Date.now()/1000);
                
                window.game_stats['time_to_complete'] = time_game_ended-window.game_stats['game_start_time'];
                $ID("results_box").innerHTML+="<p>Final Score: <strong>"+String(this.total_points)+"</strong></p>"
                $ID("new_game").css("display", "block");
                $ID("next_round_button").css("display", "none");
                navigator.sendBeacon('analytics.php', JSON.stringify(window.game_stats));
            }
        }
    }

    end_timer = function() {
        window.game_time = 1;
    }

    new_validate_user_input = function() {
        // If somehow this function gets called during the Numbers round,
        // where it--at least at the present time--is not needed then immediately end the function
        if (window.current_game.current_round_type == "N") return;

        const IS_LETTERS_ROUND = (window.current_game.current_round_type == "L");
        let class_obj = (IS_LETTERS_ROUND) ? window.letters_round : window.conundrum_round;
        let iv = $ID("input_validation");
        $ID("user_input_field").value = $ID("user_input_field").value.replace(/\s+/g, "");
        let user_letters_str = $ID("user_input_field").value.toLowerCase();
        let user_letters = user_letters_str.split('');
        if (user_letters.length < 1) {
            iv.innerHTML = "0";
            iv.className = "invalid_input";
            return;
        }
        // Array
        let given_letters = (IS_LETTERS_ROUND) ? class_obj.chosen_letters : class_obj.clue.split('');
        // Sort the arrays alphabetically
        user_letters.sort();
        given_letters.sort();
    
        if (IS_LETTERS_ROUND) {
            for (let current_letter of user_letters) {
                current_letter = current_letter.toUpperCase();
                // 6-14-2024: bug where I can't seem to get the Event Listener for input validation removed for the Numbers round
                // As soon as the user types open parentheses "(" it triggers and error in the occurences_of function
                // Therefore immediately end the function if we encounter one
                if (current_letter == "(") return;
                let too_many_letters = (occurences_of(current_letter, user_letters_str.toUpperCase()) > occurences_of(current_letter, given_letters));
                let invalid_letter = (given_letters.indexOf(current_letter) < 0);
                if (invalid_letter || too_many_letters) {
                    class_obj.user_input_valid = false;
                    break;
                }
                else {
                    class_obj.user_input_valid = true;
                }
            }
        }
        // For the Conundrum the input is valid only if the user's word uses the exact 9 letters of the clue
        // Which does not necessarily mean the right answer of course!
        else {
            class_obj.user_input_valid = (user_letters.join("") == given_letters.join(""));
        }
        // Finally, display the number of characters in the color that indicates if the input is valid
        //let iv = $ID("input_validation");
        iv.innerHTML = String(user_letters.length);
        iv.className = (class_obj.user_input_valid) ? "valid_input" : "invalid_input";
        //return is_valid_input;*/
    }
}


function init() {

    // Define a few global variables
    window.letters_round_word_lists = {
        "three_letter_words": new Set(),
        "four_letter_words": new Set(),
        "five_letter_words": new Set(),
        "six_letter_words": new Set(),
        "seven_letter_words": new Set(),
        "eight_letter_words": new Set(),
        "nine_letter_words": new Set()
    }
    
    window.conundrum_word_lists = {
        "six_letter_words": new Set(),
        "three_letter_words": new Set(),
        "four_letter_words": new Set(),
        "five_letter_words": new Set(),
        "nine_letter_words": new Set()
    }
    
    fetch(CONUNDRUM_WORD_LIST_FILE).then(res => res.text()).then((data) => {
        c_word_list = data.split(/\s+/);
        for (let word of c_word_list) {
            switch(word.length) {
                case 3:
                    conundrum_word_lists.three_letter_words.add(word);
                    break;
                case 4:
                    conundrum_word_lists.four_letter_words.add(word);
                    break;
                case 5:
                    conundrum_word_lists.five_letter_words.add(word);
                    break;
                case 6:
                    conundrum_word_lists.six_letter_words.add(word);
                    break;
                case 9:
                    conundrum_word_lists.nine_letter_words.add(word);
                    break;
                default:
                    break;
            }
    }
    });

    fetch(LETTERS_ROUND_WORD_LIST_FILE).then(res => res.text()).then((data) => {
    
        for (let word of data.split(/\s+/)) {
            switch(word.length) {
                case 3:
                    window.letters_round_word_lists.three_letter_words.add(word);
                    break;            
                case 4:
                    window.letters_round_word_lists.four_letter_words.add(word);
                    break;            
                case 5:
                    window.letters_round_word_lists.five_letter_words.add(word);
                    break;            
                case 6:
                    window.letters_round_word_lists.six_letter_words.add(word);
                    break;            
                case 7:
                    window.letters_round_word_lists.seven_letter_words.add(word);
                    break;
                case 8:
                    window.letters_round_word_lists.eight_letter_words.add(word);
                    break;
                case 9:
                    window.letters_round_word_lists.nine_letter_words.add(word);
                    break;
                default:
                    break;
            }
        }
    $ID("start_game").css("display", "none");
    window.current_game = new Countdown();
    window.games_played = 1;
    window.game_stats = 
    {
        'game_uid': SESSION_ID+'-'+String(window.games_played),
        'session_id': SESSION_ID,
        'game_start_time': Math.round(Date.now()/1000),
        'game_completed': false
    };
    });
}

function new_game() {
    delete window.current_game;
    window.current_game = new Countdown();
    window.games_played++;
    window.game_stats = 
    {
        'game_uid': SESSION_ID+'-'+String(window.games_played),
        'session_id': SESSION_ID,
        'game_start_time': Math.round(Date.now()/1000),
        'game_completed': false
    };

}

function create_empty_cells(n) {
    let html = "";
    let i = 0;
    while (i < n) {
        html += "<td>&nbsp;&nbsp;</td>";
        i++;
    }
    return html;
}

window.onload = function() {
    window.SESSION_ID = Date.now().toString(36) + Math.random().toString(36).slice(2);
}