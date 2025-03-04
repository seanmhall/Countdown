<?php
# COUNTDOWN ANALYTICS #

# Set to "true" for debugging
# Will automatically be set to "true" if script is run on localhost
$FLAT_FILE = false;

$forward = $_SERVER['HTTP_X_FORWARDED_FOR']??null;
$remote_addr = $_SERVER['REMOTE_ADDR']??null;
$user_agent = $_SERVER['HTTP_USER_AGENT']??null;

if ($remote_addr == '127.0.0.1') {
    $FLAT_FILE = true;
}

$params = json_decode(file_get_contents('php://input'), true) or die("FATAL ERROR: Could not load POST data");

$session_id = $params['session_id'];
$game_uid = $params['game_uid'];
$game_start_time = $params['game_start_time'];
$game_completed = $params['game_completed'];
$time_to_complete = $params['time_to_complete'];
$letters_score = $params['letters_score'];
$letters_selected = $params['letters_selected'];
$letters_user_word = $params['letters_user_word'];
$numbers_score = $params['numbers_score'];
$numbers_selected = $params['numbers_selected'];
$numbers_equation = $params['numbers_equation'];
$numbers_target = $params['numbers_target'];
$conundrum_score = $params['conundrum_score'];
$conundrum_clue = $params['conundrum_clue'];
$conundrum_answer = $params['conundrum_answer'];
$conundrum_user_word = $params['conundrum_user_word'];

$parameters = [$game_uid, $session_id, $remote_addr, $forward, $user_agent, $game_start_time, $game_completed, $time_to_complete, $letters_score, $letters_selected, $letters_user_word, $numbers_score, $numbers_selected, $numbers_target, $numbers_equation, $conundrum_score, $conundrum_answer, $conundrum_clue, $conundrum_user_word];

if ($FLAT_FILE) {
    $fp = fopen("log_$game_uid.html", 'w');
    fwrite($fp, print_r($parameters, true));
    fclose($fp);
}
else {
    $databaseHost = 'localhost';
    $databaseUsername = '***********';
    $databasePassword = '***************';
    $databaseName = '*****************';

    $conn = new mysqli($databaseHost, $databaseUsername, $databasePassword, $databaseName);

    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }

    #echo '<strong>Connected!</strong><br>'.$output;
    $stmt = $conn->prepare("INSERT INTO countdown_analytics (game_uid, session_id, user_ip, user_ip_forwarded, user_agent, game_start_time, game_completed, time_to_complete, letters_score, letters_selected, letters_user_word, numbers_score, numbers_selected, numbers_target, numbers_equation, conundrum_score, conundrum_answer, conundrum_clue, conundrum_user_word) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("sssssiiiissisisisss", $game_uid, $session_id, $remote_addr, $forward, $user_agent, $game_start_time, $game_completed, $time_to_complete, $letters_score, $letters_selected, $letters_user_word, $numbers_score, $numbers_selected, $numbers_target, $numbers_equation, $conundrum_score, $conundrum_answer, $conundrum_clue, $conundrum_user_word);
    $stmt->execute();
    $conn->close();
}
?>