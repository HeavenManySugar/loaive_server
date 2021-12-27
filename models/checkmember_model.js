const db = require('./connection_db');

module.exports = function checkMember(memberData) {
    let result = {};
    return new Promise((resolve, reject) => {
        // 找尋
        db.query('SELECT * FROM member_info WHERE email = ?', [memberData.email], function (err, rows) {
            if (err) {
                result.status = "登入失敗。"
                result.err = "伺服器錯誤，請稍後在試！"
                reject(result);
                return;
            }
            resolve(rows);
        });
    });
}