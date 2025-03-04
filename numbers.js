
class Numbers_Game {
    
    constructor() {
        // Make sure everything is set up for a new game
        // Clear any existing fields, re-enable any disabled buttons, etc
        //$ID("numbers_round_buttons").css("display", "inline");
        $ID("input_validation").css("display", "none");
        $ID("user_input_field").removeEventListener("keyup", window.current_game.new_validate_user_input);
        $ID("smallnum_button").disabled = false;
        $ID("bignum_button").disabled = false;
        $ID("end_timer").disabled = true;
        $ID("target_number").innerHTML = "";
        $ID("letters_or_numbers_box").innerHTML = "";
        this.big_numbers = shuffle([25,50,75,100]);
        let smalls = [];
        // Add two copies of each integer 1-10 to the temporary array, then shuffle them
        for (let i=1;i<11;i++) {
            smalls.push(i);
            smalls.push(i);
        } 
        this.small_numbers = shuffle(smalls);
        this.chosen_nums = [];
        this.points = 0;
        this.target_number = 0;
        this.results_message = "";

        //Generate a random number that will be the target the user is aiming for
        let min = 101;
        let max = 999;
        this.target_number = Math.floor(Math.random() * (max - min)) + min;

    }

    select_number = function (big=false) {
        // If there are already 6 numbers selected don't select any more
        if (this.chosen_nums.length >= 6) return;

        // If user has not chosen at least one number disable the Small Number button
        if (this.chosen_nums.length == 4 && this.big_numbers.length < 1) {
            $ID("smallnum_button").disabled = true;
            big = true;
        }
        // Likewise, if the user for whatever reason selected all four Big Numbers, disable the Big Number button
        if (this.big_numbers.length < 1) {
            $ID("bignum_button").disabled = true;
            big = false;
        }

        // Remove the last element of either the big or small number array and add it to our chosen number array
        // Then display this number on the page
        let the_number = big ? this.big_numbers.pop() : this.small_numbers.pop();
        this.chosen_nums.push(the_number);
        let current_cell = $ID("letters_or_numbers_box").getElementsByTagName("td")[this.chosen_nums.length-1];
        current_cell.innerHTML = String(the_number);

        // As soon as the last number is selected we generate the target number and the clock starts ticking
        // Log the chosen numbers here specifically before the array gets reset
        if (this.chosen_nums.length == 6) {
            window.game_stats['numbers_selected'] = this.chosen_nums.join(",");
            window.current_game.start_countdown();
        }
    }

    // Sample that uses all numbers: (4*100)+(50/2)-(7-6) = 424
    check_answer = function () {
        let solution = $ID("user_input_field").value;

        // First remove any whitespace
        solution = solution.replace(/\s+/g, '');

        // If the field is blank end the function -- 0 points
        if (solution == "") { return; }

        // Needs input sanitation because we're using the eval() function
        // Only accepted characters are integers, ASMD operators (+,-,*,/), and parentheses
        // The second condition is to check for exponents (**)
        // Another thing to note is that Parentheses multiplication does not work, e.g. 2*(5-1) instead of 2(5-1)
        if (solution.match(/[^\d\+\-\*\/\(\)]/g) !== null || solution.match(/\*{2,}/g)) {
            this.results_message = "The equation you entered contains one or more illegal characters.";
            return;
        }
        // Log the user's equation
        window.game_stats['numbers_equation'] = solution;
        let solved_equation;
        // We're checking if the equation is even syntactically valid in the first place
        // If not, we can end the function
        try {
            solved_equation = eval(solution);
        }
        catch {
            this.results_message = "Your equation contains a syntax error and could not be calculated.<br><code class='bad_equation'>"+solution+"</code>";
            return;
        }
        // No decimal points allowed!
        if (solved_equation % 1 !== 0) {
            this.results_message = "Your result is not a whole number!";
            return;
        }
        // If the equation has invalid input, this will be used to highlight what specifically caused it to be invalid
        let problematic_number;
        // Loop through each number in the user's equation and first check if it exists among the chosen numbers
        // If not, end the function (0 points). If it does exist, *remove* it from that array
        // This way we can ensure that the user hasn't used any numbers more times than they appear in the chosen numbers
        for (let n of solution.match(/\d+/g)) {
            n = Number(n);
            let n_index = this.chosen_nums.indexOf(n);
            if (n_index < 0) {
                this.results_message = "<strong>"+String(n)+"</strong> is not one of the given numbers or it has already been used.<br>";
                //this.results_message += `<code class="bad_equation">`
                problematic_number = n;

                return;
            }
            this.chosen_nums.splice(n_index, 1);
        }
        
        // The absolute value (abs) of the difference between the target and what the user provided
        let diff = Math.abs(this.target_number-solved_equation);
        if (diff === 0) this.points = 10; // 10 for reaching it exactly
		else if (diff >= 1 && diff <=5) this.points = 7; // 7 for being 1–5 away
		else if (diff >=6 && diff <=10) this.points = 5; // 5 for being 6–10 away
		else this.points = 0; // Contestants score no points for being more than 10 away

        this.results_message = `<code>${solution}=<strong>${solved_equation}</strong></code>`;
    }
}