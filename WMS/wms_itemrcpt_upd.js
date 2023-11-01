/**
 * 機能: WMS_入庫連携_プログラム
 * Author: CPC_宋
 * Date:2023/10/31
 * 
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define(['/SuiteScripts/LIBRARY/common_lib.js', 'N/file', 'N/record', 'N/search', 'N/format', "N/runtime", 'N/render' ],
	/**
	 * @param {runtime}
	 *            runtime
	 * @param {search}
	 *            search
	 * @param {format}
	 *            format
	 */
	(common_lib, file, record, search, format, runtime, render) => {
		/**
		 * 入力データを生成
		 * 
		 * @returns {array|Object|Search|File}
		 * 
		 * @governance 10,000
		 */
		function getInputData() {
			
			// 対象のCSVファイルの存在チェック
			let csvFile = '';
			let mapJson = [];
			
			// WMS上のバケットフォルダに未連携のCSVファイルが存在しなかった場合、空のリストを戻り値に設定して処理を終了する
			if (common_lib.isEmpty(csvFile)) {
				return [];
			}
			
			// CSVファイルのダウンロード
			let csvFile = file.create({
	            name: 'csvName',
	            contents : JSON.stringify(poResults),
	            folder: param_csv_folder,
	            fileType: 'CSV',
	            encoding = file.Encoding.UTF_8
	        });
			
			let csvFileId = csvFile.save();
			
			// ファイルをロードする
			let csvFile = file.load({
                id : csvFileId,
                encoding : file.Encoding.SHIFT_JIS,
            });
			
			// ファイル内容を取得する
            let csvFileContents = csvFile.getContents();
            
            // CSVデータをArrayに変換する
            let csvFileToArray = common_lib.csvToArray(csvFileContents);
            
            // CSVデータが存在する場合
            if (csvFileToArray.length > 0) {
            	
            	// アイテムマスタ取得
                let infoDic = getItemJsonValue();
                
                // 配送情報取得
                let fulDic = getIfNoJsonValue();
            	
                // CSVデータ整理
                let csvData = {};
                
            	for (let line = 0; line < csvFileToArray.length; line++) {
            		
            		if (!csvData.hasOwnProperty(csvFileToArray[line].keyNo)) {
            			// keyNo = 配送No
            			csvData[csvFileToArray[line].keyNo] = new Array();
            			csvData[csvFileToArray[line].keyNo].push(csvFileToArray[line]);
            		} else {
            			csvData[ifNo].push(csvFileToArray[line]);
            		}

            	}
            	// マスタチェック
            	// 配送存在チェック
            	for ( let key in csvData) {
					
            		let itemFlag = false;
            		let ifFlag = false;
            		
            		let ifData = csvData[key];
            		// 類番
            		let type = ifData[0];
            		// 品番
            		let num = ifData[1];
            		// カラー
            		let color = ifData[2];
            		// サイズ
            		let size = ifData[2];
            		
            		// アイテムマスタ存在チェック  TODO:
            		if (check) {
            			itemFlag = true;
					}
            		// 配送存在チェック TODO:
            		if (check) {
            			ifFlag = true;
					}
            		
            		if(itemFlag && ifFlag){
            			mapJson.push({
           					'itemFulNo' : csvData[key]
           				});
            		}
            		
				}
			
            }

            return mapJson;                    
		}

	    /**
	     * Executes when the reduce entry point is triggered and applies to each group.
	     * 
	     * @param {ReduceSummary} context - Data collection containing the groups to process through the reduce stage
	     * @since 2015.1
	     */
		function reduce(context) { 
			// キー
			let ifNo = context.key;
			
			// 値
			let contextJson = JSON.parse(context.value);
			
			// 配送ライン
			let contItemFul = contextJson['itemFulNo'];
			
			// 配送ヘッダ作成　TODO：
			
			// 配送明細作成　TODO：
		    
		}
		
		/**
		 * 関数呼び出しごとに1つだけのキーとそれに対応する値を処理
		 * 
		 * @param {Object}
		 *            context
		 * @param {Date}
		 *            context.dateCreated スクリプトが実行を開始した日時
		 * @param {number}
		 *            context.seconds スクリプトの処理中に経過した秒数
		 * @param {Object}
		 *            context.inputSummary
		 * @param {Object}
		 *            context.mapSummary
		 * @param {Object}
		 *            context.reduceSummary
		 * @param context.output
		 * @returns {undefined}
		 * 
		 * @governance 10,000
		 */
		function summarize(context) {
			
			const script = runtime.getCurrentScript();
	    	const script_id = script.id;
//	    	const param_email_author = script.getParameter({name: "email_author_bl"});
//	    	const param_email_recipients = script.getParameter({name: "email_recipients"});
	    	
	    	var inputSummary = context.inputSummary;
	        var mapSummary = context.mapSummary;
	        var reduceSummary = context.reduceSummary;
	        
	        if (inputSummary.error) {
	        	//　エラー処理
	        	common_lib.handleErrorIfAny(context);
	        	
	            var errorObj = error.create({
	                name: 'INPUT_STAGE_FAILED',
	                message: inputSummary.error,
	    		    notifyOff: false
	            });
	            throw errorObj;
	        }
	        
	        var errorName = '';
	        var errorMsg = [];
	        mapSummary.errors.iterator().each(function(key, value){
	            var msg = 'param key: ' + key + '. Error message: ' + JSON.parse(value).message + '\n';
	            errorMsg.push(msg);
	            errorName = 'MAP_TRANSFORM_FAILED'
	            return true;
	        });
	        
	        reduceSummary.errors.iterator().each(function(key, value){
	            var msg = 'param key: ' + key + '. Error message: ' + JSON.parse(value).message + '\n';
	            errorMsg.push(msg);
	            errorName = 'RECORD_TRANSFORM_FAILED'
	            return true;
	        });
	        
	        if (errorMsg.length > 0)
	        {
	        	//　エラー処理
	        	common_lib.handleErrorIfAny(context);
	            var errorObj = error.create({
	                name: errorName,
	                message: JSON.stringify(errorMsg),
	    		    notifyOff: false
	            });
	            throw errorObj;
	        }
			
			
		}
		
		// アイテムマスタ取得
		function getItemJsonValue() {
			let infoDic = {};
			let itemSearch = "item";
            let itemFilters = [];
            let itemSearchObj = [search.createColumn({
	            name : "internalid",
	            label : "内部ID"
		    }),search.createColumn({
	            name : "",
	            label : "類番"
		    }),search.createColumn({
	            name : "",
	            label : "品番"
		    }),search.createColumn({
	            name : "",
	            label : "カラー"
		    }),search.createColumn({
	            name : "",
	            label : "サイズ"
		    })];
            let itemSearchResults = common_lib.getSearchdata(itemSearch, itemFilters, searchColumns);
            if (itemSearchResults && itemSearchResults.length > 0) {
            	 for (let i = 0; i < itemSearchResults.length; i++) {
            		 let tmpResult = itemSearchResults[i];
            		 let itemId = tmpResult.getValue(searchColumns[0]);
            		 let itemNum = tmpResult.getValue(searchColumns[1]);
            		 let ItemColor = tmpResult.getValue(searchColumns[2]);
            		 let itemTmp = tmpResult.getValue(searchColumns[3]);
            		 
	                 let itemArr = new Array();
	                 itemArr.push([itemNum],[ItemColor],[itemTmp]);
	                 infoDic[itemId] = new Array();
	                 infoDic[itemId].push(itemArr);
            		 
            	 }
            }
            
            return infoDic;
		
		}
		
		//受領書情報取得
		function getIfNoJsonValue() {
			let fulDic = {};
            let itemRcptSearch = "itemreceipt";
            let itemRcptFilters = [];
            itemRcptFilters.push(["type",'anyof',"ItemRcpt"]);
            itemRcptFilters.push(["AND"]);
            itemRcptFilters.push(["trackingnumber","isnotempty",""]);
            let itemRcptSearchObj = [search.createColumn({
	            name : "trackingnumbers",
	            label : "受領書No"
		    }),search.createColumn({
	            name : "",
	            label : "受領書行番号"
		    })];
            let itemRcptSearchResults = createSearch(itemRcptSearch, itemRcptFilters, searchColumns);
            if (itemRcptSearchResults && itemRcptSearchResults.length > 0) {
            	let fulDic = {};
            	for (let i = 0; i < itemRcptSearchResults.length; i++) {
            		 let fulResult = itemRcptSearchResults[i];
            		 let itemFulNo = fulResult.getValue(searchColumns[0]);
            		 let itemFulLine = fulResult.getValue(searchColumns[1]);
            		 
	                 let itemFulArr = new Array();
	                 itemFulArr.push([itemFulLine]);
	                 fulDic[itemFulNo] = new Array();
	                 fulDic[itemFulNo].push(itemFulArr);
            		 
            	}
            }
            return fulDic;
            
		}
            
	    function isValidDateFormat(date) {
	        var regex = /^\d{4}-\d{2}-\d{2}$/;
	        return regex.test(date);
	    }
        
		return {
		    getInputData: getInputData,
		    reduce: reduce,
	        summarize: summarize
		}
	}
);
