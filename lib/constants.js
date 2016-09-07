'use strict';

var constants = {
    EVENTS: {},
    netMandatoryDrvs: [ 'start', 'stop', 'reset', 'permitJoin', 'remove', 'ping' ],
    netOptionalDrvs: [ 'ban', 'unban' ],
    devMandatoryDrvs: [ 'read', 'write' ],
    devOptionalDrvs: [ 'identify' ],
    gadMandatoryDrvs: [ 'read', 'write' ],
    gadOptionalDrvs: [ 'exec', 'setReportCfg', 'getReportCfg' ]
};

constants.EVENTS.NETCORE = {
    error: '_nc:error',
    enabled: '_nc:enabled',
    disabled: '_nc:disabled',
    started: '_nc:started',
    stopped: '_nc:stopped',
    ready: '_nc:ready',
    permitJoin: '_nc:permitJoin',
    devIncoming: '_nc:devIncoming',
    devLeaving: '_nc:devLeaving',
    devNetChanging: '_nc:devNetChanging',
    devReporting: '_nc:devReporting',
    gadIncoming: '_nc:gadIncoming',
    gadReporting: '_nc:gadReporting',
    bannedDevIncoming: '_nc:bannedDevIncoming',
    bannedDevReporting: '_nc:bannedDevReporting',
    bannedGadIncoming: '_nc:bannedGadIncoming',
    bannedGadReporting: '_nc:bannedGadReporting',
    netBan: '_nc:netBan',
    netUnban: '_nc:netUnban',
    netPing: '_nc:netPing',
    devRead: '_nc:devRead',
    devWrite: '_nc:devWrite',
    devIdentify: '_nc:devIdentify',
    gadRead: '_nc:gadRead',
    gadWrite: '_nc:gadWrite',
    gadExec: '_nc:gadExec',
    gadSetReportCfg: '_nc:gadSetReportCfg',
    gadGetReportCfg:'_nc:gadGetReportCfg',
    _ready: '_nc:_ready'
};

constants.EVENTS.DEV = {
    error: '_dev:error',
    netChanged: '_dev:netChanged',
    propsChanged: '_dev:propsChanged',
    attrsChanged: '_dev:attrsChanged'
};

constants.EVENTS.GAD = {
    error: '_gad:error',
    panelChanged: '_gad:panelChanged',
    propsChanged: '_gad:propsChanged',
    attrsChanged: '_gad:attrsChanged',
    attrsAppend: '_gad:attrsAppend',
    panelChangedDisabled: '_gad:panelChanged_Disabled'
};

constants.EVT_CB_NAME = {
    '_nc:error': 'onError',
    '_nc:_ready': 'onReady',
    '_nc:enabled': 'onEnabled',
    '_nc:disabled': 'onDisabled',
    '_nc:permitJoin': 'onPermiJoin',
    '_nc:devIncoming': 'onDevIncoming',
    '_nc:devLeaving': 'onDevLeaving',
    '_nc:devReporting': 'onDevReporting',
    '_nc:devNetChanging': 'onDevNetChanging',
    '_nc:gadIncoming': 'onGadIncoming',
    '_nc:gadReporting': 'onGadReporting',
    '_nc:bannedDevIncoming': 'onBannedDevIncoming',
    '_nc:bannedDevReporting': 'onBannedDevReporting',
    '_nc:bannedGadIncoming': 'onBannedGadIncoming',
    '_nc:bannedGadReporting': 'onBannedGadReporting',
    '_dev:error': 'onDevError',
    '_dev:netChanged': 'onDevNetChanged',
    '_dev:propsChanged': 'onDevPropsChanged',
    '_dev:attrsChanged': 'onDevAttrsChanged',
    '_gad:error': 'onGadError',
    '_gad:panelChanged': 'onGadPanelChanged',
    '_gad:propsChanged': 'onGadPropsChanged',
    '_gad:attrsChanged': 'onGadAttrsChanged'
};

module.exports = constants;
