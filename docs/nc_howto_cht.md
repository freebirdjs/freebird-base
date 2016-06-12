如何設計 netcore
========================

本文件說明如何將底層之網路控制模組包裝成 - 可以為 freebird 所用的 netcore。  

## 1. 什麼是 netcore?

Netcore 是一個網路控制器，它實作了 freebird 所定義的各種網路管理方法。俱備了這些方法，freebird 便可以順利執行所需的網路控制與管理之功能。  

## 2. 統一裝置/物品模型

  
Freebird 使用兩種統一資料模型來表示實際的裝置與物品。裝置的定義是一種通訊裝置，例如 zigbee 模組。物品的定義是實作於裝置上的應用，例如一個 zigbee 模組上實作有兩個燈泡，那麼我們就會說這一包東西，它使用了 1 個 device，在它之上有 2 個 gadgets。  

* 裝置類別(Device Class)  
    - 關於一個 device 內的資料，首重網路方面的資訊，你可以使用 device 的方法 setNetInfo() 來設定它的網路資訊  
    - device 還有一些附帶資訊，例如製造廠商、硬體版本號等，則使用 device 的方法 setAttrs() 來設定  
<br />

* 物品類別(Gadget Class)  
    - 關於一個 gadget 內的資料，首重應用方面的資訊，你可以使用 gadget 的方法 sePanelInfo() 來設定它的網路資訊  
    - gadget 的應用，必定有與其狀態相關的屬性。它到底具有哪些屬性，則必須依照 panelInfo() 所定義的 class 來決定  
    - classId 應遵照 IPSO 所提供的 18 種 Objects 來定義其名  
    - 一旦開發者決定了 classId，則還有填滿其屬性的責任，要填滿屬性，必須使用 gadget 的方法 setAttrs() 來設定  

## 3. Netcore 開發者的責任

1. 每次當 netcore 準備好時，開發者應調用 nc.commitReady() 以通知 freebird 它已經就緒 (當底層全新開機、重開機、軟/硬重置，底層須使用此 API 往上通知)
2. 需實作 cookRawDev() 與 cookRawGad() 兩支介面方法，告訴 freebird 如何將底層的 device 或 gadget 的 raw data objects 轉換成 Device Class 與 Gadget Class 的物件。在實作的內容中，開發者必須使用到 dev.setNetInfo()、 dev.setAttrs()、 gad.setPanelInfo() 以及 gad.setAttrs() 來完成裝置與物品的設定  
3. 需實作網路管理、裝置控制與物品控制的驅動程式，這三類的驅動程式必須分別使用 netcore 的方法 nc.registerNetDrivers()、nc.registerDevDrivers() 以及 nc.registerGadDrivers() 來將驅動程式向 netcore 註冊。 當 netcore 啟動時 (start())，會檢查驅動程式是否齊備，若不齊備，netcore 將會拋出錯誤，以提醒開發者必須善盡驅動程式實作的責任  
4. 當底層有新裝置進入網路時，開發者必須調 nc.commitDevIncoming() 通知 netcore 有裝置入網  
5. 當裝置入網時，開發者有責任依據某些規則，一一地找出裝置上的應用有哪些，並產生一一對應的 gadget raw data，然後調用 nc.commitGadIncoming() 通知 netcore  
6. 當有裝置離開網路，開發者有責任告訴 netcore 是哪一個裝置離開了，這必須透過調用 nc.commitDevLeaving() 來完成  
7. 當底層接收到有關 device 的屬性變化或通知時，必須使用 commitDevReporting() 向 netcore 報告  
8. 當底層接收到有關 gadget(應用) 的屬性變化或通知時，必須使用 commitGadReporting () 向 netcore 報告  
9. 當底層接受到有關 device 的 net 相關變化時，應調用 nc.commitDevNetChanging() 向 netcore 報告。此處所指之 net 相關變化包括 { role, parent, maySleep, sleepPeriod, address: { dynamic } }  

一旦開發者滿足了這些要求，netcore 就能在 freebird 框架中順利工作

## 4. 統一裝置模型: 裝置實例的資料設定

