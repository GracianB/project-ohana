// Test infrastructure only. A peer datachannel can close under loaded CI.
// A fresh, full-session retry is allowed ONCE solely for a confirmed transient
// lost-connection failure, never for a gameplay assertion or missing effects.
export function isTransientRtcDrop(log){
 if(typeof log!=="string")return false;
 return log.includes("Guest U echo not observed on host within 3000ms") &&
  log.includes("OHANA U GUEST TO HOST DIAGNOSTICS") &&
  /"(?:poseChannel|eventChannel)":"(?:closed|connecting)"/.test(log);
}
