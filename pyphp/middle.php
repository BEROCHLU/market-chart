<?php
    $t = $_GET["t"];
    $r = $_GET["r"];
    exec("python3 /virtual/pleasecov/public_html/pipm/wakeup.py $t $r", $arrOut);
    header("Content-Type: application/json; charset=utf-8");
    echo $arrOut[0];
?>
