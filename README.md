# Qiandao Lake Travel Plan

千岛湖 6 人高铁到站租车自驾互动地图。

## 访问地址

GitHub Pages 部署完成后访问：

```text
https://tancle00789.github.io/Qiandao-Lake-Travel-plan/
```

## 页面内容

- 7/21 - 7/24 上海虹桥往返千岛湖站高铁信息
- 千岛湖花田墅湖景度假别墅住宿节点
- 三套方案切换：
  - 方案 A：新手稳妥度假版
  - 方案 B：西北半环湖经典版
  - 方案 C：夏日玩水游船版
- 地图标点与每日路线连线
- 单司机、大 7 座 SUV、停车与还车安全规则

## 地图模式

默认打开为离线示意地图，不需要 API Key。

如需调用真实地图，可在 URL 后追加参数：

### 高德地图

```text
?provider=amap&key=你的高德JSAPIKey&scode=你的高德安全密钥
```

完整示例：

```text
https://tancle00789.github.io/Qiandao-Lake-Travel-plan/?provider=amap&key=xxx&scode=xxx
```

### 百度地图

```text
?provider=baidu&ak=你的百度地图AK
```

完整示例：

```text
https://tancle00789.github.io/Qiandao-Lake-Travel-plan/?provider=baidu&ak=xxx
```

## API Key 安全说明

GitHub Pages 是纯静态站，前端 API Key 不可能真正隐藏。公开使用高德或百度地图时，建议在开放平台后台设置 Referer 白名单，只允许：

```text
https://tancle00789.github.io/Qiandao-Lake-Travel-plan/*
```

或至少限制在：

```text
https://tancle00789.github.io/*
```

## 文件结构

```text
.
├── index.html
├── README.md
├── .nojekyll
└── .github/workflows/deploy-pages.yml
```

页面是单文件静态应用，HTML / CSS / JS / 路线数据全部内联在 `index.html` 中。

## 部署说明

仓库内置 GitHub Actions Pages 部署 workflow。若首次访问 404，请进入：

`Settings → Pages → Build and deployment → Source`

选择：

```text
GitHub Actions
```

然后重新运行 `Deploy GitHub Pages` workflow。
