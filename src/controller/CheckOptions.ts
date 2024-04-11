import {InsightDataset, InsightError} from "./IInsightFacade";
import {QueryDecomposer} from "./QueryDecomposer";
import {CheckTransformations} from "./checkTransformations";

export class CheckOptions {
	public sectionDatasetIDs;
	public roomDatasetIDs;
	public optionPart: any;
	public id: any = "";

	constructor(optionPart: any, sectionDatasetIDs: any[],roomDatasetIDs: any[]) {
		this.optionPart = optionPart;
		this.sectionDatasetIDs = sectionDatasetIDs;
		this.roomDatasetIDs = roomDatasetIDs;
	}

	public handleOptions(optionPart: any) {
		if (typeof optionPart !== "object" && optionPart !== null && optionPart !== undefined) {
			throw new InsightError("query is not valid, optionPart type wrong");
		}

		if (Object.keys(optionPart).length !== 2 && Object.keys(optionPart).length !== 1) {
			throw new InsightError("query is not valid, optionPart length wrong");
		}

		if (Object.keys(optionPart).length === 1 || Object.keys(optionPart).length === 2) {
			if (Object.keys(optionPart)[0] !== "COLUMNS") {
				throw new InsightError("query is not valid, optionPart first entity not COLUMNS");
			}
		}
		if(Object.keys(optionPart).length === 2) {
			if (Object.keys(optionPart)[0] !== "COLUMNS" && Object.keys(optionPart)[1] !== "ORDER") {
				throw new InsightError("optionPart first entity not COLUMNS, or second entity not ORDER");
			}
		}

		if (Object.keys(optionPart).length === 1) {
			try {
				this.handleColumnHelper(optionPart.COLUMNS);
			} catch (e) {
				throw new InsightError("columnPart is wrong");
			}
		}

		if (Object.keys(optionPart).length === 2) {
			try {
				this.handleColumnHelper(optionPart.COLUMNS);
				this.handleOrder(optionPart.ORDER,optionPart.COLUMNS);
			} catch (e) {
				console.log(e, "errrrr");
				throw new InsightError("columnPart is wrong or orderPart is wrong");
			}
		}
	}

	public handleColumnHelper(COLUMNS: any) {
		this.id = COLUMNS[0].split("_")[0];
		if (COLUMNS.length === 0) {
			throw new InsightError("Column empty");
		}
		if (!(COLUMNS instanceof Array)) {
			throw new InsightError("Column type wrong!");
		}
		for (const obj of COLUMNS) {
			if (!this.checkColumnKey(obj)) {
				throw new InsightError("Column content invalid");
			}
			// let queryID = COLUMNS[0].split("_")[0];
			// if (obj.split("_")[0] !== queryID) {
			// 	throw new InsightError("Column contains multiple ids");
			// }
		}
	}

	public checkColumnKey(columnKey: string): boolean{
		let columnKeyArray = [];
		for (const c of this.sectionDatasetIDs) {
			columnKeyArray.push(c + "_avg");
			columnKeyArray.push(c + "_pass");
			columnKeyArray.push(c + "_fail");
			columnKeyArray.push(c + "_audit");
			columnKeyArray.push(c + "_year");
			columnKeyArray.push(c + "_dept");
			columnKeyArray.push(c + "_id");
			columnKeyArray.push(c + "_instructor");
			columnKeyArray.push(c + "_title");
			columnKeyArray.push(c + "_uuid");
		}
		for (const c of this.roomDatasetIDs) {
			columnKeyArray.push(c + "_lat");
			columnKeyArray.push(c + "_lon");
			columnKeyArray.push(c + "_seats");
			columnKeyArray.push(c + "_fullname");
			columnKeyArray.push(c + "_shortname");
			columnKeyArray.push(c + "_number");
			columnKeyArray.push(c + "_name");
			columnKeyArray.push(c + "_address");
			columnKeyArray.push(c + "_type");
			columnKeyArray.push(c + "_furniture");
			columnKeyArray.push(c + "_href");
		}
		if (!columnKey.includes("_")) {
			return true;
		} else {
			return columnKeyArray.includes(columnKey);
		}
	}

	public handleOrder(Order: any,Columns: any) {
		if (typeof Order === "object") {
			if (Object.keys(Order).length !== 2) {
				throw new InsightError("Order length not equal to 2");
			}
			if (Object.keys(Order)[0] !== "dir") {
				throw new InsightError("Order first key not dir");
			}
			if (Object.keys(Order)[1] !== "keys") {
				throw new InsightError("Order second key not keys");
			}
			if (Order["dir"] !== "UP" && Order["dir"] !== "DOWN") {
				throw new InsightError("dir in Order wrong");
			}
			if (!Columns.includes(Order["keys"][0])) {
				throw new InsightError("order key not in columns");
			}
		} else if (typeof Order === "string") {
			if (!Columns.includes(Order)) {
				throw new InsightError("Order string not in columns");
			}
		} else {
			throw new InsightError("Order type neither object nor string");
		}
	}
}
