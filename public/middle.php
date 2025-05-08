<?php
function run_py($script, $args) {
    // コマンド組み立て
    $command = "~/local/python38/bin/python3.8 $script " . implode(" ", $args);

    // パイプ定義
    $descriptors = [
        0 => ["pipe", "r"],  // stdin
        1 => ["pipe", "w"],  // stdout
        2 => ["pipe", "w"]   // stderr
    ];

    // プロセスをオープン
    $process = proc_open($command, $descriptors, $pipes);

    if (is_resource($process)) {
        // 標準出力と標準エラーを取得
        $output = stream_get_contents($pipes[1]);
        $error = stream_get_contents($pipes[2]);
        
        // パイプを閉じる
        fclose($pipes[0]);
        fclose($pipes[1]);
        fclose($pipes[2]);

        // プロセスを閉じる
        $return_var = proc_close($process);

        // 成功時
        if ($return_var === 0) {
            return ['status' => 'success', 'output' => $output];
        } else {
            return ['status' => 'error', 'message' => $error];
        }
    } else {
        return ['status' => 'error', 'message' => 'Failed to start process'];
    }
}

// 実行
$t = escapeshellarg($_GET["t"]);
$r = escapeshellarg($_GET["r"]);
$i = escapeshellarg($_GET["i"]);
$result = run_py("~/public_html/pipm/wakeup.py", [$t, $r, $i]);

// JSONで返す
header("Content-Type: application/json; charset=utf-8");
echo json_encode($result);
?>
