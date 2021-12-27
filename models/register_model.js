const db = require('./connection_db');

module.exports = function register(memberData) {
    let result = {};
    return new Promise((resolve, reject) => {
        // 尋找是否有重複的email
        db.query('SELECT email FROM member_info WHERE email = ?', memberData.email, function (err, rows) {
            // 若資料庫部分出現問題，則回傳給client端「伺服器錯誤，請稍後再試！」的結果。
            if (err) {
                console.log(err);
                result.status = "註冊失敗。"
                result.err = "伺服器錯誤，請稍後在試！"
                reject(result);
                return;
            }
            // 如果有重複的email
            if (rows.length >= 1) {
                result.status = "註冊失敗。";
                result.err = "已有重複的Email。";
                reject(result);
            } else {
                // 將資料寫入資料庫
                db.query('INSERT INTO member_info SET ?', memberData, function (err, rows) {
                    // 若資料庫部分出現問題，則回傳給client端「伺服器錯誤，請稍後再試！」的結果。
                    if (err) {
                        console.log(err);
                        result.status = "註冊失敗。";
                        result.err = "伺服器錯誤，請稍後在試！"
                        reject(result);
                        return;
                    }
                    // 若寫入資料庫成功，則回傳給clinet端下：
                    result.status = "註冊成功。"
                    result.registerMember = memberData;
                    resolve(result);
                })
            }
        })
    })
}