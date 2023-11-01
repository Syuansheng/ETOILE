/**
 *  機能: 仕入伝票行制御
 *  Author: 宋金来
 *  Date : 2023/10/26
 *
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/record'],

    (record) => {

        /**
         * Defines the function definition that is executed before record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const beforeSubmit = (scriptContext) => {
            let newRec = scriptContext.newRecord;
            let recordType = scriptContext.newRecord.type;
            let type = scriptContext.type;
            //発注書以外の場合はチェック不要
            if (recordType != record.Type.PURCHASE_ORDER) return;
            // 直送の場合はチェック不要
            if (newRec.getValue({fieldId: "createdfrom"})) return;
            if (type == 'create') {
                let count = newRec.getLineCount({sublistId: "item"});
                for (let i = 0; i < count; i++) {
                    let itemType = newRec.getSublistValue({sublistId: "item", fieldId: "itemtype", line: i});
                    let location = newRec.getSublistValue({sublistId: "item", fieldId: "location", line: i});
                    //在庫アイテムの場合は倉庫を入力されていない場合はエラーにする
                    if (itemType == "InvtPart" && !location) {
                        throw "在庫品の場合は、入庫する倉庫を選択してください";
                    }
                }
            }
        }

        /**
         * Defines the function definition that is executed after record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const afterSubmit = (scriptContext) => {
            let recordType = scriptContext.newRecord.type;
            let recordId = scriptContext.newRecord.id;
            let type = scriptContext.type;
            try {
                // 発注書作成、CSVインポート、直送の時
                if (type == 'create' || type == 'dropship') {
                    let newRec = record.load({type: recordType, id: recordId, isDynamic: true});
                    let count = newRec.getLineCount({sublistId: "item"});
                    // 明細行に5行以下の場合は処理終了
                    if (count <= 5) return;
                    let num = count % 5 !== 0 ? Math.floor(count / 5) : count / 5;
                    let line = 1;
                    // 明細行に5行超えた場合は、新しい発注書に分ける
                    for (let i = 0; i < num; i++) {
                        let copyRec = record.copy({type: recordType, id: recordId, isDynamic: true});
                        let count = copyRec.getLineCount({sublistId: "item"});
                        for (let j = count - 1; j >= 0; j--) {
                            let currentLine = j;
                            let lineStart = line * 5;
                            let lineEnd = line * 5 + 4;
                            if (lineStart > currentLine || lineEnd < currentLine) {
                                copyRec.removeLine({sublistId: "item", line: j});
                            }
                        }
                        line++;
                        copyRec.save();
                    }
                    // 元の発注書に明細行が5行まで保留する
                    for (let i = count - 1; i >= 0; i--) {
                        if (i > 4) {
                            newRec.removeLine({sublistId: "item", line: i})
                        }
                    }
                    newRec.save();
                }
            } catch (e) {
                log.audit("error", e);
            }
        }
        return {
            beforeSubmit,
            afterSubmit
        }

    });
