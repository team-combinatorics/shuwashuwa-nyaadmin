import { writeFileXLSX } from "xlsx";
import { utils } from "xlsx"
import type { ServiceEvent } from "~/models/service";
import type { ActivityInfo } from "~/models/activity";
import type { WorkBook, WorkSheet } from "xlsx";

import { groupBy } from "./utils";


export const generateServiceExcel = async (serviceList: ServiceEvent[], activityList: ActivityInfo[]) => {
    const _sheetName =  '维修单列表.xlsx';
    const workBook = utils.book_new();

    const serviceByActivity = groupBy(serviceList, 'activityName');

    const activityData = activityList.map((item) => {
        const services = serviceByActivity[item.activityName] || []; 

    })

    const activitySheet = utils.json_to_sheet(activityList);
    utils.book_append_sheet(workBook, activitySheet, '活动');

    writeFileXLSX(workBook, _sheetName);
}