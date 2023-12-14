const store_otp_in_database = "INSERT INTO UserOTP (userid, otp, created_time) VALUES ($1, $2, $3)";
const get_user_otp_details = "SELECT * FROM UserOTP WHERE userid = $1 ORDER BY id DESC LIMIT 1";
const delete_otp_record = "DELETE FROM UserOTP WHERE id = $1";
const get_encrypted_password = "SELECT password FROM User2 WHERE username = $1";

const queries = {
    store_otp_in_database,
    get_encrypted_password,
    get_user_otp_details,
    delete_otp_record
}
export default queries;