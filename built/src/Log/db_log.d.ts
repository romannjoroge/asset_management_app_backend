declare namespace _default {
    export { selectUserLogs };
}
export default _default;
declare const selectUserLogs: "SELECT timestamp, logdescription FROM Log WHERE username = $1 AND timestamp BETWEEN $2 AND $3 AND eventType = $4";
