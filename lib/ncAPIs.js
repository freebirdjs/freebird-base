function Netcore(name, cfg) {}

// protected
_startLiveKeeper();
_findDevByAddr();
_findGadByAddrAuxId();
_getAllDevs();
_getAllGads();
_checkEngine();
_callDriver();

// develop implements
cookRawDev();           // <<
cookRawGad();           // <<
unifyRawDevAttrs();     // <<
unifyRawGadAttrs();     // <<

// develop implements (optional)
findDevByAddr();
findGadByAddrAuxId();
getAllDevs();
getAllGads();

_findDevByAddr();       // ok
_findGadByAddrAuxId();  // ok
_getAllDevs();          // ok
_getAllGads();          // ok

// let develop call
devIncoming();          // ok
devLeaving();           // ok
gadIncoming();          // ok
reportDevAttrs();
reportGadAttrs();

incTxBytes();            // ok
incRxBytes();            // ok
resetTxBytes();          // ok
resetRxBytes();          // ok

// develop should regitser
registerNetDrivers(); // <<
registerDevDrivers(); // <<
registerGadDrivers(); // <<

// need no driver
dump();                 // ok
enable();
disable();
isRegistered();         // ok
isEnabled();            // ok

getBlacklist();         // ok
clearBlacklist();       // ok
isBlacklisted();        // ok
blacklist();            // ok
unblacklist();          // ok

// need drivers
start();
stop();
reset();
permitJoin();

maintain();
remove();
ping();
ban();
unban();

readDev();
writeDev();
identify();

read();
write();
exec();
setReportCfg();
getReportCfg();

