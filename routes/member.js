var express = require('express');
var router = express.Router();

const MemberModifyMethod = require('../controllers/modify_controller');

memberModifyMethod = new MemberModifyMethod();

// ===================

// # Node.js-Backend見聞錄(16)：實作-會員系統(五)-添加部分功能 - 讓API URL更直覺

// 註冊新會員
router.post('/', memberModifyMethod.postRegister);

// 會員登入
router.post('/login', memberModifyMethod.postLogin);

// 更新會員資料
router.put('/', memberModifyMethod.putUpdate);

// 更新會員資料（檔案上傳示範，可直接取代/member的PUT method）
router.put('/updateimage', memberModifyMethod.putUpdateImage);

//router.get('/getUserData', memberModifyMethod.getUserData);

// ===================

// Node.js-Backend見聞錄(13)：實作-會員系統(二)-會員註冊(二)
// router.post('/register', memberModifyMethod.postRegister);

// Node.js-Backend見聞錄(14)：實作-會員系統(三)-會員登入
// router.post('/login', memberModifyMethod.postLogin);

// Node.js-Backend見聞錄(15)：實作-會員系統(四)-會員資料
// router.put('/update', memberModifyMethod.putUpdate);

// # Node.js-Backend見聞錄(16)：實作-會員系統(五)-添加部分功能
// router.put('/updateimage', memberModifyMethod.putUpdateImage);

module.exports = router;