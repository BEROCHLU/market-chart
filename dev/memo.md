# XREA Free（レガシーLinux）でのPythonバージョンアップ対策メモ

## 背景
- 標準でPython 3.6がインストールされているが、サポート外過ぎて使い物にならない。
- Python 3.10 ではメモリ不足や `gcc(8.5)` のPGOエラーでインストール不可。
- **Python 3.8** でのインストールが安定。

## 注意点

- **GCC 9.0以上**ならPGO（Profile Guided Optimization）は安定しているが、それ未満では問題が多い。
- `--enable-optimizations` オプションを外すのがシンプルな解決策。

---

## インストール手順

```sh
wget https://www.python.org/ftp/python/3.8.17/Python-3.8.17.tgz
tar xzf Python-3.8.17.tgz
cd Python-3.8.17

./configure --prefix=$HOME/local/python38 --disable-shared
make -j2
make install
```

### オプション（PATHの設定）

```sh
echo 'export PATH=$HOME/local/python38/bin:$PATH' >> ~/.bashrc
```

### シェルに反映

```sh
source ~/.bashrc
```

---

## 動作確認

```sh
python3.8 --version
pip3.8 --version
```

---

> **ポイント**
> - `--enable-optimizations` は指定しない（GCC 8.5以下のため）。
> - メモリ不足回避のため、`make -j2` などコア数も控えめに。