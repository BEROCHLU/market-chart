<?php
    // Input validation is needed here
    $t = escapeshellarg($_GET["t"]);
    $r = escapeshellarg($_GET["r"]);
    $i = escapeshellarg($_GET["i"]);

    $command = "~/local/python38/bin/python3.8 ~/public_html/pipm/wakeup.py $t $r $i";
    $result = exec($command, $arrOut, $returnVar);
    
    header("Content-Type: application/json; charset=utf-8");
    if($returnVar !== 0) {
        echo json_encode(['error' => 'Script execution failed', 'message' => implode("\n", $arrOut)]);
    } else {
        echo $arrOut[0];
    }
    
?>
