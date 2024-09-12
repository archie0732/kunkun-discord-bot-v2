# kunkun bot command

## 基本指令

- ping

獲取自己與客戶端的延遲

```md
/ping
```

- draw

抽選一位使用者在此伺服器中

```md
/draw2486
```

## 訂閱功能

目前支援以下網站

1. nhentai.net
2. manhuagui.com (看漫畫網站)
3. hanime1.me

### nhentai

可以追蹤自己喜歡的作者，在其發布作品時收到通知並觀看

- 訂閱 nehntai: 訂閱一位作者，在他發布作品時發出通知

選項

1. artist: 作者名稱(在作品的標籤中的 artist)/(必填)
2. language: 選擇要看漫畫的語言(必填)

```md
/sub_nhentai <artist> <language>
```

- 取消訂閱 nehntai: 取消訂閱作者

選項

1. artist: 作者名稱(必填)

```md
/rm_nhentai <artist>
```

### manhuagui

追蹤漫畫作品，並在其更新新作發布通知  
請參考: [https://www.manhuagui.com/]

- 訂閱漫畫

選項

1. id: 該作品於 [https://www.manhuagui.com/] 上的 id(必填)

例如咒術回戰在 manhuagui 的網址: [https://www.manhuagui.com/comic/28004/] 則他的 id 為 `28004`

```md
/sub_manhuagui <id>
```

- 取消訂閱漫畫

選項

1. id: 該作品於 [https://www.manhuagui.com/] 上的 id(必填)

```md
/rm_manhuagui <id>
```

### hanime1

追蹤動漫作品在作者發布新作時發布通知  
請參考[]

- 訂閱 hanime1

選項

1. artist: 作者名稱(必填)

```pwsh
/sub_hanime1 <artist>
```

- 取消訂閱作者

選項

1. artist: 作者名稱(必填)

```md
/rm_hanime1
```
