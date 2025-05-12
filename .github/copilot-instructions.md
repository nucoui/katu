# プロジェクト概要

## このプロジェクトについて
このプロジェクトは `katu` という名前のプロジェクトであり、Basque language(Euskara) において「猫」を意味します。
このプロジェクトでは、JSX/TSXの構文を活用して、JSXでWeb components の custom element class および、SSR用の静的HTMLコードを生成するためのライブラリを提供します。

## 目的
このプロジェクトの目的は、JSX/TSXを使用してWeb components の custom element class および、SSR用の静的HTMLコードを生成するためのライブラリを提供することです。

## 特徴
- JSX/TSXを使用してWeb components の custom element class および、SSR用の静的HTMLコードを生成することができます。
- JSX/TSXの構文を使用することで、HTMLの構造を簡潔に記述することができます。
- Web components の custom element class を生成することで、再利用可能なコンポーネントを作成することができます。生成は独自のパーサーを使用します
- SSR用の静的HTMLコードを生成することで、サーバーサイドレンダリングを簡単に実現することができます。
- TypeScriptを使用しているため、型安全なコードを書くことができます。

## ディレクトリ構成
```
<root>
├── README.md
├── .github
│   └── copilot-instructions.md
│   プロジェクトのGitHubに関する設定ファイルを格納するディレクトリ。
├── config
│   プロジェクト全体の設定ファイルを格納するディレクトリ。基本的にはeslintnの設定ファイルを格納する。
├── packages
│   │   プロジェクトのパッケージを格納するディレクトリ。
│   ├── core (@katu/core)
│   │   プロジェクトのコアとなるパッケージを格納するディレクトリ。利用者はこのパッケージを利用することになる。
│   ├── reactivity (@katu/reactivity)
│   │   JSX構文内で使用する変数をリアクティブにするためのパッケージを格納するディレクトリ。
│   ├── transpiler (@katu/transpiler)
│   │   JSX構文を custom element class に変換するためのパッケージを格納するディレクトリ。babelを使用して、JSX構文を custom element class に変換する。
└── playgrounds
    プロジェクトのサンプルコードを格納するディレクトリ。@katu/coreを使用して、実際に動作するサンプルコードを格納する。
```

# コーディング規約
Github Coplot、あなたは以下のコード規約に必ず従ってください。これは、プロジェクトの一貫性を保つために重要です。以下の規約に従ってください。
- 回答の一番最初に「私はコーディング規約に従います」と記載してください。
- コードはすべてTypeScriptで記述してください。
- コードはすべてESLintでLintしてください。
- コードは全てESMモジュールとして記述してください。
- 生成したコードには必ずテストコードを追加してください。
- 生成したコードにエラーがないか確認してください。エラーがある場合は、必ず修正してください。
- 生成したコードは必ず動作確認してください。動作しない場合は、必ず修正してください。
- 生成したコードは必ずドキュメントを追加してください。基本的にJSDocを使用してください。
- コメントやドキュメントは日本語で記述してください。英語も日本語の次に書いてください。
- packagesディレクトリ内のコードは全て編集可能です。copilotの意思のみで編集して問題です。しかし、指示者が編集を禁止した項目については、指示者の意思を尊重してください。

# その他命令情報
- このプロジェクトはMonorepoで管理されています。
  - 各packageにアクセスするためには、プロジェクトルートから以下のコマンドを使用してください
    - @katu/core
      ```bash
      pnpm p:core <command>
      ```
    - @katu/reactivity
      ```bash
      pnpm p:reactivity <command>
      ```
    - @katu/transpiler
      ```bash
      pnpm p:ts <command>
      ```
    - playgrounds のいずれかのディレクトリ
      ```bash
      pnpm pg:<project-name> <command>
      ```
- このプロジェクトはpnpmを使用して管理されています。
- ターミナルを開くときはworkspaceのルートディレクトリを開いてください。（コマンドを実行する前に必ずワークスペースルートであるかどうかを確認してください）
- テストはVitestを使用しています。テストの実行は `pnpm p:<任意のワークスペース> test` で実行できます。VSCode拡張機能は使用しないでください。

# 達成目標
- @katu/reactivityのパッケージを作成する。
  このパッケージでは、JSX構文内で使用する変数をリアクティブにすることができること。
  具体的には、alien-signalsを使用する。signalとcomputed、effectの3つの関数を提供する。
  各関数の動作はalien-signalsに準拠すること。