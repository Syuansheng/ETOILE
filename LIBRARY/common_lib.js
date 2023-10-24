/**
 * 開発全体共通のライブラリ関数を記載する
 * 
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/record', "N/ui/dialog", "N/format", 'N/error', 'N/email', 'N/runtime', 'N/query', "require", "exports", "N/log", "N/sftp"],
  
  function(search, record, dialog, format, error, email, runtime, query, require, exports, log, sftp) {
	
	/**
	 * マスタ / トランザクション取得
	 * 
     * @param {Object} searchType 検索種類
     * @param {Object} searchFilters 検索条件
     * @param {Object} searchColumns 検索項目
	 * @returns {Object} resultList 検索結果配列
	 */
	function getSearchdata(searchType, searchFilters, searchColumns) {
		
		let resultList = [];
        let resultIndex = 0;
        let resultStep = 1000;

        let objSearch = search.create({
            type : searchType,
            filters : searchFilters,
            columns : searchColumns
        });
        let objResultSet = objSearch.run();

        do {
            var results = objResultSet.getRange({
                start : resultIndex,
                end : resultIndex + resultStep
            });

            if (results.length > 0) {
                resultList = resultList.concat(results);
                resultIndex = resultIndex + resultStep;
            }
        } while (results.length > 0);

        return resultList;
        
	}
	
	/**
	 * 歴日チェック
	 * 
     * @param {String} date 歴日
     * @param {String} fh フォーマット
	 * @returns {Boolean}
	 */
	function isDateFormat(date, fh) {
		
		if (!date) {
            return false;
        }
		
        let dateItems = date.split(fh);
        if (dateItems.length !== 3) {
            return false;
        }
        let pattern = new RegExp("[0-9]+");
        if (!pattern.test(dateItems[0]) || !pattern.test(dateItems[1]) || !pattern.test(dateItems[2])) {
            return false;
        }

        if (dateItems[0].length !== 4 || parseInt(dateItems[1]) > 12 || parseInt(dateItems[1]) <= 0 || parseInt(dateItems[2]) > 31
                || parseInt(dateItems[2]) <= 0) {
            return false;
        }

        return true;
        
	}
	
	/**
	 * 空白チェック
	 * 
	 * @param {Object} obj 文字列
	 * @returns {Boolean}
	 */
	function isEmpty(obj) {

	    if (obj === undefined || obj == null || obj === '') {
	        return true;
	    }
	    if (obj.length && obj.length > 0) {
	        return false;
	    }
	    if (obj.length === 0) {
	        return true;
	    }
	    for ( var key in obj) {
	        if (hasOwnProperty.call(obj, key)) {
	            return false;
	        }
	    }
	    if (typeof (obj) == 'boolean') {
	        return false;
	    }
	    if (typeof (obj) == 'number') {
	        return false;
	    }
	    return true;
	
	}
	
	/**
	 * SFTPファイル受信
	 */
	function execute() {
		"use strict";
	    Object.defineProperty(exports, "__esModule", { value: true });
	    exports.execute = void 0;
	    var NS_TEST_FOLDER = 12308; //12303; WMStoERP Copy
	    var execute = function (ctx) {
	        try {
	            var conn_1 = sftp.createConnection({
	                username: 'ftpuser',
	                //passwordGuid: 'custsecret_hunter_test_sftp',
	                passwordGuid: 'custsecret_hunter_sftp',
	                url: '153.120.20.66',
	                port: 22,
	                //directory: '/home/ftpuser/to_ns', ///home/ftpuser/ARCHIVE
	                directory: '/home/ftpuser/WMStoERP', // 
	                hostKey: 'AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBJgP0r0WZ7YtiS6npu+5DYgalatLx6tWmcKcDMC1NENddyYCCRY+kEKnA9o4t6RMguj2ztLxjc/LfDDOmYTwFhw=',
	            });
	            var rtn_1 = conn_1.list({ path: '/', sort: sftp.Sort.DATE_DESC });
	            Object.keys(rtn_1).map(function (idx) {
	                var _a = rtn_1[idx], directory = _a.directory, name = _a.name, size = _a.size, lastModified = _a.lastModified;
	                if (!directory) {
	                    var f = conn_1.download({ filename: "".concat(name) });
	                    log.debug('file', f);
	                    f.folder = NS_TEST_FOLDER;
	                    f.save();
	                }
	            });
	        }
	        catch (e) {
	            log.error('CPC:MISCS:SFTP:SKD', { e: e });
	        }
	    };
	    exports.execute = execute;
	}
	
	/**
	 * SFTPファイル送信
	 */
	function execute() {
		"use strict";
	    Object.defineProperty(exports, "__esModule", { value: true });
	    exports.execute = void 0;
	    var NS_TEST_FOLDER = 2400633;
	    var NS_TEST_DONE_FOLDER = 18082457;
	    var SFTP_HOST = '59.106.211.127';
	    var SFTP_USER_NAME = 'ftpuser';
	    var SFTP_PASS_WORD = 'aGWb6oVb';
	    var SFTP_PASS_WORD_GUID = 'custsecret_microport_test_sftp';
	    var SFTP_TARGET_FOLDER = '/home/ftpuser/SEND/SFTP_TEST';
	    var SFTP_HOST_KEY = 'AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBLxt8e251AohnU9ARtt7RWsmNCMG4N/LHphh1nlpu62HjlhLgy04RpztGf27Yg1xMN9oJY1woVrPDFOtq468oY0=';
	    var execute = function (ctx) {
	        var file_id_list = [];
	        search
	            .create({
	            type: 'file',
	            filters: [{ name: 'folder', operator: search.Operator.ANYOF, values: NS_TEST_FOLDER }],
	        })
	            .run()
	            .each(function (rec) {
	            file_id_list.push(rec.id);
	            return true;
	        });
	        try {
	            var conn_1 = sftp.createConnection({
	                username: SFTP_USER_NAME,
	                passwordGuid: SFTP_PASS_WORD_GUID,
	                url: SFTP_HOST,
	                port: 22,
	                directory: SFTP_TARGET_FOLDER,
	                hostKey: SFTP_HOST_KEY,
	            });
	            file_id_list.map(function (fid) {
	                var f = file.load({ id: fid });
	                var contents = f.getContents();
	                var rtn = conn_1.upload({ file: f });
	                f.folder = NS_TEST_DONE_FOLDER;
	                f.save();
	            });
	            // const rtn = conn.list({ path: '/', sort: sftp.Sort.DATE_DESC })
	            // Object.keys(rtn).map((idx) => {
	            //   const { directory, name, size, lastModified } = rtn[idx]
	            //   if (!directory) {
	            //     const f = conn.download({ filename: `${name}` })
	            //     log.debug('file', f)
	            //     f.folder = NS_TEST_FOLDER
	            //     f.save()
	            //   }
	            // })
	        }
	        catch (e) {
	            log.error('CPC:MISCS:SFTP:SKD', { e: e });
	        }
	    };
	    exports.execute = execute;
	}

	/**
	 * ファイル削除
	 * 
	 * @param {String} fieldId ファイル
	 * @param {String} path ファイルパスは指定
	 * @returns {Boolean}
	 */
	function delFile(fieldId, path) {
		
		try {
			
			if (fieldId) {
				record['delete']({
					type : record.Type.FOLDER,
					id : fieldId,
				});
				return true;
			}
			
		} catch (e) {
			
			log.debug(' DELETE ERROR : ', e.message);
			return false;
		}
	}
	
	/**
	 * メール送信
	 * 
	 * @param {Object} e ERROR内容
	 */
	function sendMail(e) {
		
		let script = runtime.getCurrentScript();
		let script_id = script.id;
        let paramEmailAuthor = script.getParameter({name: "custscript_sw_pay_author"});
		let paramErrRecipients = script.getParameter({name: "custscript_sw_pay_recipients"});
		let subjectContents = 'subject_contents';
        let bodyContents = 'An error occurred with the following information:\n' +
                   'Error code: ' + e.name + '\n' +
                   'Error msg: ' + e.message;

        email.send({
            author: paramEmailAuthor,
            recipients: paramErrRecipients,
            subject: subjectContents,
            body: bodyContents
        });
		
	}
	
	/**
	 * エラー処理
	 * 
	 * 
	 */
	function proError(e, sendEmailFlag) {
		log.error(' エラー　メッセージ　：', e.message);
		
		if(sendEmailFlag){
			let script = runtime.getCurrentScript();
			let script_id = script.id;
	        let paramEmailAuthor = script.getParameter({name: "custscript_sw_pay_author"});
			let paramErrRecipients = script.getParameter({name: "custscript_sw_pay_recipients"});
			let subjectContents = 'subject_contents';
	        let bodyContents = 'An error occurred with the following information:\n' +
	                   'Error code: ' + e.name + '\n' +
	                   'Error msg: ' + e.message;

	        email.send({
	            author: paramEmailAuthor,
	            recipients: paramErrRecipients,
	            subject: subjectContents,
	            body: bodyContents
	        });
		}
	}
	
	/**
	 * 月末日取得
	 * 
	 * @param date
	 * @param {Date} date 日付
	 * @returns {String} 月末日
	 */
	function getEndOfMonth(date) {
		
		if (typeof (date) == 'string') return date;
        let year = date.getFullYear() + "";
        let month = (date.getMonth() + 1);
		let day = new Date(new Date(year,month).setDate(0)).getDate();
		return day;
		
	}
	
	/**
	 * マスタ / トランザクション データ存在チェック
	 * 
	 * @returns {Boolean}
	 */
	function dataExists(searchType, searchFilters) {
		
		let resultList = [];
        let resultIndex = 0;
        let resultStep = 1000;

        let objSearch = search.create({
            type : searchType,
            filters : searchFilters,
            columns: [
                      search.createColumn({name: "internalid"})
                     ]
        });
        
        let searchResultCount = objSearch.runPaged().count;
        
        searchResultCount == 0 ? return false : return true;
	
	}
	
	/**
	 * 数値チェック
	 * 
	 * @param {String} data 文字列
	 * @returns {Boolean}
	 */
	function isNumber(data) {
		
		// 数値チェック
		if (!isNaN(parseFloat(value)) && isFinite(value)) {
			return true;
		} else {
			return false;
		}	
	
	}
	
	/**
	 * データ形式変換 (日付)
	 * 
	 * @param {String} str 変換前文字列
	 * @returns {Date} 変換フォーマット(日付)
	 */
	function strConvert(str) {
		
        if (typeof (str) == 'string') return str;
        let YYYY = str.getFullYear() + "";
        let MM = (str.getMonth() + 1)
        MM = MM < 10 ? "0" + MM : MM;
        let DS = date.getDate()
        DS = DS < 10 ? "0" + DS : DS;
        return YYYY +"/"+ MM +"/"+ DS
	
	}
	
	/**
	 * 期日取得
	 * 
	 * @returns {Date} 期日
	 */
	function getDuedate() {
		
		let now = new Date();
		let offSet = now.getTimezoneOffset();
		let offsetHours = 9 + (offSet / 60);
		now.setHours(now.getHours() + offsetHours);
		return now;
	
	}
	
	/**
	 * 日後取得
	 * 
	 * @returns {String} 明日の日払
	 */
	function getAfterDate() {
		
		let today = new Date();
		let tomorrow = new Date(today);
		tomorrow.setDate(tomorrow.getDate() + 1);

		return tomorrow;
	
	}
	
	/**
	 * 年後取得
	 * 
	 * @returns {String} 年後取得
	 */
	function getAfterYear() {
		
		let dateTime = new Date().getFullYear();
		dateTime = new Date(new Date().setFullYear(dateTime + 1)).getFullYear();
		
		return dateTime;
		
	}
	
    return {
    	getSearchdata : getSearchdata,
    	isDateFormat : isDateFormat,
    	isEmpty : isEmpty,
    	execute : execute,
    	execute : execute,
    	delFile : delFile,
    	sendMail : sendMail,
    	proError : proError,
    	getEndOfMonth : getEndOfMonth,
    	dataExists : dataExists,
    	isNumber : isNumber,
    	strConvert : strConvert,
    	getDuedate : getDuedate,
    	getAfterDate : getAfterDate,
    	getAfterYear : getAfterYear,
    };
});