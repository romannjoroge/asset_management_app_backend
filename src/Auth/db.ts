const store_otp_in_database = "INSERT INTO UserOTP (userid, otp, created_time) VALUES ($1, $2, $3)"

const queries = {
    store_otp_in_database
}
export default queries;