import {InsightDataset, InsightError, InsightResult} from "./IInsightFacade";
import Decimal from "decimal.js";
import {ApplyHelper} from "./ApplyHelper";

export class TransformationHelper {

	private data: InsightResult[];
	private resultData: InsightResult[];
	private groupPart: any;
	private applyPart: any;

	constructor(data: InsightResult[],transformationPart: any, resultData: InsightResult[]) {
		this.data = data;
		this.groupPart = transformationPart.GROUP;
		this.applyPart = transformationPart.APPLY;
		this.resultData = resultData;
	}

	public helpTransform() {
		return this.groupHandler();
	}

	private groupHandler() {
		// To be implemented
		let groupElements = [];
		for (let groupElement of this.groupPart) {
			groupElements.push(groupElement.split("_")[1]);
		}
		this.resultData = this.groupHelper(groupElements);
		let applyHelper = new ApplyHelper(this.applyPart);
		return applyHelper.applyHandler(this.resultData);
	}

    // REFERENCE: https://stackoverflow.com/questions/14446511/most-efficient-method-to-groupby-on-an-array-of-objects
	private groupHelper(groupElements: any): any {
		const groupMap: any = new Map();
		for (let result of this.resultData) {
			let groupFields: any = [];
			for (let groupElement of groupElements) {
				groupFields.push(result[groupElement]);
			}
			let curGroup = groupMap.get(groupFields.toString());
			if (!curGroup) {
				groupMap.set(groupFields.toString(),[result]);
			} else {
				curGroup.push(result);
			}
		}
		let result: any[] = [];
		for(const group of groupMap.values()){
			result.push(group);
		}
		return result;
	}
}
