const Check = require('../service/member_check');
const config = require('../config/development_config');

const toRegister = require('../models/register_model');
const encryption = require('../models/encryption');
const decryption = require('../models/decryption');
const loginAction = require('../models/login_model');
const updateAction = require('../models/update_model');
const verify = require('../models/verification_model');
const checkMember = require('../models/checkmember_model')

const jwt = require('jsonwebtoken');
const formidable = require('formidable');
const fs = require('fs');

check = new Check();
rooms = [];

module.exports = class Member {
    postRegister(req, res, next) {

        // 進行加密
        const password = encryption(decryption(req.body.password));

        // 獲取client端資料
        const memberData = {
            name: decryption(req.body.name),
            email: decryption(req.body.email),
            password: password,
            create_date: onTime()
        }

        const checkEmail = check.checkEmail(memberData.email);
        // 不符合email格式
        if (checkEmail === false) {
            res.json({
                result: {
                    status: "註冊失敗。",
                    err: "請輸入正確的Eamil格式。(如1234@email.com)"
                }
            })
            // 若符合email格式
        } else if (checkEmail === true) {
            // 將資料寫入資料庫
            toRegister(memberData).then(result => {
                // 若寫入成功則回傳
                
                const token = jwt.sign({
                    algorithm: 'HS256',
                    exp: Math.floor(Date.now() / 1000) + (60 * 60), // token一個小時後過期。
                    data: result['registerMember'].name
                }, config.secret);
                res.setHeader('token', token);
                
                //console.log(result['registerMember'].name)
                res.json({
                    result: result
                })
            }, (err) => {
                // 若寫入失敗則回傳
                res.json({
                    err: err
                })
            })
        }
    }
    /*
    postLogin(req, res, next) {
        // 進行加密
        const password = encryption(decryption(req.body.password));

        // 獲取client端資料
        const memberData = {
            email: decryption(req.body.email),
            password: password,
        }

        loginAction(memberData).then(rows => {
            if (check.checkNull(rows) === true) {
                res.json({
                    result: {
                        status: "登入失敗。",
                        err: "請輸入正確的帳號或密碼。"
                    }
                })
            } else if (check.checkNull(rows) === false) {
                // 產生token
                const token = jwt.sign({
                    algorithm: 'HS256',
                    exp: Math.floor(Date.now() / 1000) + (60 * 60), // token一個小時後過期。
                    data: rows[0].id
                }, config.secret);
                res.setHeader('token', token);
                res.json({
                    result: {
                        status: "登入成功。",
                        loginMember: rows[0].name
                        //loginMember: "歡迎 " + rows[0].name + " 的登入！",
                        // token: token
                    }
                })
            }
        })
    }
    */
    putUpdate(req, res, next) {
        const token = req.headers['token'];
        if (check.checkNull(token) === true) {
            res.json({
                err: "請輸入token！"
            })
        } else if (check.checkNull(token) === false) {
            verify(token).then(tokenResult => {
                if (tokenResult === false) {
                    res.json({
                        result: {
                            status: "token錯誤。",
                            err: "請重新登入。"
                        }
                    })
                } else {
                    const id = tokenResult;
                    
                    // 進行加密
                    const password = encryption(decryption(req.body.password));

                    const memberUpdateData = {
                        name: decryption(req.body.name),
                        password: password,
                        update_date: onTime()
                    }
                    updateAction(id, memberUpdateData).then(result => {
                        res.json({
                            result: result
                        })
                    }, (err) => {
                        res.json({
                            result: err
                        })
                    })
                }
            })
        }
    }
    putUpdateImage(req, res, next) {
        const form = new formidable.IncomingForm();
    
        const token = req.headers['token'];
        //確定token是否有輸入
        if (check.checkNull(token) === true) {
            res.json({
                err: "請輸入token！"
            })
        } else if (check.checkNull(token) === false) {
            verify(token).then(tokenResult => {
                if (tokenResult === false) {
                    res.json({
                        result: {
                            status: "token錯誤。",
                            err: "請重新登入。"
                        }
                    })
                } else {
                    form.parse(req, async function (err, fields, files) {
                        // 確認檔案大小是否小於1MB
                        if (check.checkFileSize(files.file['size']) === true) {
                            res.json({
                                result: {
                                    status: "上傳檔案失敗。",
                                    err: "請上傳小於1MB的檔案"
                                }
                            })
                            return;
                        }
                        
                        // 確認檔案型態是否為png, jpg, jpeg
                        if (check.checkFileType(files.file['mimetype']) === true) {
                            // 將圖片轉成base64編碼
                            const image = await fileToBase64(files.file['filepath']);

                            const id = tokenResult;

                            // 進行加密
                            const password = encryption(fields.password);
                            const memberUpdateData = {
                                img: image,
                                name: fields.name,
                                password: password,
                                update_date: onTime()
                            }

                            updateAction(id, memberUpdateData).then(result => {
                                res.json({
                                    result: result
                                })
                            }, (err) => {
                                res.json({
                                    result: err
                                })
                            })
                        } else {
                            res.json({
                                result: {
                                    status: "上傳檔案失敗。",
                                    err: "請選擇正確的檔案格式。如：png, jpg, jpeg等。"
                                }
                            })
                            return;
                        }
                    })
                }
            })
        }
    }
    postLogin(req, res, next) {
        // 進行加密
        const password = encryption(decryption(req.body.password));

        // 獲取client端資料
        const memberData = {
            email: decryption(req.body.email),
            password: password,
        }

        loginAction(memberData).then(rows => {
            if (check.checkNull(rows) === true) {
                checkMember(memberData).then(rows => {
                    if (check.checkNull(rows) === true) {
                        res.json({
                            result: {
                                status: "登入失敗。",
                                err: "請輸入正確的帳號。"
                            }
                        })
                    }
                    else{
                        res.json({
                            result: {
                                status: "登入失敗。",
                                err: "請輸入正確的密碼。"
                            }
                        })
                    }
                })
            } else if (check.checkNull(rows) === false) {
                // 產生token
                const token = jwt.sign({
                    algorithm: 'HS256',
                    exp: Math.floor(Date.now() / 1000) + (60 * 60), // token一個小時後過期。
                    data: rows[0].id
                }, config.secret);
                res.setHeader('token', token);
                res.json({
                    result: {
                        status: "登入成功。",
                        loginMember: rows[0].name
                        //loginMember: "歡迎 " + rows[0].name + " 的登入！",
                        // token: token
                    }
                })
            }
        })
    }
}

//取得現在時間，並將格式轉成YYYY-MM-DD HH:MM:SS
const onTime = () => {
    const date = new Date();
    const mm = date.getMonth() + 1;
    const dd = date.getDate();
    const hh = date.getHours();
    const mi = date.getMinutes();
    const ss = date.getSeconds();

    return [date.getFullYear(), "-" +
        (mm > 9 ? '' : '0') + mm, "-" +
        (dd > 9 ? '' : '0') + dd, " " +
        (hh > 9 ? '' : '0') + hh, ":" +
        (mi > 9 ? '' : '0') + mi, ":" +
        (ss > 9 ? '' : '0') + ss
    ].join('');
}

const fileToBase64 = (filePath) => {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'base64', function (err, data) {
            resolve(data);
        })
    })
}