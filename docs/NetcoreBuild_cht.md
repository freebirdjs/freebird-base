如何設計 netcore
========================

本文件說明如何將底層之網路控制模組包裝成 - 可以為 freebird 所用的 netcore。  

<a name="Netcore"></a>
<br />
********************************************
## 1. 什麼是 netcore?

Netcore 是一個網路控制器，它應該提供 freebird 所定義的各種網路管理方法之實作。俱備了這些方法，freebird 便可以順利執行所需的網路控制與管理之功能。  

<a name="Data_Model"></a>
<br />
********************************************
## 2. 統一裝置/物品模型

Freebird 使用兩種統一資料模型來表示實際的**裝置 (device)**與**物品 (gadget)**。裝置的定義是一種通訊裝置，例如 zigbee 模組。物品的定義是實作於裝置上的應用，例如一個 zigbee 模組上實作有兩個燈泡，那麼我們就會說這一包東西，它使用了 1 個 device (zigbee 模組)，在它之上有 2 個 gadgets (燈泡)。  

* **裝置類別** [**(Device Class)**](https://github.com/freebirdjs/freebird-base/blob/master/docs/DeviceClass.md)  
    - 關於一個 device 內的資料，首重**網路**方面的資訊，你可以使用 device 的方法 `dev.set('net', netInfoObj)` 來設定它的網路資訊。  
    - device 還有一些附帶資訊，例如製造廠商、硬體版本號等，則使用 device 的方法 `dev.set('attrs', devAttrsObj)` 來設定。  
    - `netInfoObj` 與 `devAttrsObj` 之格式列於[第 4 節](#Info_Dev)。  

* **物品類別** [**(Gadget Class)**](https://github.com/freebirdjs/freebird-base/blob/master/docs/GadgetClass.md)  
    - 關於一個 gadget 內的資料，首重**應用**方面的資訊，你可以使用 gadget 的方法 `gad.set('panel', panelInfoObj)` 來設定它的基本資訊。  
    - gadget 的應用，必定有與其狀態相關的屬性。至於一個 gadget 應該擁有哪些基本屬性，則由 `panelInfoObj` 所定義的 `classId` 所決定。  
    - `classId` 應遵照 IPSO 所提供的 51 種 [**Objects**](http://www.ipso-alliance.org/ipso-community/resources/smart-objects-interoperability/) 來定義其名，[smartobject](https://github.com/PeterEB/smartobject) 的[**這份文件**](https://github.com/PeterEB/smartobject/blob/master/docs/templates.md)列出了支援的 Object Ids，這份文件也指出了一個 gadget 所必須擁有的屬性。  
    - 一旦開發者決定了 `classId`，則還有填滿 gadget 屬性的責任。要填滿屬性，必須使用 gadget 的方法 `gad.set('attrs', gadAttrsObj)` 來加以設定。  
    - `panelInfoObj` 與 `gadAttrsObj` 之格式列於[第 5 節](#Info_Gad)。  

<a name="Developers"></a>
<br />
********************************************
## 3. Netcore 開發者的責任

1. 每次當 netcore 啟動並準備好時，開發者應該呼叫 `nc.commitReady()` 以通知 freebird 它已經就緒 (當底層全新開機、重開機、軟/硬重置，底層須使用此 API 往上通知)。  
2. 需實作 `nc._cookRawDev()` 與 `nc._cookRawGad()` 兩支介面方法，告訴 freebird 如何將底層的 device 或 gadget 的 raw data objects 轉換成 Device Class 與 Gadget Class 的物件。在實作的內容中，開發者必須使用到 `dev.set('net', netInfoObj)`、 `dev.set('attrs', devAttrsObj)`、`gad.set('panel', panelInfoObj)` 以及 `gad.set('attrs', gadAttrsObj)` 來完成裝置與物品的設定。  
3. 需實作網路管理、裝置控制與物品控制的驅動程式。這三類的驅動程式必須分別使用 netcore 的方法 `nc.registerNetDrivers()`、`nc.registerDevDrivers()` 以及 `nc.registerGadDrivers()` 來將驅動程式向 netcore 註冊。 當 netcore 啟動時 (`start()`)，會檢查驅動程式是否齊備，若不齊備，netcore 將會拋出錯誤，以提醒開發者必須善盡驅動程式實作的責任。  
4. 當底層有新裝置進入網路時，開發者必須調用 `nc.commitDevIncoming()` 通知 netcore 有裝置入網。  
5. 當裝置入網時，開發者有責任**自己依據某些規則，一一地找出裝置上的應用有哪些**，並產生一一對應的 gadget raw data，然後呼叫 `nc.commitGadIncoming()` 通知 netcore。  
6. 當有裝置離開網路，開發者有責任呼叫 `nc.commitDevLeaving()` 來告訴 netcore 是哪一個裝置離開了。  
7. 當底層接收到有關 device 的屬性變化或通知時，必須使用 `nc.commitDevReporting()` 向 netcore 報告。  
8. 當底層接收到有關 gadget (應用) 的屬性變化或通知時，必須使用 `nc.commitGadReporting()` 向 netcore 報告。  
9. 當底層接收到有關 device 的 net 相關變化時，應調用 `nc.commitDevNetChanging()` 向 netcore 報告。此處所指之 net 相關變化包括 `{ role, parent, maySleep, sleepPeriod, status, address: { dynamic } }` 的其中任何一項屬性。  

一旦開發者滿足了這些要求，netcore 就能在 freebird 框架中順利工作。總結來說，一個 netcore 實作者必須提供以下實作內容：  

### 轉換程式

* `nc._cookRawDev(dev, rawDev, done)`
    - 根據 `rawDev` 的資料內容，以 `dev.set('net')` 及 `dev.set('attrs')` 填寫裝置屬性，完成後呼叫 `done(err, dev)` 將填滿內容的 `dev` 送給 netcore。
* `nc._cookRawGad(gad, rawGad, done)`
    - 根據 `rawGad` 的資料內容，以 `gad.set('panel')` 及 `gad.set('attrs')` 填寫物品屬性，完成後呼叫 `done(err, gad)` 將填滿內容的 `gad` 送給 netcore。

### 驅動程式

* 網路驅動程式，將驅動程式以 `{ start, stop, reset, permitJoin, remove, ban, unban, ping }` 物件包裝後，使用 `nc.registerNetDrivers(netDrvs)` 向 netcore 註冊。  
* 裝置操作驅動程式，將驅動程式以 `{ read, write, identify }` 物件包裝後，使用 `nc.registerDevDrivers(devDrvs)` 向 netcore 註冊。  
* 物品操作驅動程式，將驅動程式以 `{ read, write, exec, writeReportCfg, readReportCfg }` 物件包裝後，使用 `nc.registerGadDrivers(gadDrvs)` 向 netcore 註冊。  

#### 網路驅動程式各方法之簽署與說明

* `start: function (done) {}`
    - 啟動網路控制器，完成啟動程序後實作者需呼叫 `done(err)`。  
* `stop: function (done) {}`
    - 停止網路控制器，完成停止程序後實作者需呼叫 `done(err)`。  
* `reset: function (mode, done) {}`
    - 重置網路控制器，其中 `mode` 為 `1` 表示硬重置，而 `0` 為軟重置 。完成停止程序後實作者需呼叫 `done(err)`。  
* `permitJoin: function (duration, done) {}`
    - 使網路控制器允許裝置加入網路，其中 `duration` 為開放之秒數，當設為 `0` 時表示立即關閉。當完成開放程序後，實作者需呼叫 `done(err, timeLeft)`，其中投入之參數 `timeLeft` 用以指示開放剩餘之秒數，傳回 0 表示立即關閉。  
* `remove: function (permAddr, done) {}`
    - 移除裝置，呼叫此方法應將裝置踢出網路，其中 `permAddr` 為裝置之永久位址。移除裝置後，實作者需呼叫 `done(err, permAddr)`，其中 `permAddr` 為被移除裝置之永久位址。  
* `ban: function (permAddr, done) {}`
    - 封鎖裝置，其中 `permAddr` 為裝置之永久位址。此方法為 optional。若被封鎖之裝置先前已存在於網路中，應先將其踢出網路再進行封鎖。封鎖裝置後，實作者需呼叫 `done(err, permAddr)`，其中 `permAddr` 為被封鎖裝置之永久位址。  
* `unban: function (permAddr, done) {}`
    - 解除封鎖裝置，其中 `permAddr` 為裝置之永久位址。此方法為 optional。解除封鎖裝置後，實作者需呼叫 `done(err, permAddr)`，其中 `permAddr` 為被解除封鎖裝置之永久位址。  
* `ping: function (permAddr, done) {}`
    - 測試裝置回應，其中 `permAddr` 為裝置之永久位址。裝置成功回應後，實作者需呼叫 `done(err, time)`，其中 `time` 為發出檢測至收到響應的 round-trip time，單位為 milliseconds。  

#### 裝置操作驅動程式各方法之簽署與說明

* `read: function (permAddr, attrName, done) {}`
    - 讀取裝置屬性，其中 `permAddr` 為裝置之永久位址、`attrName` 為屬性之名稱。當遠端傳回讀值之響應後，實作者需呼叫 `done(err, val)`，其中 `val` 為該屬性之值。  
* `write: function (permAddr, attrName, val, done) {}`
    - 寫入裝置屬性，其中 `permAddr` 為裝置之永久位址、`attrName` 為屬性之名稱而 `val` 為欲寫入之值。當遠端傳回響應後，實作者需呼叫 `done(err[, val])`，其中 `val` 為該屬性成功寫入後之值，`val` 可選擇傳回或不傳回，建議應傳回。  
* `identify: function (permAddr, done) {}`
    - 使裝置進入辨識模式，其中 `permAddr` 為裝置之永久位址。由於並非所有遠端裝置皆有實作此功能，此驅動程式為 optional。如果您同時是遠端裝置的實作者，建議應實作「辨識模式」的功能。當裝置進入辨識模式時，可能以閃爍 LED 或發出聲響來協助使用者辨認所選裝置。  

#### 物品操作驅動程式各方法之簽署與說明

* `read: function (permAddr, auxId, attrName, done) {}`
    - 讀取物品屬性，其中 `permAddr` 為裝置之永久位址、`auxId` 為輔助 id、`attrName` 為屬性之名稱。當遠端傳回讀值之響應後，實作者需呼叫 `done(err, val)`，其中 `val` 為該屬性之值。  
* `write: function (permAddr, auxId, attrName, val, done) {}`
    - 寫入物品屬性，其中 `permAddr` 為裝置之永久位址、`auxId` 為輔助 id、`attrName` 為屬性之名稱而 `val` 為欲寫入之值。當遠端傳回響應後，實作者需呼叫 `done(err[, val])`，其中 `val` 為該屬性成功寫入後之值，`val` 可選擇傳回或不傳回，建議應傳回。  
* `exec: function (permAddr, auxId, attrName, args, done) {}`
    - 遠端執行物品上之程序，其中 `permAddr` 為裝置之永久位址、`auxId` 為輔助 id、`attrName` 為屬性之名稱而 `args` 為執行遠端程序所需之參數陣列。  
* `readReportCfg: function (permAddr, auxId, attrName, done) {}`
    - 讀取物品屬性之報告設定，其中 `permAddr` 為裝置之永久位址、`auxId` 為輔助 id、`attrName` 為屬性之名稱。當遠端傳回設定之響應後，實作者需呼叫 `done(err, cfg)`，其中 `cfg` 為該屬性之報告設定。  
* `writeReportCfg: function (permAddr, auxId, attrName, cfg, done) {}`
    - 設定物品屬性之報告設定，其中 `permAddr` 為裝置之永久位址、`auxId` 為輔助 id、`attrName` 為屬性之名稱而 `cfg` 為該屬性的報告設定物件。當遠端傳回設定之響應後，實作者需呼叫 `done(err, result)`，其中 `result` 之布林值用以表明設定成功 (true) 或失敗 (false)。  

<a name="Info_Dev"></a>
<br />
********************************************
## 4. 統一裝置模型: 裝置實例的資料設定

要設定裝置的 network information，請使用 `dev.set('net', netInfoObj)`；欲設定裝置屬性，則使用 `dev.set('attrs', devAttrsObj)`。  

### dev.set('net', netInfoObj)
* `netInfoObj` 物件接受的欄位如下表，其中只有 `address` 欄位為必填，`address` 是一個物件，內有永久位址 (permanent) 與動態位址 (dynamic) 必須填寫。  

| Property     | Type    | Mandatory | Description                                                                                                                                                                        |
|--------------|---------|-----------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| address      | Object  | Required  | 裝置位址紀錄物件 `{ permanent, dynamic }`，為必填。其中 `permanent` 與 `dynamic` 分別為永久位址及動態位置，皆為必填。`permanent` 位址只能是字串，而 `dynamic` 位址可以是字串或數字 |
| role         | String  | Optional  | 裝置的網路角色，依據不同的協定可能有不同的字串來表示其地位，例如 zigbee 可能使用 `'router'`、`'end-device'`，而 BLE 可能使用 `'central'`、`'peripheral'`                           |
| parent       | String  | Optional  | 裝置父節點的永久位址，如果不是 mesh 網路，所有裝置可能都是中央集權至 netcore，即 netcore 是所有節點的父節點，那麼該欄位請填字串 '0'，預設也是這個值                                |
| maySleep     | Boolean | Optional  | 用於載明這個裝置是否可能進入睡眠狀態，預設是 `false`。如果你確定裝置可能會睡眠，請為該裝置的此欄位設為 `true`，因這會牽涉到 freebird 如何確認裝置是否上線的演算法                  |
| sleepPeriod  | Number  | Optional  | 僅有當 `maySleep` 設為 `true` 時有效，當你明確知道裝置的睡眠周期，請設定該週期之秒數。 Freebird 會藉此調整它的線上狀態檢查演算法                                                   |


### dev.set('attrs', devAttrsObj)
* `devAttrsObj` 內的所有欄位皆為 optional，但應該盡量填寫。要滿足這些欄位，過程可能需要 remotely request 幾次才會得到所有欄位的資訊。  

| Property     | Type    | Mandatory | Description                                                                                                                                                                              |
|--------------|---------|-----------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| manufacturer | String  | Optional  | 製造商名稱或識別子                                                                                                                                                                       |
| model        | String  | Optional  | 硬體模組型號                                                                                                                                                                             |
| serial       | String  | Optional  | 硬體番號或流水碼                                                                                                                                                                         |
| version      | Object  | Optional  | 此物件 `{ hw, sw, fw }` 之各屬性用於紀錄硬體 (hw)、軟體 (sw) 及韌體 (fw) 之版本號，版本號皆必須為**字串**                                                                                |
| power        | Object  | Optional  | 此物件 `{ type, voltage }` 用於紀錄硬體之供電類型，其中 `type` 屬性接受 `'line'`, `'battery'` 或 `'harvester'` 三種字串來表示供電形式，而 `voltage` 則以含單位之字串填寫之，例如 `'5 V'` |

<a name="Info_Gad"></a>
<br />
********************************************
## 5. 統一物品模型: 物品實例的資料設定

要設定物品的 panel information，請使用 `gad.set('panel', panelInfoObj)`；欲設定物品屬性，則使用 `gad.set('attrs', gadAttrsObj)`。  

### gad.set('panel', panelInfoObj)
* Panel information 的意思是，一個物品的身上好像都有一塊牌子，上面載明了自己是什麼東西，該物件 `panelInfoObj` 目前只有兩個欄位，一個是 `profile`，可填可不填，而另一個 `classId` 為必填。因為 `classId` 將說明這個 gadget 到底是什麼樣的東西，例如一顆燈、一個溫度感測器、或是一個電源開關。  

| Property     | Type    | Mandatory | Description                                                                                                                        |
|--------------|---------|-----------|------------------------------------------------------------------------------------------------------------------------------------|
| classId      | String  | Required  | 此物品的分類識別子，目前僅接受 IPSO 所定義的 [51 種智慧物件](https://github.com/PeterEB/smartobject/blob/master/docs/templates.md)，classId 請使用 Object Id 的字串值來填寫，例如 `'dIn'`, `'aIn'`, `'generic'`, `'temperature'`, `'humidity'` 等 |
| profile      | String  | Optional  | 此物品的 profile，例如 `'HA'`                                                                                                      |

* 目前接受的 classId 共有 51 種 (IPSO定義)，它們分別是字串：
    - `'dIn'` (數位輸入), `'dOut'` (數位輸出)  
    - `'aIn'` (類比輸入), `'aOut'` (類比輸出)  
    - `'generic'` (通用型感測器), `'illuminance'` (照度感測器), `'presence'` (障礙感測器), `'temperature'` (溫度感測器), `'humidity'` (濕度感測器)  
    - `'pwrMea'` (功率量測單元)  
    - `'actuation'` (作動器), `'setPoint'` (刻度設定器), `'loadCtrl'` (負載控制器), `'lightCtrl'` (燈控), `'pwrCtrl'` (電源開關)  
    - `'accelerometer'` (加速計), `'magnetometer'` (磁力儀), `'barometer'` (晴雨錶)
    - `'voltage'` (電壓), `'current'` (電流), `'frequency'` (頻率), `'depth'` (深度), `'percentage'` (百分比), `'altitude'` (高度), `'load'` (負載), `'pressure'` (壓力)
    - `'loudness'` (響度), `'concentration'` (濃度), `'acidity'` (酸鹼度), `'conductivity'` (導電度), `'power'` (功率), `'powerFactor'` (功率因素), `'distance'` (距離)
    - `'energy'` (能量), `'direction'` (方向), `'time'` (時間), `'gyrometer'` (陀螺儀), `'colour'` (顏色), `'gpsLocation'` (位置), `'positioner'` (定位器), `'buzzer'` (響鈴)
    - `'audioClip'` (音效檔), `'timer'` (計時器), `'addressableTextDisplay'` (可定址文字顯示器), `'onOffSwitch'` (二元開關), `'levelControl'` (幅度控制器)
    - `'upDownControl'` (上下控制器), `'multipleAxisJoystick'` (多軸搖桿), `'rate'` (速率), `'pushButton'` (按鈕), `'multistateSelector'` (多狀態選擇器)

* 有一些實際的感測器，若找不到對應，則採用 `'generic'` classId ，然後利用其實例屬性 `appType` 欄位來指明真正用途，例如 `appType = 'some kind of sensor'`。  

<a name="APIs"></a>
<br />
********************************************
## 6. APIs

### 建構式
* Netcore
    - [new Netcore()](#API_Netcore)

### 實作者提供

* Netcore
    - [_cookRawDev()](#API__cookRawDev)
    - [_cookRawGad()](#API__cookRawGad)
    - [start()](#API_start)
    - [stop()](#API_stop)
    - [reset()](#API_reset)
    - [permitJoin()](#API_permitJoin)
    - [remove()](#API_remove)
    - [ban()](#API_ban)
    - [unban()](#API_unban)
    - [ping()](#API_ping)

* Device
    - [read()](#API_read)
    - [write()](#API_write)
    - [identify()](#API_identify)

* Gadget
    - [read()](#API_read)
    - [write()](#API_write)
    - [exec()](#API_exec)
    - [readReportCfg()](#API_readReportCfg)
    - [writeReportCfg()](#API_writeReportCfg)

###  實作者呼叫

* Netcore
    - [registerNetDrivers()](#API_registerNetDrivers)
    - [registerDevDrivers()](#API_registerDevDrivers)
    - [registerGadDrivers()](#API_registerGadDrivers)
    - [commitReady()](#API_commitReady)
    - [commitDevNetChanging()](#API_commitDevNetChanging)
    - [commitDevIncoming()](#API_commitDevIncoming)
    - [commitDevLeaving()](#API_commitDevLeaving)
    - [commitGadIncoming()](#API_commitGadIncoming)
    - [commitDevReporting()](#API_commitDevReporting)
    - [commitGadReporting()](#API_commitGadReporting)
    - [dangerouslyCommitGadReporting()](#API_dangerouslyCommitGadReporting)

<br />
********************************************
<br />
## 建構式
### Netcore

<a name ="API_Netcore"></a>
********************************************
### new Netcore(name, controller, protocol[, opt])

產生新的 netcore 實例。建議使用 freebird-base 的 `createNetcore()` 方法來產生新的 netcore 實例。  

**Arguments:**  

1. `name` (_String_): netcore 名稱。  
2. `controller` (_Object_): 底層網路控制模組，例如 `ble-shepherd`。  
3. `protocol` (_Object_): 使用的協定資訊。  

    | Property | Type   | Mandatory | Description          |
    |----------|--------|-----------|----------------------|
    | phy      | String | Required  | Physic layer         |
    | dll      | String | Optional  | Data link layer      |
    | nwk      | String | Required  | Network layer        |
    | tl       | String | Optional  | Transportation layer |
    | sl       | String | Optional  | Session layer        |
    | pl       | String | Optional  | Presentation layer   |
    | apl      | String | Optional  | Application layer    |

4. `opt` (_Object_): 預留使用。  

**Returns:**  

* (_Object_): netcore  

**Examples:**  
  
```js
var BShepherd = require('ble-shepherd'),
    fbBase = require('freebird-base'),
    Netcore = fbBase.Netcore,
    controller = new BShepherd('noble');

var nc = new Netcore('freebird-netcore-ble', controller, {
    phy: 'ieee802.15.1',
    nwk: 'ble',
});

// 建議使用 .createNetcore()
var nc = fbBase.createNetcore('freebird-netcore-ble', controller, {
    phy: 'ieee802.15.1',
    nwk: 'ble'
});
```

<br />
********************************************
<br />
## 實作者提供
### Netcore

<a name ="API__cookRawDev"></a>
********************************************
### _cookRawDev(dev, rawDev, done)

將底層 `rawDev` 資料物件的內容，以 `dev.set('net')` 及 `dev.set('attrs')` 填寫[**裝置屬性**](https://github.com/freebirdjs/freebird-base/blob/master/docs/NetcoreBuild_cht.md#Info_Dev)，最後呼叫 `done(err, dev)` 回傳給 netcore。  

**Arguments:**  

1. `dev` (_Object_): deivce 實例。  
2. `rawDev` (_Object_): 原始 device 資料物件。  
3. `done` (_Function_): `function (err, dev) {}`。將 `dev` 回傳給 netcore。  

**Returns:**  

* _none_  

**Examples:**  
  
```js
nc._cookRawDev = function (dev, rawDev, done) {
    dev.set('net', {
        role: 'router',
        maySleep: false,
        address: {  // 必填
            permanent: rawDev.ieeeAddr,
            dynamic: rawDev.nwkAddr,
        }
    });

    dev.set('attrs', {
        manufacturer: rawDev.manufacturerName,
        model: rawDev.modelNum
    });

    done(null, dev);
};
```

<a name ="API__cookRawGad"></a>
<br />
********************************************
### _cookRawGad(gad, rawGad, done)

將底層 `rawGad` 資料物件的內容，以 `gad.set('panel')` 及 `gad.set('attrs')` 填寫[**物品屬性**](https://github.com/freebirdjs/freebird-base/blob/master/docs/NetcoreBuild_cht.md#Info_Gad)，最後呼叫 `done(err, gad)` 回傳給 netcore。  

**Arguments:**  

1. `gad` (_Object_): gadget 實例。  
2. `rawGad` (_Object_): 原始 gadget 資料物件。  
3. `done` (_Function_): `function (err, gad) {}`。將 `gad` 回傳給 netcore。  

**Returns:**  

* _none_  

**Examples:**  
  
```js
nc._cookRawGad = function (gad, rawGad, done) {
    gad.set('panel', {
        profile: 'home',
        classId: 'presence'
    });

    gad.set('attrs', {
        dInState: 5500,
        counter: 5501,
        counterReset: 5505
    });

    done(null, gad);
};
```

<a name ="API_start"></a>
<br />
********************************************
### start(callback)

啟動網路控制器。  

**Arguments:**  

1. `callback` (_Function_): `function (err) {}`。  

**Returns:**  

* _none_  

**Examples:**  
  
```js
var netDrvs = {
    start: function (callback) {
        // ...實作

        callback(null);  // 最後呼叫
    },
    ...
};
```

<a name ="API_stop"></a>
<br />
********************************************
### stop(callback)

停止網路控制器。  

**Arguments:**  

1. `callback` (_Function_): `function (err) {}`。  

**Returns:**  

* _none_  

**Examples:**  
  
```js
var netDrvs = {
    stop: function (callback) {
        // ...實作

        callback(null);  // 最後呼叫
    },
    ...
};
```

<a name ="API_reset"></a>
<br />
********************************************
### reset(mode, callback)

重置網路控制器。  

**Arguments:**  

1. `mode` (_Number_): `mode` 為 `1` 表示硬重置，而 `0` 為軟重置 。  
2. `callback` (_Function_): `function (err) {}`。  

**Returns:**  

* _none_  

**Examples:**  
  
```js
var netDrvs = {
    reset: function (mode, callback) {
        // ...實作

        callback(null);  // 最後呼叫
    },
    ...
};
```

<a name ="API_permitJoin"></a>
<br />
********************************************
### permitJoin(duration, callback)

透過網路控制器允許裝置加入網路。  

**Arguments:**  

1. `duration` (_Number_): 開放加入之秒數，當設為 `0` 時表示立即關閉。  
2. `callback` (_Function_): `function (err, timeLeft) {}`。`timeLeft` (_Number_) 用以指示開放剩餘之秒數，傳回 `0` 表示立即關閉。  

**Returns:**  

* _none_  

**Examples:**  
  
```js
var netDrvs = {
    permitJoin: function (duration, callback) {
        // ...實作

        callback(null, timeLeft);  // 最後呼叫
    },
    ...
};
```

<a name ="API_remove"></a>
<br />
********************************************
### remove(permAddr, callback)

移除裝置，透過網路控制器將該裝置踢出網路。  

**Arguments:**  

1. `permAddr` (_String_): 裝置永久位址，如 `'0x0123456789'`。  
2. `callback` (_Function_): `function (err, permAddr) {}`。`permAddr` (_String_) 為被移除裝置之永久位址。  

**Returns:**  

* _none_  

**Examples:**  
  
```js
var netDrvs = {
    remove: function (permAddr, callback) {
        // ...實作

        callback(null, permAddr);  // 最後呼叫
    },
    ...
};
```

<a name ="API_ban"></a>
<br />
********************************************
### ban(permAddr, callback)

封鎖裝置，此驅動為 optional。  

**Arguments:**  

1. `permAddr` (_String_): 裝置永久位址，如 `'0x0123456789'`。  
2. `callback` (_Function_): `function (err, permAddr) {}`。`permAddr` (_String_) 為被封鎖裝置之永久位址。  

**Returns:**  

* _none_  

**Examples:**  
  
```js
var netDrvs = {
    ban: function (permAddr, callback) {
        // ...實作

        callback(null, permAddr);  // 最後呼叫
    },
    ...
};
```

<a name ="API_unban"></a>
<br />
********************************************
### unban(permAddr, callback)

解除封鎖裝置，此驅動為 optional。

**Arguments:**  

1. `permAddr` (_String_): 裝置永久位址，如 `'0x0123456789'`。  
2. `callback` (_Function_): `function (err, permAddr) {}`。`permAddr` (_String_) 為被解除封鎖裝置之永久位址。  

**Returns:**  

* _none_  

**Examples:**  
  
```js
var netDrvs = {
    unban: function (permAddr, callback) {
        // ...實作

        callback(null, permAddr);  // 最後呼叫
    },
    ...
};
```

<a name ="API_ping"></a>
<br />
********************************************
### ping(permAddr, callback)

測試裝置回應。  

**Arguments:**  

1. `permAddr` (_String_): 裝置永久位址，如 `'0x0123456789'`。  
2. `callback` (_Function_): `function (err, time) {}`。`time` (_Number_) 為發出檢測至收到響應的 round-trip time。  

**Returns:**  

* _none_  

**Examples:**  
  
```js
var netDrvs = {
    ping: function (permAddr, callback) {
        // ...實作

        callback(null, time);  // 最後呼叫
    },
    ...
};
```

<br />
********************************************
<br />
### Device  

<a name ="API_read"></a>
********************************************
### read(permAddr, attrName, callback)

讀取裝置屬性值。  

**Arguments:**  

1. `permAddr` (_String_): 裝置永久位址，如 `'0x0123456789'`。  
2. `attrName` (_String_): 屬性名稱。  
3. `callback` (_Function_): `function (err, data) {}`。`data` (_Depends_) 為該屬性之值。  

**Returns:**  

* _none_  

**Examples:**  
  
```js
var devDrvs = {
    read: function (permAddr, attrName, callback) {
        // ...實作

        callback(null, data);  // 最後呼叫
    },
    ...
};
```

<a name ="API_write"></a>
<br />
********************************************
### write(permAddr, attrName, val, callback)

寫入裝置屬性值。  

**Arguments:**  

1. `permAddr` (_String_): 裝置永久位址，如 `'0x0123456789'`。  
2. `attrName` (_String_): 屬性名稱。  
3. `val` (_Depends_): 欲寫入之值。  
4. `callback` (_Function_): `function (err[, data]) {}`。`data` (_Depends_) 為該屬性成功寫入後之值，可選擇傳回或不傳回，建議應傳回。  

**Returns:**  

* _none_  

**Examples:**  
  
```js
var devDrvs = {
    write: function (permAddr, attrName, val, callback) {
        // ...實作

        callback(null[, data]);  // 最後呼叫
    },
    ...
};
```

<a name ="API_identify"></a>
<br />
********************************************
### identify(permAddr, callback)

使裝置進入辨識模式，此驅動為 optional。當裝置進入辨識模式時，可能以閃爍 LED 或發出聲響來協助使用者辨認所選裝置。  

**Arguments:**  

1. `permAddr` (_String_): 裝置永久位址，如 `'0x0123456789'`。  
2. `callback` (_Function_): `function (err, permAddr) {}`。`permAddr` (_String_) 為進入辨識模式裝置之永久位址。  

**Returns:**  

* _none_  

**Examples:**  
  
```js
var devDrvs = {
    identify: function (permAddr, callback) {
        // ...實作

        callback(null, permAddr);  // 最後呼叫
    },
    ...
};
```

<br />
********************************************
<br />
### Gadget

<a name ="API_read"></a>
********************************************
### read(permAddr, auxId, attrName, callback)

讀取遠端裝置上物品之屬性值。  

**Arguments:**  

1. `permAddr` (_String_): 裝置永久位址，如 `'0x0123456789'`。  
2. `auxId` (_String_ | _Number_): 物品之輔助 id。  
3. `attrName` (_String_): 屬性名稱。  
4. `callback` (_Function_): `function (err, data) {}`。`data` (_Depends_) 為該屬性之值。  

**Returns:**  

* _none_  

**Examples:**  
  
```js
var gadDrvs = {
    read: function (permAddr, auxId, attrName, callback) {
        // ...實作

        callback(null, data);  // 最後呼叫
    },
    ...
};
```

<a name ="API_write"></a>
<br />
********************************************
### write(permAddr, auxId, attrName, val, callback)

遠端寫入屬性值至該物品。  

**Arguments:**  

1. `permAddr` (_String_): 裝置永久位址，如 `'0x0123456789'`。  
2. `auxId` (_String_ | _Number_): 物品之輔助 id。  
3. `attrName` (_String_): 屬性名稱。  
4. `callback` (_Function_): `function (err[, data]) {}`。`data` (_Depends_) 為該屬性成功寫入後之值，可選擇傳回或不傳回，建議應傳回。  

**Returns:**  

* _none_  

**Examples:**  
  
```js
var gadDrvs = {
    write: function (permAddr, auxId, attrName, val, callback) {
        // ...實作

        callback(null[, data]);  // 最後呼叫
    },
    ...
};
```

<a name ="API_exec"></a>
<br />
********************************************
### exec(permAddr, auxId, attrName, args, callback)

遠端執行物品上之程序，此驅動為 optional。  

**Arguments:**  

1. `permAddr` (_String_): 裝置永久位址，如 `'0x0123456789'`。  
2. `auxId` (_String_ | _Number_): 物品之輔助 id。  
3. `attrName` (_String_): 屬性名稱。  
4. `args` (_Array_): 執行遠端程序所需之參數陣列。  
5. `callback` (_Function_): `function (err, result) {}`。`result` (_Depends_) 可為任意值，取決於遠端韌體實作。

**Returns:**  

* _none_  

**Examples:**  
  
```js
var gadDrvs = {
    exec: function (permAddr, auxId, attrName, args, callback) {
        // ...實作

        callback(null, result);  // 最後呼叫
    },
    ...
};
```

<a name ="API_readReportCfg"></a>
<br />
********************************************
### readReportCfg(permAddr, auxId, attrName, callback)

讀取物品屬性之報告設定，此驅動為 optional。

**Arguments:**  

1. `permAddr` (_String_): 裝置永久位址，如 `'0x0123456789'`。  
2. `auxId` (_String_ | _Number_): 物品之輔助 id。  
3. `attrName` (_String_): 屬性名稱。  
4. `callback` (_Function_): `function (err, cfg) {}`。`cfg` (_Object_) 為該屬性之報告設定。

**Returns:**  

* _none_  

**Examples:**  
  
```js
var gadDrvs = {
    readReportCfg: function (permAddr, auxId, attrName, callback) {
        // ...實作

        callback(null, cfg);  // 最後呼叫
    },
    ...
};
```

<a name ="API_writeReportCfg"></a>
<br />
********************************************
### writeReportCfg(permAddr, auxId, attrName, cfg, callback)

設定物品屬性之報告設定，此驅動為 optional。

**Arguments:**  

1. `permAddr` (_String_): 裝置永久位址，如 `'0x0123456789'`。  
2. `auxId` (_String_ | _Number_): 物品之輔助 id。  
3. `attrName` (_String_): 屬性名稱。  
4. `cfg` (_Object_): 該屬性的報告設定物件。  
5. `callback` (_Function_): `function (err, result) {}`。`result` (_Boolean_) 用以表示設定成功 (true) 或失敗 (false)。  

**Returns:**  

* _none_  

**Examples:**  
  
```js
var gadDrvs = {
    writeReportCfg: function (permAddr, auxId, attrName, cfg, callback) {
        // ...實作

        callback(null, result);  // 最後呼叫
    },
    ...
};
```

<br />
********************************************
<br />
##  實作者呼叫
### Netcore

<a name ="API_registerNetDrivers"></a>
********************************************
### registerNetDrivers(netDrvs)

向 netcore 註冊網路驅動程式。  

**Arguments:**  

1. `netDrvs` (_Object_): netcore 所需要的所有網路驅動程式。  

    | Property   | Type     | Mandatory |
    |------------|----------|-----------|
    | start      | Function | Required  |
    | stop       | Function | Required  |
    | reset      | Function | Required  |
    | permitJoin | Function | Required  |
    | remove     | Function | Required  |
    | ping       | Function | Required  |
    | ban        | Function | Optional  |
    | unban      | Function | Optional  |

**Returns:**  

* (_Object_): netcore  

**Examples:**  
  
```js
var netDrvs = {
    start: function (callback) {},
    stop: function (callback) {},
    reset: function (mode, callback) {},
    permitJoin: function (duration, callback) {},
    remove: function (permAddr, callback) {},
    ping: function (permAddr, callback) {}
};

nc.registerNetDrivers(netDrvs);
```

<a name ="API_registerDevDrivers"></a>
<br />
********************************************
### registerDevDrivers(devDrvs)

向 netcore 註冊裝置操作驅動程式。  

**Arguments:**  

1. `devDrvs` (_Object_): netcore 所需要的所有裝置操作驅動程式。  

    | Property | Type     | Mandatory |
    |----------|----------|-----------|
    | read     | Function | Required  |
    | write    | Function | Required  |
    | identify | Function | Optional  |

**Returns:**  

* (_Object_): netcore  

**Examples:**  
  
```js
var devDrvs = {
    read: function (permAddr, attrName, callback) {},
    write: function (permAddr, attrName, val, callback) {}
};

nc.registerDevDrivers(devDrvs);
```

<a name ="API_registerGadDrivers"></a>
<br />
********************************************
### registerGadDrivers(gadDrvs)

向 netcore 註冊物品操作驅動程式。  

**Arguments:**  

1. `gadDrvs` (_Object_): netcore 所需要的所有物品操作驅動程式。  

    | Property       | Type     | Mandatory |
    |----------------|----------|-----------|
    | read           | Function | Required  |
    | write          | Function | Required  |
    | exec           | Function | Optional  |
    | readReportCfg  | Function | Optional  |
    | writeReportCfg | Function | Optional  |

**Returns:**  

* (_Object_): netcore  

**Examples:**  
  
```js
var gadDrvs = {
    read: function (permAddr, auxId, attrName, callback) {},
    write: function (permAddr, auxId, attrName, val, callback) {}
};

nc.registerGadDrivers(gadDrvs);
```

<a name ="API_commitReady"></a>
<br />
********************************************
### commitReady()

每次當 netcore 啟動並準備好時，應呼叫此方法，以通知 netcore 它已經就緒。  

**Arguments:**  

* _none_  

**Returns:**  

* _none_  

**Examples:**  
  
```js
nc.commitReady();
```

<a name ="API_commitDevNetChanging"></a>
<br />
********************************************
### commitDevNetChanging(permAddr, changes)

當底層接收到有關 device 的 net 相關變化時呼叫。  

**Arguments:**  

1. `permAddr` (_String_): 裝置永久位址，如 `'0x0123456789'`。  
2. `changes` (_Object_): 改變的屬性，為 `{ role, parent, maySleep, sleepPeriod, status, address: { dynamic } }` 其中任何一項。  

**Returns:**  

* (_Boolean_): 是否成功通知 freebird 框架。  

**Examples:**  
  
```js
nc.commitDevNetChanging('0x0123456789', { status: 'online' });
```

<a name ="API_commitDevIncoming"></a>
<br />
********************************************
### commitDevIncoming(permAddr, rawDev)

當底層有新裝置加入網路時呼叫此方法通知 netcore。  

**Arguments:**  

1. `permAddr` (_String_): 裝置永久位址，如 `'0x0123456789'`。  
2. `rawDev` (_Object_): 新裝置的原始資料。  

**Returns:**  

* (_Boolean_): 是否成功通知 freebird 框架。  

**Examples:**  
  
```js
nc.commitDevIncoming('0x0123456789', rawDev);
```

<a name ="API_commitDevLeaving"></a>
<br />
********************************************
### commitDevLeaving(permAddr)

當裝置離開網路時呼叫。  

**Arguments:**  

1. `permAddr` (_String_): 裝置永久位址，如 `'0x0123456789'`。  

**Returns:**  

* (_Boolean_): 是否成功通知 freebird 框架。  

**Examples:**  
  
```js
nc.commitDevLeaving('0x0123456789');
```

<a name ="API_commitGadIncoming"></a>
<br />
********************************************
### commitGadIncoming(permAddr, auxId, rawGad)

當底層有新裝置加入網路時，實作者依據某些規則，將裝置上的應用一一產生對應的物品並通知 netcore。  

**Arguments:**  

1. `permAddr` (_String_): 裝置永久位址，如 `'0x0123456789'`。  
2. `auxId` (_String_ | _Number_): 物品之輔助 id。  
3. `rawGad` (_Object_): 新物品的原始資料。  

**Returns:**  

* (_Boolean_): 是否成功通知 freebird 框架。  

**Examples:**  
  
```js
nc.commitGadIncoming('0x0123456789', 'temperature/0', rawGad);
```

<a name ="API_commitDevReporting"></a>
<br />
********************************************
### commitDevReporting(permAddr, devAttrs)

底層接收到有關 device 的屬性變化或通知時，呼叫此方法通知 netcore。  

**Arguments:**  

1. `permAddr` (_String_): 裝置永久位址，如 `'0x0123456789'`。  
2. `devAttrs` (_Object_): 發生變化之 device 屬性。  

**Returns:**  

* (_Boolean_): 是否成功通知 freebird 框架。  

**Examples:**  
  
```js
nc.commitDevReporting('0x0123456789', { manufacturer: 'xxx' });
```

<a name ="API_commitGadReporting"></a>
<br />
********************************************
### commitGadReporting(permAddr, auxId, gadAttrs)

底層接收到有關 gadget 的屬性變化或通知時，呼叫此方法通知 netcore。  

**Arguments:**  

1. `permAddr` (_String_): 裝置永久位址，如 `'0x0123456789'`。  
2. `auxId` (_String_ | _Number_): 物品之輔助 id。  
2. `gadAttrs` (_Object_): 發生變化之 gadget 屬性。  

**Returns:**  

* (_Boolean_): 是否成功通知 freebird 框架。  

**Examples:**  
  
```js
nc.commitGadReporting('0x0123456789', { dInState: 4500 });
```

<a name ="API_dangerouslyCommitGadReporting"></a>
<br />
********************************************
### dangerouslyCommitGadReporting(permAddr, auxId, gadAttrs)

底層接收到 gadget 的屬性變化時，呼叫此方法會直接合併 `gadAttrs` 物件至 gadget 實例。

**Arguments:**  

1. `permAddr` (_String_): 裝置永久位址，如 `'0x0123456789'`。  
2. `auxId` (_String_ | _Number_): 物品之輔助 id。  
2. `gadAttrs` (_Object_): 新增的屬性值。  

**Returns:**  

* (_Boolean_): 是否成功通知 freebird 框架。  

**Examples:**  
  
```js
nc.commitGadReporting('0x0123456789', { newAattr: 'xxx' });
```
