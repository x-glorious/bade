module.exports = {
  extends: ['prettier', 'plugin:prettier/recommended'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      modules: true
    },
    ecmaVersion: 6,
    sourceType: 'module'
  },
  plugins: ['@typescript-eslint', 'prettier', 'simple-import-sort', 'sort-keys-fix'],
  rules: {
    // 优先使用 interface 而不是 type
    '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],

    // tab = 2
    '@typescript-eslint/indent': ['error', 2],

    // 强制使用===
    eqeqeq: ['error', 'always'],

    // jsx使用双引号
    'jsx-quotes': ['error', 'prefer-double'],

    // 禁止使用 var
    'no-var': 'error',

    // 优先箭头函数
    'prefer-arrow-callback': 'warn',

    'prettier/prettier': ['error'],

    'react/jsx-uses-react': 'off',

    'react/react-in-jsx-scope': 'off',

    // import 导入规范
    'simple-import-sort/exports': 'error',

    'simple-import-sort/imports': [
      'error',
      {
        groups: [
          // react 放到最前方
          ['react'],
          // Packages.
          // Things that start with a letter (or digit or underscore), or `@` followed by a letter.
          ['^@?\\w'],
          // Absolute imports and other imports such as Vue-style `@/foo`.
          // Anything not matched in another group.
          ['^'],
          // Relative imports.
          // Anything that starts with a dot.
          ['^\\.'],
          // scss、css 样式文件放到最后面
          ['\\.(scss|css)$']
        ]
      }
    ],

    'sort-imports': 'off',
    // 对象属性按升序排列
    'sort-keys': ['error', 'asc', { caseSensitive: true, minKeys: 2, natural: false }],
    'sort-keys-fix/sort-keys-fix': 'warn'
  }
}