要設定裝置的 network information，請使用 dev.setNetInfo()；欲設定裝置屬性，則使用 dev.setAttrs()

### dev.setNetInfo(info)  
* info 物件接受的欄位如下表，其中只有 address 欄位為必填，address 是一個物件，內有永久位址(permanent)與動態位址(dynamic)必須填寫。  
* role 是該裝置的網路角色，依據不同的協定可能有不同的字串來表示其地位，例如 zigbee 可能使用 'router'、'end-device'，而 BLE 可能使用 'central'、'peripheral' 等字眼，字串到底是甚麼完全是由開發者所定義
* parent 是該裝置父節點的永久位址，如果不是 mesh 網路，所有裝置可能都是中央集權至 netcore，即 netcore 是所有節點的父節點，那麼該欄位請填字串 '0'，預設也是這個值
* maySleep 是用於載明這個裝置是否可能進入睡眠狀態，預設是 false。如果你確定裝置可能會睡眠，請為該裝置的此欄位設為 true，因這會牽涉到 freebird 如何確認裝置是否上線的演算法
* sleepPeriod 僅有當 maySleep 設為 true 時有效，當你明確知道裝置的睡眠周期，請設定該週期之秒數。 Freebird 會藉此調整它的線上狀態檢查演算法

  
| Property     | Type    | Mandatory | Description                                   |
|--------------|---------|-----------|-----------------------------------------------|
| role         | String  | optional  |                                               |
| parent       | String  | optional  |                                               |
| maySleep     | Boolean | optional  |                                               |
| sleepPeriod  | Number  | optional  |                                               |
| address      | Object  | required  | { permanent, dynamic }                        |


### dev.setAttrs(attrs)  
* 這裡所有欄位皆為 optional，但應該盡量填寫。要滿足這些欄位，過程可能需要 remotely request 幾次才會得到所有欄位的資訊

| Property     | Type    | Mandatory | Description                                   |
|--------------|---------|-----------|-----------------------------------------------|
| manufacturer | String  | optional  |                                               |
| model        | String  | optional  |                                               |
| serial       | String  | optional  |                                               |
| version      | Object  | optional  | { hw, sw, fw }  硬體, 軟體, 韌體版本號          |
| power        | Object  | optional  | { type, voltage }                             |


## 5. 統一物品模型: 物品實例的資料設定

要設定物品的 panel information，請使用 gad.setPanelInfo()；欲設定物品屬性，則使用 gad.setAttrs()。 

### dev.setPanelInfo(info)
* Panel info 的意思是，一個物品的身上好像都有一塊牌子，上面載明了自己是什麼東西，該物件目前只有兩個欄位，一個是 profile，可填可不填。另一個是 classId，為必填，因為它將說明這個 gadget 到底會對應到實際上的什麼東西，例如一顆燈、一個溫度感測器、或是一個電源開關。  
  

| Property     | Type    | Mandatory | Description                                   |
|--------------|---------|-----------|-----------------------------------------------|
| profile      | String  | optional  | Server name                                   |
| classId      | String  | required  | Permanent address                             |
  

* 目前接受的 classId 共有 18 種 (IPSO定義)，它們分別是字串
    - 'dIn' (數位輸入), 'dOut' (數位輸出)  
    - 'aIn' (類比輸入), 'aOut' (類比輸出)  
    - 'generic' (通用型感測器), 'illuminance' (照度感測器), 'presence' (障礙感測器), 'temperature' (溫度感測器), 'humidity' (濕度感測器)  
    - 'pwrMea' (功率量測單元)  
    - 'actuation' (作動器), 'setPoint' (刻度設定器), 'loadCtrl' (負載控制器), 'lightCtrl' (燈控), 'pwrCtrl' (電源開關)  
    - 'accelerometer' (加速計), 'magnetometer' (磁力儀), 'barometer' (晴雨錶)

* 有一些實際的感測器，若找不到對應，則採用 'generic' classId ，然後利用其實例屬性 appType 欄位來指明真正用途，例如 appType = 'currentSensor'  ([TODO] 是否要製表?)
