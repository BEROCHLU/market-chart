<?php
    $t = $_GET["t"];
    $r = $_GET["r"];
    $i = $_GET["i"];
    exec("python3 /virtual/pleasecov/public_html/pipm/wakeup.py $t $r $i", $arrOut);
    header("Content-Type: application/json; charset=utf-8");
    echo $arrOut[0];
?>
