<?php
// レスポンスをJSONに設定
header("Content-Type: application/json; charset=utf-8");

// 必須パラメータのリスト
$required = ['t', 'r', 'i'];
$params = [];

// パラメータの存在と簡易バリデーション（例：英数字のみ許可）
foreach ($required as $key) {
    if (!isset($_GET[$key]) || !preg_match('/^[\w\-]{1,9}$/', $_GET[$key])) {
        http_response_code(400);
        echo json_encode([
            'error' => "Invalid or missing parameter: $key"
        ]);
        exit;
    }
    $params[$key] = escapeshellarg($_GET[$key]);
}

// コマンド組み立て
$command = "~/local/python38/bin/python3.8 ~/public_html/pipm/wakeup.py {$params['t']} {$params['r']} {$params['i']}";

// コマンド実行
exec($command, $output, $returnVar);

// 結果の返却
if ($returnVar !== 0) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Script execution failed',
        'message' => implode("\n", $output)
    ]);
} else {
    // 出力がJSONであることを想定
    echo $output[0];
}
?>
