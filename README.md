<img title="" src="./doc/icon.png" alt="" data-align="center" width="164">

---

<h1 align="center">Bade</h1>

**可视化库集合**

- `bade-mind` 脑图、思维导图`js`核心

- `bade-mind-react` 脑图React封装实现

---

## Init

```shell
# npm install
npm i
# lerna bootstrap
npm run bootstrap
```

## Compile

```shell
node ./scripts/compile.js
```

### watch mode

监听模式

```shell
node ./scripts/compile.js -w
```

### scope

限定编译范围到某一个包

```shell
node ./scripts/compile.js -s=bade-mind-react
```

## Publish

```shell
node ./scripts/compile.js 

npx lerna publish
```

## Demo

每一个包对应目录下

- `parcel` 快速运行测试

```shell
npm run demo
```


