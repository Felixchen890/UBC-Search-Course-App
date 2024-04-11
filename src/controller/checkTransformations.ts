import {InsightDataset, InsightError} from "./IInsightFacade";

export class CheckTransformations {
	private transformationPart: any;
	private datasetIDs;
	private columns;

	constructor(transformationPart: any, datasetIDs: any[], columns: any) {
		this.transformationPart = transformationPart;
		this.datasetIDs = datasetIDs;
		this.columns = columns;
	}

	public handleTransformations() {
		if (!Object.keys(this.transformationPart).includes("GROUP")) {
			throw new InsightError("transformationPart does not contain GROUP");
		}

		if (!Object.keys(this.transformationPart).includes("APPLY")) {
			throw new InsightError("transformationPart does not contain APPLY");
		}

		if (Object.keys(this.transformationPart).length !== 2) {
			throw new InsightError("transformationPart wrong length");
		}
		let groupPart = this.transformationPart["GROUP"];
		let applyPart = this.transformationPart["APPLY"];
		let allTransformationKeys = [];
		for (let g of groupPart) {
			allTransformationKeys.push(g);
		}
		for (let a of applyPart) {
			let applyKey = Object.keys(a)[0];
			allTransformationKeys.push(applyKey);
		}
		for (let c of this.columns) {
			if (!allTransformationKeys.includes(c)) {
				throw new InsightError("Keys in COLUMNS must be in GROUP or APPLY when " +
					"TRANSFORMATIONS is present");
			}
		}
		this.handleGroupPart(groupPart);
		this.handleApplyPart(applyPart);
	}

	public handleGroupPart(groupPart: any) {
		for (let groupKey of groupPart) {
			if (!this.columns.includes(groupKey)) {
				throw new InsightError("group key not in columns");
			}
		}
	}

	private handleApplyPart(applyPart: any) {
		for (let c of applyPart) {
			if (!this.columns.includes(Object.keys(c)[0])) {
				throw new InsightError("apply key not in columns");
			}
		}
	}
}
