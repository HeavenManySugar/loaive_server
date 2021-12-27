module.exports = class CheckCustomer {
    //判斷email格式
    checkEmail(email) {
        const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        const result = re.test(email);
        return result;
    }
    //判斷空值
    checkNull(data) {
        for (var key in data) {
            return false;
        }
        return true;
    }
    //判斷檔案大小
    checkFileSize(fileSize) {
        var maxSize = 1 * 1024 * 1024; //1MB
        if (fileSize > maxSize) {
            return true;
        }
        return false;
    }
    //判斷型態是否符合jpg, jpeg, png
    checkFileType(fileType) {
        if (fileType === 'image/png' || fileType === 'image/jpg' || fileType === 'image/jpeg') {
            return true;
        }
        return false;
    }
}