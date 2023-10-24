/**
 * 開発全体共通のライブラリ関数を記載する
 * 
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/record', "N/ui/dialog", "N/format", 'N/error', 'N/email', 'N/runtime', 'N/query'],
  
  function(search, record, dialog, format, error, email, runtime, query) {
	
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
		
	}
	
	/**
	 * SFTPファイル送信
	 */
	function execute() {
		
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
	function proError() {
		
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
	function dataExists() {
		
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